"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist";

export default function WishlistButton({
  postId,
  initialWishlisted,
  initialCount,
  isLoggedIn,
  className = "",
  onRemove,
}: {
  postId: string;
  initialWishlisted: boolean;
  initialCount: number;
  isLoggedIn: boolean;
  className?: string;
  onRemove?: () => void;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function applyState(next: boolean) {
    setWishlisted(next);
    setCount((prev) => Math.max(prev + (next ? 1 : -1), 0));
  }

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const next = !wishlisted;
    applyState(next);
    if (!next) {
      onRemove?.();
    }
    startTransition(async () => {
      try {
        const result = await toggleWishlist(postId);
        if (result !== next) {
          applyState(result);
        }
      } catch {
        applyState(!next);
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
      className={`flex h-9 items-center gap-1 rounded-full bg-white/85 px-2.5 shadow-md transition hover:scale-110 disabled:opacity-70 ${className}`}
    >
      <span className="text-lg leading-none">{wishlisted ? "❤️" : "🤍"}</span>
      <span className="text-xs font-bold text-[#7a3b1e]">{count}</span>
    </button>
  );
}
