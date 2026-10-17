import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Heart, LockKeyhole, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/components/myvita';
import { ProfileForm } from '@/features/account/profile-form';
import { saveProfile } from '@/features/account/profile.functions';
import { useAccount } from '@/features/account/auth-state';
export const Route = createFileRoute('/_authenticated/onboarding')({ head: () => pageHead('Your health profile'), component: Onboarding });
function Onboarding() {
 const [step, setStep] = useState(1); const [consent, setConsent] = useState(false);
 const save = useServerFn(saveProfile); const navigate = useNavigate(); const router = useRouter(); const queryClient = useQueryClient(); const { signOut } = useAccount(); const [error,setError]=useState('');
 return <main className="account-page"><div className="onboarding-progress"><span className="progress-current"/> <span className={step === 2 ? 'progress-current' : ''}/></div><p className="eyebrow">STEP {step} OF 2 · {step === 1 ? 'YOUR PRIVACY' : 'ABOUT YOU'}</p><h1>{step === 1 ? 'Your health. Your choice.' : 'Let’s get to know you.'}</h1>
 {step === 1 ? <><p className="account-subtitle">Before we begin, here’s how your information is used.</p><div className="consent-points"><div><Heart/><p><strong>Care that fits you</strong>Your health details help personalize wellness guidance.</p></div><div><LockKeyhole/><p><strong>Private by design</strong>Your profile is saved in Supabase and is accessible only through your account.</p></div><div><ShieldCheck/><p><strong>You stay in control</strong>You can edit your profile or delete your saved health data at any time.</p></div></div><p className="consent-disclaimer">MyVita gives guidance, not medical diagnosis.</p><p className="consent-detail">MyVita is not an emergency service or a substitute for professional medical care. Google sign-in uses your Google account identity; health details are collected separately after your consent.</p><label className="consent-checkbox"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/><span>I agree to MyVita storing and using my health profile to personalize wellness guidance.</span></label><Button className="w-full" disabled={!consent} onClick={() => setStep(2)}>Agree and continue <ArrowRight/></Button></> : <><p className="account-subtitle">A few details to make this space yours.</p><Button variant="ghost" size="sm" className="back-consent" onClick={() => setStep(1)}><ArrowLeft/> Review consent</Button><ProfileForm onSave={async data => { if (!consent) throw new Error('Please agree to data use first.'); await save({ data }); queryClient.removeQueries({ queryKey: ['profile'] }); await router.invalidate(); await navigate({ to: '/', replace: true }); }}/></>}
 <Button variant="ghost" className="w-full mt-4" onClick={() => { void signOut().catch(e => setError(e.message)); }}>Sign out</Button>{error && <p className="form-error" role="alert">{error}</p>}
 </main>;
}
