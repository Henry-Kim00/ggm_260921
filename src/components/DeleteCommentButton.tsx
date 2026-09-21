"use client";

import { useTransition } from "react";
import { deleteComment } from "@/lib/actions/comments";

export default function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("댓글을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteComment(commentId, postId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-[#a5674a] underline underline-offset-2 disabled:opacity-60"
    >
      삭제
    </button>
  );
}
