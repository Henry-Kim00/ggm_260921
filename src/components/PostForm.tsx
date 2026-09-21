"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { CATEGORIES, MAX_IMAGES, postImageUrl, type Post } from "@/lib/posts";
import type { ActionState } from "@/lib/actions/posts";

const initialState: ActionState = {};

export default function PostForm({
  mode,
  post,
  action,
}: {
  mode: "create" | "edit";
  post?: Post;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [isFree, setIsFree] = useState(post?.is_free ?? false);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingImages = (post?.images ?? []).filter((path) => !removedPaths.includes(path));
  const remainingSlots = MAX_IMAGES - existingImages.length - newPreviews.length;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  function removeExisting(path: string) {
    setRemovedPaths((prev) => [...prev, path]);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "edit" && post && <input type="hidden" name="postId" value={post.id} />}
      {removedPaths.map((path) => (
        <input key={path} type="hidden" name="removedImages" value={path} />
      ))}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-semibold text-[#7a3b1e]">
          제목
        </label>
        <input
          id="title"
          name="title"
          defaultValue={post?.title}
          required
          maxLength={60}
          placeholder="어떤 물건을 올릴까요?"
          className="rounded-2xl border border-[#f0ddc8] bg-white px-4 py-3 outline-none focus:border-[#d99a6c]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-semibold text-[#7a3b1e]">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          defaultValue={post?.category ?? CATEGORIES[0]}
          className="rounded-2xl border border-[#f0ddc8] bg-white px-4 py-3 outline-none focus:border-[#d99a6c]"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className="text-sm font-semibold text-[#7a3b1e]">
          가격
        </label>
        <div className="flex items-center gap-3">
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            disabled={isFree}
            defaultValue={post?.price ?? 0}
            placeholder="0"
            className="flex-1 rounded-2xl border border-[#f0ddc8] bg-white px-4 py-3 outline-none focus:border-[#d99a6c] disabled:bg-[#f7efe4] disabled:text-[#c7ab8f]"
          />
          <label className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[#7a3b1e]">
            <input
              type="checkbox"
              name="isFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            나눔🍠
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-semibold text-[#7a3b1e]">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={post?.description}
          required
          maxLength={2000}
          rows={6}
          placeholder="상태, 거래 방법 등을 자세히 적어주세요."
          className="rounded-2xl border border-[#f0ddc8] bg-white px-4 py-3 outline-none focus:border-[#d99a6c]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-[#7a3b1e]">
          사진 ({existingImages.length + newPreviews.length}/{MAX_IMAGES})
        </p>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((path) => (
            <div key={path} className="relative h-20 w-20 overflow-hidden rounded-2xl">
              <Image src={postImageUrl(path)} alt="" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(path)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          {newPreviews.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element -- blob 미리보기는 next/image로 최적화할 수 없음
            <img
              key={src}
              src={src}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ))}
          {remainingSlots > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d99a6c] text-xs text-[#a5674a]"
            >
              <span className="text-xl">+</span>
              사진 추가
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {state.error && (
        <p className="rounded-full bg-red-100 px-4 py-2 text-center text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#7a3b1e] px-5 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "저장 중..." : mode === "create" ? "올리기" : "수정하기"}
      </button>
    </form>
  );
}
