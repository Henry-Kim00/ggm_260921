export const CATEGORIES = [
  "디지털기기",
  "생활가전",
  "가구/인테리어",
  "옷/패션잡화",
  "뷰티/미용",
  "스포츠/레저",
  "도서/음반/티켓",
  "반려동물",
  "식물",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["판매중", "예약중", "거래완료"] as const;

export type PostStatus = (typeof STATUSES)[number];

export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_COMMENT_LENGTH = 500;

export type Post = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  price: number;
  is_free: boolean;
  status: PostStatus;
  images: string[];
  wishlist_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: { username: string } | null;
};

export function formatPrice(price: number, isFree: boolean): string {
  if (isFree) return "나눔";
  return `${price.toLocaleString("ko-KR")}원`;
}

export function postImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${path}`;
}
