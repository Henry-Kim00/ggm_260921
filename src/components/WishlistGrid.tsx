"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import type { Post } from "@/lib/posts";

export default function WishlistGrid({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);

  if (posts.length === 0) {
    return (
      <p className="mt-20 text-center text-[#a5674a]">
        아직 담은 물건이 없어요. 마음에 드는 물건에 하트를 눌러보세요 🤍
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          wishlisted
          isLoggedIn
          onUnwishlist={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
        />
      ))}
    </div>
  );
}
