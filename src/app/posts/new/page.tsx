import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/lib/actions/posts";
import PostForm from "@/components/PostForm";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#fff3e6] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="font-brand mb-6 text-2xl text-[#7a3b1e]">글쓰기</h1>
        <PostForm mode="create" action={createPost} />
      </div>
    </main>
  );
}
