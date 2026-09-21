import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistGrid from "@/components/WishlistGrid";
import type { Post } from "@/lib/posts";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("ggm_wishlists")
    .select("post:ggm_posts(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<{ post: Post }[]>();

  const posts = (rows ?? []).map((row) => row.post).filter(Boolean);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#fff3e6] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-brand mb-6 text-2xl text-[#7a3b1e]">위시리스트</h1>
        <WishlistGrid initialPosts={posts} />
      </div>
    </main>
  );
}
