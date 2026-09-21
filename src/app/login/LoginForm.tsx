"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type ActionState } from "@/lib/actions/auth";
import AuthCard from "@/components/AuthCard";
import AuthInput from "@/components/AuthInput";

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <AuthCard
      emoji="🍠"
      title="고구마마켓 로그인"
      subtitle="오늘도 달콤한 하루 되세요"
      footer={
        <>
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-[#7a3b1e] underline underline-offset-2">
            회원가입
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <AuthInput
          id="username"
          name="username"
          label="아이디"
          autoComplete="username"
          required
        />
        <AuthInput
          id="password"
          name="password"
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.error && (
          <p className="rounded-full bg-red-500/20 px-4 py-2 text-center text-sm text-red-50">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-white px-5 py-3 font-semibold text-[#7a3b1e] shadow-lg transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </AuthCard>
  );
}
