import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "건축물대장 면적 조회",
  description: "건축물대장 기준 전용·공용·공급면적을 즉시 조회하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          async
        />
      </head>
      <body className="min-h-full flex flex-col font-[Pretendard,sans-serif]">
        {children}
      </body>
    </html>
  );
}
