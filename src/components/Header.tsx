import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#f0ddc8] bg-[#fff8f0]/90 px-5 py-3 backdrop-blur">
      <Link href="/posts" className="font-brand text-lg text-[#7a3b1e]">
        🍠 고구마마켓
      </Link>
      <nav className="flex items-center gap-2 text-sm font-semibold text-[#7a3b1e]">
        {user ? (
          <>
            <Link href="/posts" className="rounded-full bg-[#7a3b1e] px-4 py-2 text-white">
              전체게시물 보기
            </Link>
            <Link href="/posts/mine" className="rounded-full border border-[#7a3b1e] px-4 py-2">
              내게시물 보기
            </Link>
            <Link href="/" className="rounded-full border border-[#7a3b1e] px-4 py-2">
              내 카드
            </Link>
          </>
        ) : (
          <Link href="/login" className="rounded-full border border-[#7a3b1e] px-4 py-2">
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
