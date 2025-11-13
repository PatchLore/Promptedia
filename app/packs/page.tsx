import Link from 'next/link';
import { getSupabaseServerClient } from "@/lib/supabase/server";
import PackCard from "@/components/PackCard";
import WrapperClient from "@/app/WrapperClient";

export const metadata = {
  title: "Prompt Packs | OnPointPrompt",
  description: "Browse curated AI prompt packs for writing, images, music, and productivity."
};

export default async function PacksPage() {
  const supabase = getSupabaseServerClient();

  const { data: packs } = await supabase
    .from("packs")
    .select("*")
    .order("created_at", { ascending: false });

  // Format price helper
  const formatPrice = (price: number | string | null | undefined): string => {
    if (typeof price === 'number') {
      return `£${price}`;
    }
    if (typeof price === 'string') {
      if (price.startsWith('£') || price.startsWith('$')) {
        return price.replace('$', '£');
      }
      return `£${price}`;
    }
    return 'Free';
  };

  return (
    <WrapperClient>
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            href="/prompts"
            className="text-blue-600 hover:underline text-sm font-medium dark:text-blue-400"
          >
            ← Back to Prompts
          </Link>
        </div>

        <h1 className="text-3xl font-semibold mb-6">Prompt Packs</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {packs?.map((pack: any) => (
            <PackCard
              key={pack.id}
              pack={{
                id: pack.id,
                slug: pack.slug,
                title: pack.title,
                summary: pack.description || '',
                price: formatPrice(pack.price),
                url: `/packs/${pack.slug}`, // Internal URL for pack detail page
                image_url: pack.image_url,
              }}
            />
          ))}
        </div>
      </main>
    </WrapperClient>
  );
}
