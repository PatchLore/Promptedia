'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updatePack, addPromptToPack, removePromptFromPack } from '@/app/actions-packs';
import { slugifyTitle } from '@/lib/slug';
import ImageUploader from './ImageUploader';
import { useToast } from '@/components/ToastProvider';
import { supabase } from '@/lib/supabase/client';

const categories = ['writing', 'art', 'music', 'business', 'coding', 'productivity'];

type Pack = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
};

type Prompt = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
};

type EditPackFormProps = {
  pack: Pack;
  assignedPrompts: Prompt[];
};

export default function EditPackForm({ pack, assignedPrompts: initialAssignedPrompts }: EditPackFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [assignedPrompts, setAssignedPrompts] = useState(initialAssignedPrompts);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Prompt[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    title: pack.title,
    slug: pack.slug,
    description: pack.description || '',
    category: pack.category || '',
    price: pack.price?.toString() || '',
    image_url: pack.image_url || '',
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: formData.slug || slugifyTitle(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updatePack(pack.id, {
        title: formData.title.trim(),
        slug: formData.slug.trim() || slugifyTitle(formData.title),
        description: formData.description.trim() || null,
        category: formData.category || null,
        price: formData.price ? parseFloat(formData.price) : null,
        image_url: formData.image_url || null,
      });

      showToast('Pack updated successfully! ✅', 'success');
      router.push('/admin/packs');
    } catch (error: any) {
      console.error('Error updating pack:', error);
      showToast(`Failed to update pack: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchPrompts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, title, slug, category')
        .eq('is_public', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      // Filter out already assigned prompts
      const assignedIds = new Set(assignedPrompts.map((p) => p.id));
      setSearchResults((data || []).filter((p) => !assignedIds.has(p.id)));
    } catch (error) {
      console.error('Error searching prompts:', error);
      showToast('Failed to search prompts', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearchPrompts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAddPrompt = async (promptId: string) => {
    try {
      await addPromptToPack(pack.id, promptId);
      const prompt = searchResults.find((p) => p.id === promptId);
      if (prompt) {
        setAssignedPrompts([...assignedPrompts, prompt]);
        setSearchResults(searchResults.filter((p) => p.id !== promptId));
        setSearchQuery('');
        showToast('Prompt added to pack ✅', 'success');
      }
    } catch (error: any) {
      console.error('Error adding prompt:', error);
      showToast(`Failed to add prompt: ${error.message}`, 'error');
    }
  };

  const handleRemovePrompt = async (promptId: string) => {
    try {
      await removePromptFromPack(pack.id, promptId);
      setAssignedPrompts(assignedPrompts.filter((p) => p.id !== promptId));
      showToast('Prompt removed from pack ✅', 'success');
    } catch (error: any) {
      console.error('Error removing prompt:', error);
      showToast(`Failed to remove prompt: ${error.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Pack Details Form */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pack Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price (£)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <ImageUploader
              bucketName="packs"
              currentUrl={formData.image_url}
              onUpload={(url) => setFormData({ ...formData, image_url: url })}
              label="Pack Image"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      {/* Assigned Prompts */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Prompts in this Pack ({assignedPrompts.length})
        </h2>
        {assignedPrompts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No prompts assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assignedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{prompt.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {prompt.category || 'Uncategorized'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePrompt(prompt.id)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Prompts */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Add Prompts to this Pack
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by title or description..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          {isSearching && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
          )}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{prompt.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {prompt.category || 'Uncategorized'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddPrompt(prompt.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No prompts found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

