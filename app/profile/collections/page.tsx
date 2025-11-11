"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

export default function CollectionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<PromptCollection[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  useEffect(() => {
    const loadCollections = async () => {
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

      const { data, error: collectionsError } = await supabase
        .from("prompt_collections")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (collectionsError) {
        setError(collectionsError.message ?? "Unable to load collections.");
        setCollections([]);
      } else {
        setCollections((data as PromptCollection[]) ?? []);
      }

      setLoading(false);
    };

    loadCollections();
  }, []);

  const openModal = () => {
    setCollectionName("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCollection = async () => {
    if (collectionName.trim().length === 0) {
      console.warn("Collection name must not be empty.");
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn(sessionError.message ?? "Unable to verify session.");
      return;
    }

    if (!session) {
      alert("Please sign in.");
      return;
    }

    const accessToken = session.access_token;
    const userId = session.user.id;

    const rlsClient = createClient(supabaseUrl, accessToken, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const name = collectionName.trim();

    const { data, error: insertError } = await rlsClient
      .from("prompt_collections")
      .insert({
        user_id: userId,
        name,
      })
      .select("*")
      .maybeSingle();

    if (insertError) {
      if (insertError.code === "23505") {
        alert("Collection name already exists.");
        return;
      }

      console.warn("Failed to create collection", insertError);
      return;
    }

    if (data) {
      setCollections((previous) => [data as PromptCollection, ...previous]);
    }

    setCollectionName("");
    setIsModalOpen(false);
  };

  const formatDate = (value: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <p className="text-center py-10">Please sign in to view your collections.</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  const handleCollectionClick = (collection: PromptCollection) => {
    console.log("TODO: navigate to collection detail", collection.id);
    // TODO: implement navigation to collection detail page
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Collections</h1>
          <p className="text-gray-400 dark:text-gray-300">
            Organize your favorite prompts into themed collections.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
        >
          + Create Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <p className="text-center py-10 text-gray-400 dark:text-gray-300">
          No collections yet. Create one to organize your prompts.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => handleCollectionClick(collection)}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-left transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <h2 className="text-lg font-semibold text-white line-clamp-1">
                {collection.name ?? "Untitled Collection"}
              </h2>
              {collection.description && (
                <p className="mt-2 text-sm text-gray-400 line-clamp-2">{collection.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Created {formatDate(collection.created_at) || "recently"}
              </p>
            </button>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-neutral-900 p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-white">Create New Collection</h2>
            <input
              type="text"
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              placeholder="Collection name"
              className="w-full p-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
            <button
              type="button"
              onClick={handleCreateCollection}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-medium text-white transition"
            >
              Create
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="text-neutral-400 hover:text-white text-sm text-center mt-3 cursor-pointer w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


