"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(postId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { data: existing } = await supabase
    .from("ggm_wishlists")
    .select("post_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  const nextWishlisted = !existing;

  const { error } = nextWishlisted
    ? await supabase.from("ggm_wishlists").insert({ user_id: user.id, post_id: postId })
    : await supabase.from("ggm_wishlists").delete().eq("user_id", user.id).eq("post_id", postId);

  if (error) {
    throw new Error("위시리스트 처리에 실패했어요.");
  }

  revalidatePath("/posts");
  revalidatePath("/posts/mine");
  revalidatePath("/posts/wishlist");
  revalidatePath(`/posts/${postId}`);

  return nextWishlisted;
}
