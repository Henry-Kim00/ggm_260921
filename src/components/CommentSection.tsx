import Link from "next/link";
import type { Comment } from "@/lib/posts";
import CommentForm from "./CommentForm";
import DeleteCommentButton from "./DeleteCommentButton";

export default function CommentSection({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  return (
    <section className="mt-4 rounded-3xl bg-white p-5 shadow-md">
      <h2 className="font-brand text-lg text-[#7a3b1e]">댓글 {comments.length}</h2>

      {currentUserId ? (
        <div className="mt-3">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#a5674a]">
          댓글을 남기려면{" "}
          <Link href="/login" className="font-semibold text-[#7a3b1e] underline underline-offset-2">
            로그인
          </Link>
          해주세요.
        </p>
      )}

      <ul className="mt-5 flex flex-col gap-4">
        {comments.length === 0 ? (
          <li className="text-sm text-[#a5674a]">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</li>
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="border-b border-[#f7ead9] pb-3 last:border-none">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#3a2317]">
                  {comment.author?.username ?? "알수없음"}
                </p>
                {comment.user_id === currentUserId && (
                  <DeleteCommentButton commentId={comment.id} postId={postId} />
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#3a2317]">
                {comment.content}
              </p>
              <p className="mt-1 text-xs text-[#a5674a]">
                {new Date(comment.created_at).toLocaleString("ko-KR")}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
