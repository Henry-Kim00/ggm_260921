import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/posts";

export default async function PostsPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("ggm_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Post[]>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#fff3e6] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-brand text-2xl text-[#7a3b1e]">동네 거래</h1>
          <Link
            href="/posts/new"
            className="rounded-full bg-[#7a3b1e] px-4 py-2 text-sm font-semibold text-white shadow"
          >
            + 글쓰기
          </Link>
        </div>

        {!posts || posts.length === 0 ? (
          <p className="mt-20 text-center text-[#a5674a]">
            아직 올라온 물건이 없어요. 첫 글을 올려볼까요? 🍠
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
