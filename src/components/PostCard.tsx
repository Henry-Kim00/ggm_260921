import Link from "next/link";
import Image from "next/image";
import { formatPrice, postImageUrl, type Post } from "@/lib/posts";
import StatusBadge from "./StatusBadge";
import WishlistButton from "./WishlistButton";

export default function PostCard({
  post,
  wishlisted,
  isLoggedIn,
  onUnwishlist,
}: {
  post: Post;
  wishlisted: boolean;
  isLoggedIn: boolean;
  onUnwishlist?: () => void;
}) {
  const thumb = post.images[0];

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block overflow-hidden rounded-3xl border-2 border-transparent bg-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-[#ffb37a] hover:shadow-[0_0_18px_rgba(255,138,92,0.65)]"
    >
      <div className="relative aspect-square bg-[#f7e6d3]">
        {thumb ? (
          <Image
            src={postImageUrl(thumb)}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍠</div>
        )}
        <div className="absolute left-2 top-2">
          <StatusBadge status={post.status} />
        </div>
        <WishlistButton
          postId={post.id}
          initialWishlisted={wishlisted}
          initialCount={post.wishlist_count}
          isLoggedIn={isLoggedIn}
          onRemove={onUnwishlist}
          className="absolute bottom-2 right-2"
        />
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[#3a2317]">{post.title}</p>
        <p className="mt-1 text-xs text-[#a5674a]">{post.category}</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-bold text-[#7a3b1e]">{formatPrice(post.price, post.is_free)}</p>
          <span className="flex items-center gap-1 text-xs text-[#a5674a]">
            💬 {post.comment_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
