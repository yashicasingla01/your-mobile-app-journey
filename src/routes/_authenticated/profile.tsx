import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pencil, Trash2, LogOut, UserRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/components/myvita';
import { useAccount } from '@/features/account/auth-state';
import { getProfile, saveProfile, deleteProfile } from '@/features/account/profile.functions';
import { ProfileForm } from '@/features/account/profile-form';
import { calculateBMI } from '@/features/account/profile-schema';
export const Route = createFileRoute('/_authenticated/profile')({ head: () => pageHead('Profile'), component: ProfilePage });
function ProfilePage() {
 const fetchProfile = useServerFn(getProfile); const save = useServerFn(saveProfile); const remove = useServerFn(deleteProfile);
 const { user, signOut } = useAccount(); const queryClient = useQueryClient(); const router = useRouter();
 const { data: profile, isPending, error: loadError } = useQuery({ queryKey: ['profile',user?.id], queryFn: () => fetchProfile() });
 const [edit,setEdit] = useState(false); const [confirm,setConfirm] = useState(false); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [message,setMessage]=useState('');
 async function deleteData() { setBusy(true); setError(''); try { await remove(); await queryClient.cancelQueries(); queryClient.clear(); await router.invalidate(); } catch(e) { setError(e instanceof Error ? e.message : 'Could not delete your data.'); } finally { setBusy(false); } }
 if (isPending) return <main className="account-page"><p role="status">Loading your profile…</p></main>;
 if (loadError || !profile) return <main className="account-page"><h1>Your profile</h1><p role="alert">Your profile couldn’t be loaded.</p><Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}>Try again</Button></main>;
 const bmi = calculateBMI(profile.height_cm ?? 0,profile.weight_kg ?? 0,profile.age ?? 0);
 const rows = [['Age',profile.age],['Gender',profile.gender?.replaceAll('-',' ')],['Height',`${profile.height_cm} cm`],['Weight',`${profile.weight_kg} kg`],['Diet',profile.diet_type === 'veg' ? 'Vegetarian' : profile.diet_type === 'non-veg' ? 'Non-vegetarian' : 'Vegan'],['Activity level',profile.activity_level],['Existing conditions',profile.existing_conditions.join(', ') || 'None selected'],['Family history',profile.family_history.join(', ') || 'None selected']];
 return <main className="account-page"><div className="profile-title"><div><p className="eyebrow">YOUR WELLNESS SPACE</p><h1>{edit ? 'Edit your profile.' : 'Your profile.'}</h1></div>{!edit && <Button variant="outline" size="sm" onClick={() => {setEdit(true);setMessage('');}}><Pencil/> Edit</Button>}</div>
 {edit ? <ProfileForm initial={profile} onCancel={() => setEdit(false)} onSave={async data => { const saved = await save({ data }); queryClient.setQueryData(['profile',user?.id],saved); setEdit(false);setMessage('Your profile has been updated.'); await router.invalidate(); }}/> : <><div className="profile-identity"><span className="profile-avatar"><UserRound size={30}/></span><div><h2>{profile.name}</h2><p>{user?.email}</p></div></div>{bmi && <div className="bmi-result"><div><span>Your BMI</span><strong>{bmi.value}</strong></div><p>{bmi.category}<small>A screening measure, not a diagnosis.</small></p></div>}<dl className="profile-details">{rows.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="privacy-caption"><ShieldCheck size={15}/> Data-use consent accepted{profile.consent_at ? ` · ${new Date(profile.consent_at).toLocaleDateString('en-GB',{ timeZone:'UTC' })}` : ''}</p>
 {message && <p className="form-success" role="status">{message}</p>}
 <div className="profile-actions"><Button variant="outline" onClick={() => { void signOut().catch(e => setError(e.message)); }}><LogOut/> Sign out</Button><Button variant="ghost" className="text-destructive" onClick={() => setConfirm(true)}><Trash2/> Delete my data</Button></div></>}
 {confirm && <div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="delete-dialog"><h2 id="delete-title">Delete your health data?</h2><p>This permanently removes your health profile and consent record from MyVita. Your sign-in account remains, and you’ll return to onboarding. This can’t be undone.</p><Button variant="destructive" disabled={busy} onClick={deleteData}>{busy ? 'Deleting…' : 'Delete my data'}</Button><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Keep my data</Button>{error && <p className="form-error" role="alert">{error}</p>}</section></div>}
 {error && !confirm && <p className="form-error" role="alert">{error}</p>}</main>;
}
