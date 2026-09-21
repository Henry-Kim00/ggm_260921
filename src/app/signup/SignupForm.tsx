"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type ActionState } from "@/lib/actions/auth";
import AuthCard from "@/components/AuthCard";
import AuthInput from "@/components/AuthInput";

const initialState: ActionState = {};

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <AuthCard
      emoji="🍠"
      title="고구마마켓 가입"
      subtitle="달콤한 동네 거래, 지금 시작해요"
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-[#7a3b1e] underline underline-offset-2">
            로그인
          </Link>
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <AuthInput
          id="username"
          name="username"
          label="아이디"
          placeholder="영문 소문자/숫자/밑줄 3~20자"
          autoComplete="username"
          required
        />
        <AuthInput
          id="password"
          name="password"
          label="비밀번호"
          type="password"
          placeholder="6자 이상"
          autoComplete="new-password"
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
          {pending ? "가입 중..." : "가입하기"}
        </button>
      </form>
    </AuthCard>
  );
}
