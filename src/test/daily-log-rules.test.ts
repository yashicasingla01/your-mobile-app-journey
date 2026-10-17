import { describe,expect,it } from 'vitest';
import { dailyLogSchema,dateInZone,isSameDayEditable,shiftDate,streakCount } from '@/features/log/log-rules';
const valid={time_zone:'Asia/Kolkata',sleep_hours:7,sleep_quality:3,water_glasses:5,steps:6000,exercise_minutes:30,meals:'normal',sugar_junk:false,stress_level:3,mood:4};
describe('Daily check-in rules',()=>{
 it('limits sleep to 0–12 hours',()=>{expect(dailyLogSchema.safeParse({...valid,sleep_hours:0}).success).toBe(true);expect(dailyLogSchema.safeParse({...valid,sleep_hours:12}).success).toBe(true);expect(dailyLogSchema.safeParse({...valid,sleep_hours:12.5}).success).toBe(false);});
 for(const key of ['sleep_quality','stress_level','mood'])it(`limits ${key} to 1–5`,()=>{expect(dailyLogSchema.safeParse({...valid,[key]:0}).success).toBe(false);expect(dailyLogSchema.safeParse({...valid,[key]:6}).success).toBe(false);expect(dailyLogSchema.safeParse({...valid,[key]:5}).success).toBe(true);});
 it('accepts only light, normal or heavy meals',()=>{for(const meals of ['light','normal','heavy'])expect(dailyLogSchema.safeParse({...valid,meals}).success).toBe(true);expect(dailyLogSchema.safeParse({...valid,meals:'other'}).success).toBe(false);});
 it('uses the user’s local calendar date',()=>{expect(dateInZone('Asia/Kolkata',new Date('2026-10-17T20:00:00Z'))).toBe('2026-10-18');});
 it('allows same-day edits but not earlier dates',()=>{const now=new Date('2026-10-17T12:00:00Z');expect(isSameDayEditable('2026-10-17','Asia/Kolkata',now)).toBe(true);expect(isSameDayEditable('2026-10-16','Asia/Kolkata',now)).toBe(false);});
 it('counts a streak from today or yesterday without counting duplicates',()=>{expect(streakCount(['2026-10-17','2026-10-16','2026-10-16','2026-10-15'],'2026-10-17')).toBe(3);expect(streakCount(['2026-10-16','2026-10-15'],'2026-10-17')).toBe(2);expect(streakCount(['2026-10-15'],'2026-10-17')).toBe(0);});
 it('spans month boundaries',()=>{expect(shiftDate('2026-11-01',-1)).toBe('2026-10-31');});
});
