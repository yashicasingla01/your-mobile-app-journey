import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/components/myvita';
import { DailyCheckIn } from '@/features/log/daily-check-in';
export const Route = createFileRoute('/_authenticated/log')({head:()=>pageHead('Daily check-in'),component:DailyCheckIn});
