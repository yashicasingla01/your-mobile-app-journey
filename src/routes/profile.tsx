import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage, pageHead } from '@/components/myvita';
export const Route = createFileRoute('/profile')({ head: () => pageHead('Profile'), component: Page });
function Page() { return <PlaceholderPage page="Profile"/>; }
