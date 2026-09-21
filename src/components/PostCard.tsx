import Link from "next/link";
import Image from "next/image";
import { formatPrice, postImageUrl, type Post } from "@/lib/posts";
import StatusBadge from "./StatusBadge";

export default function PostCard({ post }: { post: Post }) {
  const thumb = post.images[0];

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
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
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[#3a2317]">{post.title}</p>
        <p className="mt-1 text-xs text-[#a5674a]">{post.category}</p>
        <p className="mt-1 font-bold text-[#7a3b1e]">{formatPrice(post.price, post.is_free)}</p>
      </div>
    </Link>
  );
}
