import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { pageHead, HeartLogo } from '@/components/myvita';
import { useAccount } from '@/features/account/auth-state';
export const Route = createFileRoute('/auth')({ head: () => pageHead('Sign in'), component: AuthPage });
function AuthPage() {
 const [signup, setSignup] = useState(false);
 const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
 const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
 const navigate = useNavigate(); const { user, signOut } = useAccount();
 async function submit(e: React.FormEvent) {
  e.preventDefault(); setError(''); setMessage('');
  const valid = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8, 'Use at least 8 characters').max(128) }).safeParse({ email, password });
  if (!valid.success) { setError(valid.error.issues[0]?.message ?? 'Check your details'); return; }
  setBusy(true);
  try {
   const result = signup ? await supabase.auth.signUp({ ...valid.data, options: { emailRedirectTo: window.location.origin + '/auth' } }) : await supabase.auth.signInWithPassword(valid.data);
   if (result.error) throw result.error;
   if (result.data.session) await navigate({ to: '/onboarding' });
   else setMessage('Check your email and confirm your account before signing in.');
  } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.'); } finally { setBusy(false); }
 }
 async function google() {
  setBusy(true); setError('');
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth' } });
  if (error) { setError(error.message); setBusy(false); }
 }
 return <main className="account-page"><HeartLogo className="account-logo"/><p className="eyebrow">YOUR HEALTH, UNDERSTOOD.</p><h1>{user ? 'Welcome back.' : signup ? 'A healthier beginning.' : 'Welcome to MyVita.'}</h1><p className="account-subtitle">A little space for your wellbeing.</p>
 {user ? <div className="account-stack"><Button onClick={() => navigate({ to: '/onboarding' })}>Continue to MyVita <ArrowRight/></Button><Button variant="outline" onClick={() => { void signOut().catch(e => setError(e.message)); }}>Sign out</Button></div> : <>
 <div className="auth-modes"><Button variant={!signup ? 'secondary' : 'ghost'} onClick={() => { setSignup(false); setError(''); setMessage(''); }}>Sign in</Button><Button variant={signup ? 'secondary' : 'ghost'} onClick={() => { setSignup(true); setError(''); setMessage(''); }}>Create account</Button></div>
 <Button variant="outline" className="google-button" disabled={busy} onClick={google}><span className="google-g">G</span> Continue with Google</Button><div className="auth-divider">or with email</div>
 <form onSubmit={submit} className="account-stack"><label className="field">Email<input type="email" autoComplete="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="field">Password<input type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"/></label><Button type="submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}<Mail/></Button></form>
 </>}{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<p className="privacy-caption"><ShieldCheck size={15}/> Your health profile stays private to you.</p></main>;
}
