import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
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

        {posts.length === 0 ? (
          <p className="mt-20 text-center text-[#a5674a]">
            아직 담은 물건이 없어요. 마음에 드는 물건에 하트를 눌러보세요 🤍
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} wishlisted isLoggedIn />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
