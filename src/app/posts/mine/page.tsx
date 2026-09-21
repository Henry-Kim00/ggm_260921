import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/posts";

export default async function MyPostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: posts } = await supabase
    .from("ggm_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Post[]>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#fff3e6] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-brand mb-6 text-2xl text-[#7a3b1e]">내 게시물</h1>

        {!posts || posts.length === 0 ? (
          <p className="mt-20 text-center text-[#a5674a]">
            아직 올린 물건이 없어요. 첫 글을 올려볼까요? 🍠
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
