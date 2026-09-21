import type { PostStatus } from "@/lib/posts";

const STYLES: Record<PostStatus, string> = {
  판매중: "bg-emerald-500 text-white",
  예약중: "bg-amber-500 text-white",
  거래완료: "bg-zinc-500 text-white",
};

export default function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold shadow ${STYLES[status]}`}>
      {status}
    </span>
  );
}
