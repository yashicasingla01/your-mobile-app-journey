import { z } from 'zod';
export const conditions = ['diabetes', 'hypertension', 'asthma', 'thyroid', 'none'] as const;
export const familyConditions = ['diabetes', 'heart disease', 'hypertension'] as const;
export const profileSchema = z.object({
 name: z.string().trim().min(1, 'Enter your name').max(100),
 age: z.coerce.number().int().min(1).max(120),
 gender: z.enum(['female','male','other','prefer-not-to-say']),
 height_cm: z.coerce.number().min(50).max(250),
 weight_kg: z.coerce.number().min(10).max(400),
 diet_type: z.enum(['veg','non-veg','vegan']),
 activity_level: z.enum(['sedentary','light','moderate','active']),
 existing_conditions: z.array(z.enum(conditions)).max(5).refine(v => !v.includes('none') || v.length === 1, 'Select None on its own'),
 family_history: z.array(z.enum(familyConditions)).max(3),
 consent_accepted: z.literal(true),
});
export type ProfileInput = z.infer<typeof profileSchema>;
export function calculateBMI(height: number, weight: number, age: number) {
 if (height < 50 || height > 250 || weight < 10 || weight > 400) return null;
 const value = weight / ((height / 100) ** 2);
 const category = age < 20 ? 'Age-specific assessment needed' : value < 18.5 ? 'Underweight' : value < 25 ? 'Healthy range' : value < 30 ? 'Overweight' : 'Obesity range';
 return { value: Number(value.toFixed(1)), category };
}
