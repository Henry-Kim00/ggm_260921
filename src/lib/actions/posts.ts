"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES,
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  STATUSES,
  type Category,
  type PostStatus,
} from "@/lib/posts";

export type ActionState = { error?: string };

const BUCKET = "post-images";

function getFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function parseFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const isFree = formData.get("isFree") === "on";
  const rawPrice = Number(formData.get("price") ?? 0);

  if (!title || title.length > 60) {
    return { error: "제목은 1~60자로 입력해주세요." } as const;
  }
  if (!description || description.length > 2000) {
    return { error: "설명은 1~2000자로 입력해주세요." } as const;
  }
  if (!CATEGORIES.includes(category as Category)) {
    return { error: "카테고리를 선택해주세요." } as const;
  }
  if (!isFree && (!Number.isFinite(rawPrice) || rawPrice < 0 || rawPrice > 100_000_000)) {
    return { error: "가격을 올바르게 입력해주세요." } as const;
  }

  return {
    title,
    description,
    category: category as Category,
    isFree,
    price: isFree ? 0 : Math.round(rawPrice),
  } as const;
}

async function uploadImages(userId: string, postId: string, files: File[]) {
  const supabase = await createClient();
  const paths: string[] = [];

  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith("image/")) {
      throw new Error("이미지 파일만 업로드할 수 있어요.");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("이미지는 5MB 이하로 올려주세요.");
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${postId}/${index}-${randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
    });
    if (error) {
      throw new Error("이미지 업로드에 실패했어요.");
    }
    paths.push(path);
  }

  return paths;
}

export async function createPost(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const fields = parseFields(formData);
  if ("error" in fields) {
    return fields;
  }

  const files = getFiles(formData);
  if (files.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.` };
  }

  const postId = randomUUID();
  let images: string[] = [];
  try {
    images = await uploadImages(user.id, postId, files);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "이미지 업로드에 실패했어요." };
  }

  const { error } = await supabase.from("ggm_posts").insert({
    id: postId,
    user_id: user.id,
    title: fields.title,
    description: fields.description,
    category: fields.category,
    price: fields.price,
    is_free: fields.isFree,
    images,
  });

  if (error) {
    return { error: "글 등록에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/posts");
  redirect(`/posts/${postId}`);
}

export async function updatePost(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const postId = String(formData.get("postId") ?? "");
  if (!postId) {
    return { error: "잘못된 요청이에요." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요해요." };
  }

  const { data: existing } = await supabase
    .from("ggm_posts")
    .select("user_id, images")
    .eq("id", postId)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { error: "본인 글만 수정할 수 있어요." };
  }

  const fields = parseFields(formData);
  if ("error" in fields) {
    return fields;
  }

  const removedPaths = formData.getAll("removedImages").map(String);
  const remainingPaths = (existing.images as string[]).filter(
    (path) => !removedPaths.includes(path),
  );
  const newFiles = getFiles(formData);

  if (remainingPaths.length + newFiles.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.` };
  }

  let uploadedPaths: string[] = [];
  try {
    uploadedPaths = await uploadImages(user.id, postId, newFiles);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "이미지 업로드에 실패했어요." };
  }

  const images = [...remainingPaths, ...uploadedPaths];

  const { error } = await supabase
    .from("ggm_posts")
    .update({
      title: fields.title,
      description: fields.description,
      category: fields.category,
      price: fields.price,
      is_free: fields.isFree,
      images,
    })
    .eq("id", postId);

  if (error) {
    return { error: "글 수정에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  if (removedPaths.length > 0) {
    await supabase.storage.from(BUCKET).remove(removedPaths);
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function updatePostStatus(postId: string, status: PostStatus) {
  if (!STATUSES.includes(status)) {
    throw new Error("잘못된 상태예요.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ggm_posts")
    .update({ status })
    .eq("id", postId);

  if (error) {
    throw new Error("상태 변경에 실패했어요.");
  }

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}`);
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("ggm_posts")
    .select("images")
    .eq("id", postId)
    .single();

  const { error } = await supabase.from("ggm_posts").delete().eq("id", postId);
  if (error) {
    throw new Error("삭제에 실패했어요.");
  }

  if (existing?.images?.length) {
    await supabase.storage.from(BUCKET).remove(existing.images);
  }

  revalidatePath("/posts");
  redirect("/posts");
}
