import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage, pageHead } from '@/components/myvita';
export const Route = createFileRoute('/log')({ head: () => pageHead('Log'), component: Page });
function Page() { return <PlaceholderPage page="Log"/>; }
