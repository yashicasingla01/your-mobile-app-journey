import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage, pageHead } from '@/components/myvita';
export const Route = createFileRoute('/vitals')({ head: () => pageHead('Vitals'), component: Page });
function Page() { return <PlaceholderPage page="Vitals"/>; }
