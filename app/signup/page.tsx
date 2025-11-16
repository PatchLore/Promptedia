import { redirect } from 'next/navigation';

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ 'early-access'?: string }>;
}) {
  // Redirect to waitlist page (handles old /signup?early-access=true links)
  redirect('/waitlist');
}

