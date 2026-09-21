import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import MembershipCard from "@/components/MembershipCard";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#fff3e6] px-4 text-center">
        <div>
          <p className="text-5xl">🍠</p>
          <h1 className="font-brand mt-4 text-3xl text-[#7a3b1e]">고구마마켓</h1>
          <p className="mt-2 text-[#a5674a]">달콤한 우리 동네 중고거래</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-[#7a3b1e] px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            회원가입
          </Link>
          <Link
            href="/login"
            className="rounded-full border-2 border-[#7a3b1e] px-6 py-3 font-semibold text-[#7a3b1e] transition hover:bg-[#7a3b1e]/10"
          >
            로그인
          </Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("ggm_profiles")
    .select("username, created_at")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#fff3e6] px-4">
      <MembershipCard
        username={profile?.username ?? "고구마"}
        createdAt={profile?.created_at ?? user.created_at}
      />
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full border-2 border-[#7a3b1e] px-6 py-2.5 font-semibold text-[#7a3b1e] transition hover:bg-[#7a3b1e]/10"
        >
          로그아웃
        </button>
      </form>
    </main>
  );
}
