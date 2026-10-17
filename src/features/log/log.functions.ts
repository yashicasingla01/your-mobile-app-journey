import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { dailyLogSchema, dateInZone, shiftDate, streakCount, zoneSchema } from './log-rules';
export const getDailyLogs = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => zoneSchema.parse(input)).handler(async ({ data:zone, context }) => {
 const today = dateInZone(zone);
 const { data: history, error } = await context.supabase.from('daily_logs').select('*').eq('user_id',context.userId).gte('log_date',shiftDate(today,-6)).lte('log_date',today).order('log_date',{ascending:false});
 if(error) throw new Error('Your check-ins could not be loaded. Try again.');
 const dates:string[]=[];
 // Paginate explicitly so streaks do not silently stop at Supabase's row limit.
 for(let offset=0;;offset+=1000) {
  const {data:batch,error:batchError}=await context.supabase.from('daily_logs').select('log_date').eq('user_id',context.userId).lte('log_date',today).order('log_date',{ascending:false}).range(offset,offset+999);
  if(batchError) throw new Error('Your streak could not be loaded. Try again.');
  dates.push(...(batch??[]).map(row=>row.log_date));
  if(!batch || batch.length<1000) break;
 }
 return {today,history:history??[],streak:streakCount(dates,today)};
});
export const saveDailyLog = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => dailyLogSchema.parse(input)).handler(async ({data,context}) => {
 const logDate=dateInZone(data.time_zone);
 const {data: existing,error:lookupError}=await context.supabase.from('daily_logs').select('time_zone').eq('user_id',context.userId).eq('log_date',logDate).maybeSingle();
 if(lookupError) throw new Error('Could not check today’s entry. Try again.');
 const {data:saved,error}=await context.supabase.from('daily_logs').upsert({...data,time_zone:existing?.time_zone??data.time_zone,user_id:context.userId,log_date:logDate},{onConflict:'user_id,log_date'}).select('*').single();
 if(error) throw new Error('Could not save this check-in. Only today’s entry can be edited. Please try again.');
 return saved;
});
