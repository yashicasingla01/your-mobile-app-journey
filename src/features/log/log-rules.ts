import { z } from 'zod';
export const zoneSchema = z.string().max(100).refine(value => { try { new Intl.DateTimeFormat('en-CA',{timeZone:value}).format(); return true; } catch { return false; } }, 'Invalid time zone');
export const dailyLogSchema = z.object({ time_zone: zoneSchema, sleep_hours: z.number().min(0).max(12), sleep_quality: z.number().int().min(1).max(5), water_glasses: z.number().int().min(0).max(100), steps: z.number().int().min(0).max(200000), exercise_minutes: z.number().int().min(0).max(1440), meals: z.enum(['light','normal','heavy']), sugar_junk: z.boolean(), stress_level: z.number().int().min(1).max(5), mood: z.number().int().min(1).max(5) });
export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export function dateInZone(timeZone: string, now = new Date()) { const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric',month:'2-digit',day:'2-digit' }).formatToParts(now); return ['year','month','day'].map(t => parts.find(p => p.type === t)?.value).join('-'); }
export function shiftDate(day: string, offset: number) { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+offset); return date.toISOString().slice(0,10); }
export function streakCount(dates: string[], today: string) { const set = new Set(dates); let cursor = set.has(today) ? today : shiftDate(today,-1); let count=0; while(set.has(cursor)) { count++; cursor=shiftDate(cursor,-1); } return count; }
export function isSameDayEditable(logDate: string, zone: string, now: Date) { return logDate === dateInZone(zone,now); }
