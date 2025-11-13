'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deletePack } from '@/app/actions-packs';
import { getImageUrl } from '@/lib/getImageUrl';
import { useToast } from '@/components/ToastProvider';

type Pack = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  image_url: string | null;
  category: string | null;
};

type PacksTableProps = {
  packs: Pack[];
};

export default function PacksTable({ packs: initialPacks }: PacksTableProps) {
  const [packs, setPacks] = useState(initialPacks);
  const { showToast } = useToast();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also remove all prompt assignments.`)) {
      return;
    }

    try {
      await deletePack(id);
      setPacks(packs.filter((p) => p.id !== id));
      showToast('Pack deleted successfully ✅', 'success');
    } catch (error: any) {
      console.error('Error deleting pack:', error);
      showToast(`Failed to delete pack: ${error.message}`, 'error');
    }
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (typeof price === 'number') {
      return `£${price}`;
    }
    return 'Free';
  };

  if (packs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No packs found.</p>
        <Link
          href="/admin/packs/new"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Create your first pack →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold">Image</th>
            <th className="text-left py-3 px-4 font-semibold">Title</th>
            <th className="text-left py-3 px-4 font-semibold">Slug</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-left py-3 px-4 font-semibold">Price</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {packs.map((pack) => (
            <tr
              key={pack.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="py-3 px-4">
                <img
                  src={getImageUrl(pack.image_url)}
                  alt={pack.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </td>
              <td className="py-3 px-4 font-medium">{pack.title}</td>
              <td className="py-3 px-4">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {pack.slug}
                </code>
              </td>
              <td className="py-3 px-4">{pack.category || '—'}</td>
              <td className="py-3 px-4">{formatPrice(pack.price)}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/packs/${pack.id}`}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(pack.id, pack.title)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

