import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { profileSchema } from './profile-schema';
export const getProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
 const { data, error } = await context.supabase.from('profiles').select('*').eq('id', context.userId).maybeSingle();
 if (error) throw new Error('Your profile could not be loaded. Please try again.');
 return data;
});
export const saveProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => profileSchema.parse(input)).handler(async ({ data, context }) => {
 const { data: saved, error } = await context.supabase.from('profiles').upsert({ ...data, id: context.userId, onboarding_completed: true }).select('*').single();
 if (error) throw new Error('Your profile could not be saved. Please try again.');
 return saved;
});
export const deleteProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
 const { error } = await context.supabase.from('profiles').delete().eq('id', context.userId);
 if (error) throw new Error('Your data could not be deleted. Please try again.');
 return { deleted: true };
});
