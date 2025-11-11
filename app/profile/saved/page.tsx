"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PromptCard from "@/components/PromptCard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SavedPromptRow = {
  prompt_id: string | null;
  prompts: {
    id: string;
    title: string | null;
    description: string | null;
    tags: string[] | null;
    slug: string | null;
    thumbnail_url: string | null;
    audio_preview_url: string | null;
  } | null;
};

type PromptCollection = {
  id: string;
  name: string | null;
  description: string | null;
  created_at: string | null;
};

export default function SavedPromptsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptRow[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [collections, setCollections] = useState<PromptCollection[]>([]);
  const [collectionMembership, setCollectionMembership] = useState<Map<string, Set<string>>>(() => new Map());
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState(false);
  const [collectionsModalLoading, setCollectionsModalLoading] = useState(false);

  useEffect(() => {
    const loadSavedPrompts = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message ?? "Unable to verify session.");
        setLoading(false);
        return;
      }

      if (!session) {
        setIsAuthenticated(false);
        setCollections([]);
        setCollectionMembership(new Map());
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAccessToken(session.access_token ?? null);

      const { data, error: savedError } = await supabase
        .from("saved_prompts")
        .select("prompt_id, prompts(*)")
        .eq("user_id", session.user.id);

      if (savedError) {
        setError(savedError.message ?? "Unable to load saved prompts.");
        setSavedPrompts([]);
        setSavedIds(new Set());
      } else {
        const rows: SavedPromptRow[] = Array.isArray(data)
          ? data.map((row: any) => ({
              prompt_id: row.prompt_id ?? null,
              prompts: row.prompts
                ? {
                    id: row.prompts.id,
                    title: row.prompts.title ?? null,
                    description: row.prompts.description ?? null,
                    tags: Array.isArray(row.prompts.tags) ? row.prompts.tags : null,
                    slug: row.prompts.slug ?? null,
                    thumbnail_url: row.prompts.thumbnail_url ?? null,
                    audio_preview_url: row.prompts.audio_preview_url ?? null,
                  }
                : null,
            }))
          : [];
        setSavedPrompts(rows);
        const ids = rows
          .map((row) => row.prompts?.id)
          .filter((value): value is string => typeof value === "string");
        setSavedIds(new Set(ids));
      }

      const { data: collectionsData, error: collectionsError } = await supabase
        .from("prompt_collections")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        console.warn("Failed to load collections", collectionsError);
        setCollections([]);
      } else {
        setCollections((collectionsData as PromptCollection[]) ?? []);
      }

      setLoading(false);
    };

    loadSavedPrompts();
  }, []);

  const handleToggleSave = useCallback(
    async (promptId: string, shouldSave: boolean) => {
      if (!promptId || !accessToken) {
        return;
      }

      const previousIds = new Set(savedIds);
      const previousPrompts = [...savedPrompts];

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (shouldSave) {
          next.add(promptId);
        } else {
          next.delete(promptId);
        }
        return next;
      });

      if (!shouldSave) {
        setSavedPrompts((prev) => prev.filter((row) => row.prompts?.id !== promptId));
      }

      const endpoint = shouldSave ? "/api/saved-prompts/create" : "/api/saved-prompts/delete";
      const method = shouldSave ? "POST" : "DELETE";

      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ prompt_id: promptId }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

      } catch (err) {
        console.warn("Failed to toggle saved prompt", err);
        setSavedIds(previousIds);
        setSavedPrompts(previousPrompts);
      }
    },
    [accessToken, savedIds, savedPrompts],
  );

  const openCollectionsModal = useCallback(
    async (promptId: string) => {
      if (!isAuthenticated) {
        console.warn("You must be signed in to manage collections.");
        return;
      }

      setActivePromptId(promptId);
      setIsCollectionsModalOpen(true);

      if (collectionMembership.has(promptId)) {
        return;
      }

      setCollectionsModalLoading(true);
      const { data, error } = await supabase
        .from("prompt_collection_items")
        .select("collection_id")
        .eq("prompt_id", promptId);

      if (error) {
        console.warn("Failed to load collection memberships", error);
      } else {
        const ids = (data ?? [])
          .map((row) => row.collection_id)
          .filter((value): value is string => typeof value === "string");
        setCollectionMembership((prev) => {
          const next = new Map(prev);
          next.set(promptId, new Set(ids));
          return next;
        });
      }
      setCollectionsModalLoading(false);
    },
    [collectionMembership, isAuthenticated],
  );

  const closeCollectionsModal = useCallback(() => {
    setIsCollectionsModalOpen(false);
    setActivePromptId(null);
    setCollectionsModalLoading(false);
  }, []);

  const handleCollectionToggle = useCallback(
    async (collectionId: string, shouldAdd: boolean) => {
      if (!activePromptId || !isAuthenticated) {
        return;
      }

      const previous = collectionMembership.get(activePromptId);
      const previousSet = new Set(previous ?? []);

      setCollectionMembership((prev) => {
        const next = new Map(prev);
        const updated = new Set(prev.get(activePromptId) ?? []);
        if (shouldAdd) {
          updated.add(collectionId);
        } else {
          updated.delete(collectionId);
        }
        next.set(activePromptId, updated);
        return next;
      });

      try {
        if (shouldAdd) {
          const { error } = await supabase
            .from("prompt_collection_items")
            .insert({
              collection_id: collectionId,
              prompt_id: activePromptId,
            })
            .select("collection_id")
            .maybeSingle();

          if (error && error.code !== "23505") {
            throw error;
          }
        } else {
          const { error } = await supabase
            .from("prompt_collection_items")
            .delete()
            .eq("collection_id", collectionId)
            .eq("prompt_id", activePromptId);

          if (error) {
            throw error;
          }
        }
      } catch (err) {
        console.warn("Failed to update collection membership", err);
        setCollectionMembership((prev) => {
          const next = new Map(prev);
          next.set(activePromptId, previousSet);
          return next;
        });
      }
    },
    [activePromptId, collectionMembership, isAuthenticated],
  );

  const formatCollectionDate = (value: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
  };

  const currentCollectionMembership = useMemo(() => {
    if (!activePromptId) {
      return new Set<string>();
    }
    return collectionMembership.get(activePromptId) ?? new Set<string>();
  }, [activePromptId, collectionMembership]);

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p className="text-center py-10">Please sign in to view saved prompts.</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  if (savedPrompts.length === 0) {
    return <p className="text-center py-10">No saved prompts yet.</p>;
  }

  // TODO: add pagination for saved prompts

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8 space-y-8">
      <header className="py-4">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Saved Prompts</h1>
        <p className="text-center text-gray-400 dark:text-gray-300">
          Browse the prompts you've saved while exploring the library.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {savedPrompts.map((row) => {
          const prompt = row.prompts;
          if (!prompt) {
            return null;
          }

          return (
            <PromptCard
              key={prompt.id}
              prompt={{
                id: prompt.id,
                title: prompt.title,
                description: prompt.description,
                tags: prompt.tags,
                slug: prompt.slug,
                thumbnail_url: prompt.thumbnail_url,
                audio_preview_url: prompt.audio_preview_url,
              }}
              saved={savedIds.has(prompt.id)}
              onToggleSave={handleToggleSave}
              onOpenCollections={openCollectionsModal}
              isAuthenticated={isAuthenticated}
            />
          );
        })}
      </div>

      {isCollectionsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeCollectionsModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-neutral-900 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Select Collection</h2>
              <button
                type="button"
                onClick={closeCollectionsModal}
                className="text-neutral-400 transition hover:text-white"
              >
                ✕
              </button>
            </div>

            {collectionsModalLoading ? (
              <p className="text-sm text-neutral-400">Loading collections...</p>
            ) : collections.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No collections yet. Create one to organize your prompts.
              </p>
            ) : (
              <ul className="space-y-3">
                {collections.map((collection) => {
                  const inCollection = currentCollectionMembership.has(collection.id);
                  return (
                    <li
                      key={collection.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {collection.name ?? "Untitled Collection"}
                        </p>
                        {collection.created_at && (
                          <p className="text-xs text-neutral-500">
                            Created {formatCollectionDate(collection.created_at)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCollectionToggle(collection.id, !inCollection)}
                        className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                          inCollection ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        {inCollection ? "Remove" : "Add"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={closeCollectionsModal}
              className="mt-4 w-full rounded-lg border border-neutral-700 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


