import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage, pageHead } from '@/components/myvita';
export const Route = createFileRoute('/_authenticated/')({ head: () => pageHead('Home'), component: Index });
function Index() { return <PlaceholderPage page="Home"/>; }
