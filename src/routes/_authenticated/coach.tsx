import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage, pageHead } from '@/components/myvita';
export const Route = createFileRoute('/_authenticated/coach')({ head: () => pageHead('Coach'), component: Page });
function Page() { return <PlaceholderPage page="Coach"/>; }
