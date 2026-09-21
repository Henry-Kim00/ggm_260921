import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, postImageUrl, type Comment, type Post } from "@/lib/posts";
import { getWishlistedPostIds } from "@/lib/wishlist";
import StatusBadge from "@/components/StatusBadge";
import PostOwnerActions from "@/components/PostOwnerActions";
import WishlistButton from "@/components/WishlistButton";
import CommentSection from "@/components/CommentSection";
import GogumaBuddy from "@/components/GogumaBuddy";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("ggm_posts")
    .select("*")
    .eq("id", id)
    .single<Post>();

  if (!post) {
    notFound();
  }

  const [{ data: profile }, { data: { user } }, { data: comments }] = await Promise.all([
    supabase.from("ggm_profiles").select("username").eq("id", post.user_id).single(),
    supabase.auth.getUser(),
    supabase
      .from("ggm_comments")
      .select("id, post_id, user_id, content, created_at, author:ggm_profiles(username)")
      .eq("post_id", id)
      .order("created_at", { ascending: true })
      .returns<Comment[]>(),
  ]);

  const isOwner = user?.id === post.user_id;
  const wishlisted = user ? (await getWishlistedPostIds(supabase, user.id)).has(post.id) : false;

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#fff3e6] px-4 py-8">
      <GogumaBuddy />
      <div className="relative mx-auto max-w-lg">
        <Link
          href="/posts"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#7a3b1e]"
        >
          ← 목록보기
        </Link>
        <div className="overflow-hidden rounded-3xl bg-white shadow-md">
          <div className="relative aspect-square bg-[#f7e6d3]">
            {post.images[0] ? (
              <Image
                src={postImageUrl(post.images[0])}
                alt={post.title}
                fill
                sizes="512px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🍠</div>
            )}
            <div className="absolute left-3 top-3">
              <StatusBadge status={post.status} />
            </div>
            <WishlistButton
              postId={post.id}
              initialWishlisted={wishlisted}
              initialCount={post.wishlist_count}
              isLoggedIn={Boolean(user)}
              className="absolute bottom-3 right-3"
            />
          </div>

          {post.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3">
              {post.images.slice(1).map((path) => (
                <div key={path} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={postImageUrl(path)} alt="" fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="p-5">
            <p className="text-xs font-semibold text-[#a5674a]">{post.category}</p>
            <h1 className="mt-1 text-xl font-bold text-[#3a2317]">{post.title}</h1>
            <p className="mt-2 text-2xl font-extrabold text-[#7a3b1e]">
              {formatPrice(post.price, post.is_free)}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#3a2317]">
              {post.description}
            </p>
            <p className="mt-6 text-xs text-[#a5674a]">
              판매자 {profile?.username ?? "알수없음"} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="mt-4">
            <PostOwnerActions postId={post.id} status={post.status} />
          </div>
        )}

        <CommentSection postId={post.id} comments={comments ?? []} currentUserId={user?.id} />
      </div>
    </main>
  );
}
