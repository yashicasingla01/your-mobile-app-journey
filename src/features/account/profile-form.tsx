import { useState } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateBMI, conditions, familyConditions, profileSchema, type ProfileInput } from './profile-schema';
import type { Tables } from '@/integrations/supabase/types';
export function ProfileForm({ initial, onSave, onCancel }: { initial?: Tables<'profiles'> | null; onSave: (data: ProfileInput) => Promise<void>; onCancel?: () => void }) {
 const [form, setForm] = useState({ name: initial?.name ?? '', age: initial?.age?.toString() ?? '', gender: initial?.gender ?? '', height_cm: initial?.height_cm?.toString() ?? '', weight_kg: initial?.weight_kg?.toString() ?? '', diet_type: initial?.diet_type ?? '', activity_level: initial?.activity_level ?? '' });
 const [selected, setSelected] = useState<string[]>(initial?.existing_conditions ?? []);
 const [family, setFamily] = useState<string[]>(initial?.family_history ?? []);
 const [busy, setBusy] = useState(false); const [error, setError] = useState('');
 const bmi = calculateBMI(Number(form.height_cm), Number(form.weight_kg), Number(form.age));
 function update(key: keyof typeof form, value: string) { setForm(prev => ({ ...prev, [key]: value })); }
 function toggleCondition(value: string) { setSelected(prev => value === 'none' ? prev.includes('none') ? [] : ['none'] : prev.includes(value) ? prev.filter(v => v !== value) : [...prev.filter(v => v !== 'none'), value]); }
 async function submit(e: React.FormEvent) {
  e.preventDefault(); setError('');
  const result = profileSchema.safeParse({ ...form, existing_conditions: selected, family_history: family, consent_accepted: true });
  if (!result.success) { setError(result.error.issues.map(i => `${i.path.join(' ')}: ${i.message}`).join('. ')); return; }
  setBusy(true); try { await onSave(result.data); } catch(e) { setError(e instanceof Error ? e.message : 'Could not save your profile.'); } finally { setBusy(false); }
 }
 return <form className="account-stack profile-form" onSubmit={submit}>
 <label className="field">Name<input required maxLength={100} autoComplete="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name"/></label>
 <div className="field-row"><label className="field">Age<input required type="number" min={1} max={120} value={form.age} onChange={e => update('age',e.target.value)}/></label><label className="field">Gender<select required value={form.gender} onChange={e => update('gender',e.target.value)}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></label></div>
 <div className="field-row"><label className="field">Height (cm)<input required type="number" min={50} max={250} step="0.1" value={form.height_cm} onChange={e => update('height_cm', e.target.value)}/></label><label className="field">Weight (kg)<input required type="number" min={10} max={400} step="0.1" value={form.weight_kg} onChange={e => update('weight_kg',e.target.value)}/></label></div>
 {bmi && <div className="bmi-result" aria-live="polite"><div><span>Your BMI</span><strong>{bmi.value}</strong></div><p>{bmi.category}<small>{Number(form.age) < 20 ? 'Adult BMI categories do not apply to children and teens.' : 'A general screening measure, not a diagnosis.'}</small></p></div>}
 <label className="field">Diet type<select required value={form.diet_type} onChange={e => update('diet_type', e.target.value)}><option value="">Select your diet</option><option value="veg">Vegetarian</option><option value="non-veg">Non-vegetarian</option><option value="vegan">Vegan</option></select></label>
 <label className="field">Activity level<select required value={form.activity_level} onChange={e => update('activity_level',e.target.value)}><option value="">Select your activity level</option><option value="sedentary">Sedentary</option><option value="light">Lightly active</option><option value="moderate">Moderately active</option><option value="active">Active</option></select></label>
 <fieldset className="selection-group"><legend>Existing conditions</legend><div className="checkbox-grid">{conditions.map(v => <label key={v}><input type="checkbox" checked={selected.includes(v)} onChange={() => toggleCondition(v)}/><span>{v}</span></label>)}</div></fieldset>
 <fieldset className="selection-group"><legend>Family history <span>(optional)</span></legend><div className="checkbox-grid">{familyConditions.map(v => <label key={v}><input type="checkbox" checked={family.includes(v)} onChange={() => setFamily(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev,v])}/><span>{v}</span></label>)}</div></fieldset>
 {error && <p role="alert" className="form-error">{error}</p>}
 <Button type="submit" disabled={busy}>{busy ? 'Saving…' : onCancel ? 'Save changes' : 'Start my journey'}{onCancel ? <Save/> : <ArrowRight/>}</Button>
 {onCancel && <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>Cancel</Button>}
 </form>;
}
