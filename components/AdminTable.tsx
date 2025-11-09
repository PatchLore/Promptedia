'use client';

import { useState } from 'react';
import { updatePrompt, deletePrompt } from '@/app/actions';
import { useToast } from './ToastProvider';
import Image from 'next/image';
import UnsplashImageButton from './UnsplashImageButton';
import { PromptRow } from '@/lib/supabase/client';

type AdminTableProps = {
  prompts: PromptRow[];
};

export default function AdminTable({ prompts: initialPrompts }: AdminTableProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Partial<PromptRow>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const startEdit = (prompt: PromptRow) => {
    setEditingId(prompt.id);
    setEditingFields({
      title: prompt.title,
      category: prompt.category,
      type: prompt.type,
      example_url: prompt.example_url,
      is_pro: prompt.is_pro,
      is_public: prompt.is_public,
      prompt: prompt.prompt,
      model: prompt.model,
      tags: prompt.tags,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingFields({});
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      await updatePrompt(id, editingFields);
      // Update local state
      setPrompts(prompts.map(p => 
        p.id === id ? { ...p, ...editingFields } : p
      ));
      setEditingId(null);
      setEditingFields({});
      showToast('Prompt updated successfully! ✅', 'success');
    } catch (error) {
      console.error('Error updating prompt:', error);
      showToast('Failed to update prompt', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string | null) => {
    if (!confirm(`Are you sure you want to delete "${title || 'this prompt'}"?`)) {
      return;
    }

    try {
      await deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      showToast('Prompt deleted ✅', 'success');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showToast('Failed to delete prompt', 'error');
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No prompts found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table View */}
      <table className="hidden md:table w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold">Title</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-left py-3 px-4 font-semibold">Type</th>
            <th className="text-left py-3 px-4 font-semibold">Example URL</th>
            <th className="text-left py-3 px-4 font-semibold">Pro?</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((prompt) => {
            const isEditing = editingId === prompt.id;
            return (
              <tr
                key={prompt.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingFields.title || ''}
                      onChange={(e) => setEditingFields({ ...editingFields, title: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="font-medium">{prompt.title || '(Untitled)'}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <select
                      value={editingFields.category || ''}
                      onChange={(e) => setEditingFields({ ...editingFields, category: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select...</option>
                      <option value="Art">Art</option>
                      <option value="Music">Music</option>
                      <option value="Writing">Writing</option>
                      <option value="Business">Business</option>
                      <option value="Coding">Coding</option>
                    </select>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                      {prompt.category || '-'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <select
                      value={editingFields.type || ''}
                      onChange={(e) => setEditingFields({ ...editingFields, type: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select...</option>
                      <option value="image">Image</option>
                      <option value="music">Music</option>
                      <option value="text">Text</option>
                    </select>
                  ) : (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                      {prompt.type || '-'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <div className="space-y-2 min-w-[300px]">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editingFields.example_url || ''}
                          onChange={(e) => setEditingFields({ ...editingFields, example_url: e.target.value })}
                          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          placeholder="https://..."
                        />
                        <UnsplashImageButton
                          title={editingFields.title || ''}
                          category={editingFields.category || ''}
                          onImageSelected={(url) => {
                            setEditingFields({ ...editingFields, example_url: url });
                          }}
                        />
                      </div>
                      {editingFields.example_url && editingFields.example_url.includes('unsplash.com') && (
                        <div className="relative w-full h-32 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image
                            src={editingFields.example_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 300px"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                      {prompt.example_url ? (
                        <a
                          href={prompt.example_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {prompt.example_url.substring(0, 40)}...
                        </a>
                      ) : (
                        '-'
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingFields.is_pro || false}
                      onChange={(e) => setEditingFields({ ...editingFields, is_pro: e.target.checked })}
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className={prompt.is_pro ? 'text-green-600' : 'text-gray-400'}>
                      {prompt.is_pro ? '✓' : '✗'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(prompt.id)}
                        disabled={isSaving}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(prompt)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id, prompt.title)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {prompts.map((prompt) => {
          const isEditing = editingId === prompt.id;
          return (
            <div
              key={prompt.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
              {prompt.example_url && prompt.example_url.includes('unsplash.com') && (
                <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={prompt.example_url}
                    alt={prompt.title || 'Preview'}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingFields.title || ''}
                      onChange={(e) => setEditingFields({ ...editingFields, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <div className="font-semibold mt-1">{prompt.title || '(Untitled)'}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Category</label>
                    {isEditing ? (
                      <select
                        value={editingFields.category || ''}
                        onChange={(e) => setEditingFields({ ...editingFields, category: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Select...</option>
                        <option value="Art">Art</option>
                        <option value="Music">Music</option>
                        <option value="Writing">Writing</option>
                        <option value="Business">Business</option>
                        <option value="Coding">Coding</option>
                      </select>
                    ) : (
                      <div className="mt-1">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                          {prompt.category || '-'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Type</label>
                    {isEditing ? (
                      <select
                        value={editingFields.type || ''}
                        onChange={(e) => setEditingFields({ ...editingFields, type: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Select...</option>
                        <option value="image">Image</option>
                        <option value="music">Music</option>
                        <option value="text">Text</option>
                      </select>
                    ) : (
                      <div className="mt-1">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                          {prompt.type || '-'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Example URL</label>
                    <div className="space-y-2 mt-1">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editingFields.example_url || ''}
                          onChange={(e) => setEditingFields({ ...editingFields, example_url: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          placeholder="https://..."
                        />
                        <UnsplashImageButton
                          title={editingFields.title || ''}
                          category={editingFields.category || ''}
                          onImageSelected={(url) => {
                            setEditingFields({ ...editingFields, example_url: url });
                          }}
                        />
                      </div>
                      {editingFields.example_url && editingFields.example_url.includes('unsplash.com') && (
                        <div className="relative w-full h-32 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image
                            src={editingFields.example_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 300px"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Pro:</label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editingFields.is_pro || false}
                        onChange={(e) => setEditingFields({ ...editingFields, is_pro: e.target.checked })}
                        className="w-4 h-4"
                      />
                    ) : (
                      <span className={prompt.is_pro ? 'text-green-600' : 'text-gray-400'}>
                        {prompt.is_pro ? '✓ Yes' : '✗ No'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Public:</label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editingFields.is_public !== undefined ? editingFields.is_public : prompt.is_public}
                        onChange={(e) => setEditingFields({ ...editingFields, is_public: e.target.checked })}
                        className="w-4 h-4"
                      />
                    ) : (
                      <span className={prompt.is_public ? 'text-green-600' : 'text-gray-400'}>
                        {prompt.is_public ? '✓ Yes' : '✗ No'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(prompt.id)}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(prompt)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id, prompt.title)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Total: {prompts.length} prompts
      </div>
    </div>
  );
}

