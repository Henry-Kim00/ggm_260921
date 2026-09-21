"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/posts", label: "전체게시물 보기" },
  { href: "/posts/mine", label: "내게시물 보기" },
  { href: "/posts/wishlist", label: "위시리스트" },
  { href: "/", label: "내 계정" },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "rounded-full bg-[#7a3b1e] px-4 py-2 text-white"
                : "px-4 py-2 text-[#3a2317]/50 transition hover:text-[#7a3b1e]"
            }
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
