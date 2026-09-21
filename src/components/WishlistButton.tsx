"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist";

export default function WishlistButton({
  postId,
  initialWishlisted,
  isLoggedIn,
  className = "",
  onRemove,
}: {
  postId: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
  className?: string;
  onRemove?: () => void;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const next = !wishlisted;
    setWishlisted(next);
    if (!next) {
      onRemove?.();
    }
    startTransition(async () => {
      try {
        const result = await toggleWishlist(postId);
        setWishlisted(result);
      } catch {
        setWishlisted(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={wishlisted ? "위시리스트에서 빼기" : "위시리스트에 담기"}
      aria-pressed={wishlisted}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-lg shadow-md transition hover:scale-110 disabled:opacity-70 ${className}`}
    >
      {wishlisted ? "❤️" : "🤍"}
    </button>
  );
}
