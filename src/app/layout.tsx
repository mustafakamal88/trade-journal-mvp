import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { ConfigProvider, App as AntApp } from "antd";

export const metadata = { title: "Trade Journal" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={{ token: { colorPrimary: "#2563eb", borderRadius: 8 } }}>
          <AntApp>
            <header className="border-b bg-white">
              <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                <Link href="/" className="font-semibold">Trade Journal</Link>
                <div className="flex items-center gap-4 text-sm">
                  <Link href="/calendar">Calendar</Link>
                  <Link href="/trades">Trades</Link>
                  <Link href="/signin">Sign In</Link>
                </div>
              </nav>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
            <footer className="mt-16 border-t py-6 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Trade Journal
            </footer>
          </AntApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
