export const metadata = {
  title: "倪派命理助手（MVP）",
  description: "八字排盘 + 小六壬（娱乐/学习用途）"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        {children}
      </body>
    </html>
  );
}
