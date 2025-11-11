"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PromptGrid from "@/components/PromptGrid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type PromptCollection = {
  id: string;
  user_id: string | null;
  name: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type CollectionItem = {
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

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = useMemo(() => {
    const value = params?.id;
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [collection, setCollection] = useState<PromptCollection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const promptList = useMemo(() => {
    return items
      .map((item) => item.prompts)
      .filter((prompt): prompt is NonNullable<CollectionItem['prompts']> => Boolean(prompt))
      .map((prompt) => ({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        tags: prompt.tags,
        slug: prompt.slug,
        thumbnail_url: prompt.thumbnail_url,
        audio_preview_url: prompt.audio_preview_url,
      }));
  }, [items]);

  useEffect(() => {
    const loadCollection = async () => {
      if (!collectionId) {
        setError("Collection not found.");
        setLoading(false);
        return;
      }

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
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAccessToken(session.access_token ?? null);

      const { data: collectionData, error: collectionError } = await supabase
        .from("prompt_collections")
        .select("*")
        .eq("id", collectionId)
        .single<PromptCollection>();

      if (collectionError || !collectionData) {
        setError(collectionError?.message ?? "Collection not found.");
        setCollection(null);
        setItems([]);
        setLoading(false);
        return;
      }

      setCollection(collectionData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("prompt_collection_items")
        .select("prompt_id, prompts(*)")
        .eq("collection_id", collectionId);

      if (itemsError) {
        console.warn("Failed to load collection items", itemsError);
        setItems([]);
      } else {
        const normalized: CollectionItem[] = Array.isArray(itemsData)
          ? itemsData.map((row: any) => ({
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
        setItems(normalized);
        const promptIds = normalized
          .map((row) => row.prompts?.id)
          .filter((value): value is string => typeof value === "string");
        setSavedIds(new Set(promptIds));
      }

      setLoading(false);
    };

    loadCollection();
  }, [collectionId]);

  if (!collectionId) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <p className="text-center text-red-500">Collection not found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <p className="text-center">Please sign in.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-8">
        <p className="text-center">Collection not found.</p>
      </div>
    );
  }

  const handleToggleSave = async (promptId: string, shouldSave: boolean) => {
    if (!promptId || !accessToken) {
      return;
    }

    const previousIds = new Set(savedIds);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (shouldSave) {
        next.add(promptId);
      } else {
        next.delete(promptId);
      }
      return next;
    });

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
    }
  };

  const openCollectionsModal = (promptId: string) => {
    console.log("TODO: open collections modal for prompt", promptId);
    // TODO: Implement collection modal on detail page
  };

  const handleRemoveFromCollection = async (promptId: string) => {
    if (!collectionId) {
      return;
    }

    const previousItems = [...items];
    setItems((prev) => prev.filter((row) => row.prompt_id !== promptId && row.prompts?.id !== promptId));

    try {
      const { error } = await supabase
        .from("prompt_collection_items")
        .delete()
        .eq("collection_id", collectionId)
        .eq("prompt_id", promptId);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.warn("Failed to remove prompt from collection", err);
      setItems(previousItems);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{collection.name ?? "Untitled Collection"}</h1>
          {collection.description && (
            <p className="text-gray-400 dark:text-gray-300 mt-2">{collection.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:bg-neutral-800"
        >
          Back
        </button>
      </div>

      {promptList.length === 0 ? (
        <p className="text-center text-neutral-400">
          This collection has no prompts yet.{" "}
          <span className="font-medium text-neutral-200">Add some to get started!</span>
        </p>
      ) : (
        <PromptGrid
          prompts={promptList}
          savedPromptIds={Array.from(savedIds)}
          onToggleSave={handleToggleSave}
          onOpenCollections={openCollectionsModal}
          onRemoveFromCollection={handleRemoveFromCollection}
          showRemoveFromCollection
          isAuthenticated
        />
      )}

      <p className="text-sm text-neutral-500 text-center">
        TODO: implement remove-from-collection actions.
      </p>
    </div>
  );
}


