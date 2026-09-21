"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePost, updatePostStatus } from "@/lib/actions/posts";
import { STATUSES, type PostStatus } from "@/lib/posts";

export default function PostOwnerActions({
  postId,
  status,
}: {
  postId: string;
  status: PostStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleStatusChange(next: PostStatus) {
    startTransition(async () => {
      await updatePostStatus(postId, next);
    });
  }

  function handleDelete() {
    if (!confirm("정말 삭제할까요? 되돌릴 수 없어요.")) return;
    startTransition(async () => {
      await deletePost(postId);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending || s === status}
            onClick={() => handleStatusChange(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition disabled:opacity-100 ${
              s === status
                ? "bg-[#7a3b1e] text-white"
                : "border border-[#7a3b1e] text-[#7a3b1e] hover:bg-[#7a3b1e]/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Link
          href={`/posts/${postId}/edit`}
          className="flex-1 rounded-full border border-[#7a3b1e] px-4 py-2.5 text-center text-sm font-semibold text-[#7a3b1e]"
        >
          수정
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
