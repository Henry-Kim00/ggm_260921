"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/username";

export type ActionState = { error?: string };

export async function signup(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidUsername(username)) {
    return { error: "아이디는 영문 소문자/숫자/밑줄 3~20자로 입력해주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상으로 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: { data: { username } },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.message.includes("already registered")) {
      return { error: "이미 사용 중인 아이디예요." };
    }
    return { error: "가입에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  redirect("/");
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "아이디와 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    return { error: "아이디 또는 비밀번호가 올바르지 않아요." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
