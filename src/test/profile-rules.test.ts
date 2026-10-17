import { describe, expect, it } from 'vitest';
import { calculateBMI, profileSchema } from '@/features/account/profile-schema';
const valid = { name: 'Test User', age: 30, gender: 'female', height_cm: 160, weight_kg: 60, diet_type: 'vegan', activity_level: 'moderate', existing_conditions: ['asthma'], family_history: ['heart disease'], consent_accepted: true };
describe('Health profile rules', () => {
 it('requires explicit consent', () => { expect(profileSchema.safeParse({ ...valid, consent_accepted: false }).success).toBe(false); });
 it('supports all requested diet types', () => { for (const diet_type of ['veg','non-veg','vegan']) expect(profileSchema.safeParse({ ...valid,diet_type }).success).toBe(true); expect(profileSchema.safeParse({ ...valid,diet_type:'unknown' }).success).toBe(false); });
 it('keeps None exclusive to actual conditions', () => { expect(profileSchema.safeParse({ ...valid,existing_conditions:['none','diabetes'] }).success).toBe(false); expect(profileSchema.safeParse({ ...valid,existing_conditions:['none'] }).success).toBe(true); });
 it('accepts all requested existing conditions and family history', () => { expect(profileSchema.safeParse({ ...valid,existing_conditions:['diabetes','hypertension','asthma','thyroid'], family_history:['diabetes','heart disease','hypertension'] }).success).toBe(true); expect(profileSchema.safeParse({ ...valid,family_history:['asthma'] }).success).toBe(false); });
 it('calculates BMI from cm and kg', () => { expect(calculateBMI(160,60,30)).toEqual({ value:23.4,category:'Healthy range' }); });
 it('does not use adult categories for a child', () => { expect(calculateBMI(160,60,12)?.category).toBe('Age-specific assessment needed'); });
 it('uses exact adult category thresholds', () => { expect(calculateBMI(200,74,30)?.category).toBe('Healthy range'); expect(calculateBMI(200,100,30)?.category).toBe('Overweight'); expect(calculateBMI(200,120,30)?.category).toBe('Obesity range'); });
});
