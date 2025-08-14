import "./globals.css";
import { ReactNode } from "react";
import { ConfigProvider, App as AntApp } from "antd";
// @ts-expect-error Server component importing client child is fine
import HeaderNav from "./HeaderNav";
import Providers from "./Providers";

export const metadata = { title: "Trade Journal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={{ token: { colorPrimary: "#2563eb", borderRadius: 8 } }}>
          <AntApp>
            <Providers>
              <HeaderNav />
              <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
              <footer className="mt-16 border-t py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Trade Journal
              </footer>
            </Providers>
          </AntApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
