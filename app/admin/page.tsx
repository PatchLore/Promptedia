import { supabase, PromptRow } from '@/lib/supabase/client';
import AdminTable from '@/components/AdminTable';
import Link from 'next/link';
import AdminAuthCheck from '@/components/AdminAuthCheck';

export const metadata = {
  title: 'Admin Dashboard - On Point Prompt',
  description: 'Manage prompts',
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Fetch all prompts
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts:', error);
  }

  return (
    <AdminAuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all prompts in the database
            </p>
          </div>
          <Link
            href="/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            + New Prompt
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <AdminTable prompts={(prompts as PromptRow[]) || []} />
        </div>
      </div>
    </AdminAuthCheck>
  );
}