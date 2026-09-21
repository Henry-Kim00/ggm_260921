// 아이디 로그인을 Supabase Auth(이메일 기반)로 구현하기 위해
// "아이디@ggm.local" 형태의 가상 이메일로 변환해서 사용한다.
const FAKE_EMAIL_DOMAIN = "ggm.local";
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToEmail(username: string): string {
  return `${username}@${FAKE_EMAIL_DOMAIN}`;
}
