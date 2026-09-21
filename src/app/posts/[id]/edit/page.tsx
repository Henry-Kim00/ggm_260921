import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePost } from "@/lib/actions/posts";
import PostForm from "@/components/PostForm";
import type { Post } from "@/lib/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: post } = await supabase
    .from("ggm_posts")
    .select("*")
    .eq("id", id)
    .single<Post>();

  if (!post) {
    notFound();
  }
  if (post.user_id !== user.id) {
    redirect(`/posts/${id}`);
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#fff3e6] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="font-brand mb-6 text-2xl text-[#7a3b1e]">글 수정</h1>
        <PostForm mode="edit" post={post} action={updatePost} />
      </div>
    </main>
  );
}
