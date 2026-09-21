import type { Metadata } from "next";
import { Jua, Noto_Sans_KR } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "고구마마켓",
  description: "달콤한 우리 동네 중고거래, 고구마마켓",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${jua.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Header />
        {children}
      </body>
    </html>
  );
}
