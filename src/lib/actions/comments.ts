"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAX_COMMENT_LENGTH } from "@/lib/posts";

export type ActionState = { error?: string };

export async function addComment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const postId = String(formData.get("postId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!postId) {
    return { error: "잘못된 요청이에요." };
  }
  if (!content) {
    return { error: "댓글 내용을 입력해주세요." };
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return { error: `댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해주세요.` };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const { error } = await supabase.from("ggm_comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });

  if (error) {
    return { error: "댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
  return {};
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ggm_comments").delete().eq("id", commentId);
  if (error) {
    throw new Error("댓글 삭제에 실패했어요.");
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
}
