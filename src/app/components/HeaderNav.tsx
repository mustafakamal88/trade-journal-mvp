"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Dropdown, MenuProps } from "antd";
import { MenuOutlined } from "@ant-design/icons";

export default function HeaderNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const items: MenuProps["items"] = [
    { key: "home", label: <Link href="/">Journal</Link> },
    { key: "products", label: <Link href="/products">Products</Link> },
    { key: "pricing", label: <Link href="/pricing">Pricing</Link> },
    { type: "divider" },
    { key: "calendar", label: <Link href="/calendar">Calendar</Link> },
    { key: "trades", label: <Link href="/trades">Trades</Link> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-blue-600">Zella</span> Journal
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/products" className="text-sm text-gray-700 hover:text-black">Products</Link>
          <Link href="/pricing" className="text-sm text-gray-700 hover:text-black">Pricing</Link>
          <Link href="/calendar" className="text-sm text-gray-700 hover:text-black">Calendar</Link>
          <Link href="/trades" className="text-sm text-gray-700 hover:text-black">Trades</Link>

          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-600 md:inline">
                {session.user?.email}
              </span>
              <Button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
            </div>
          ) : (
            <Button type="primary" onClick={() => signIn(undefined, { callbackUrl: "/trades" })}>
              Sign in
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}
            trigger={["click"]}
          >
            <Button icon={<MenuOutlined />} />
          </Dropdown>
        </div>
      </nav>
    </header>
  );
}
