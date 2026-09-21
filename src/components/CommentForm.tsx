"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment, type ActionState } from "@/lib/actions/comments";
import { MAX_COMMENT_LENGTH } from "@/lib/posts";

const initialState: ActionState = {};

export default function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(addComment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="postId" value={postId} />
      <textarea
        name="content"
        rows={2}
        required
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="따뜻한 댓글을 남겨주세요 🍠"
        className="rounded-2xl border border-[#f0ddc8] bg-white px-4 py-3 text-sm outline-none focus:border-[#d99a6c]"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-[#7a3b1e] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "등록 중..." : "댓글 등록"}
      </button>
    </form>
  );
}
