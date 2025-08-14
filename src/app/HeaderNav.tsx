"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button, Dropdown, MenuProps, Avatar } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";

export default function HeaderNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const mainItems: MenuProps["items"] = [
    { key: "home", label: <Link href="/">Journal</Link> },
    { key: "products", label: <Link href="/products">Products</Link> },
    { key: "pricing", label: <Link href="/pricing">Pricing</Link> },
    { type: "divider" },
    { key: "calendar", label: <Link href="/calendar">Calendar</Link> },
    { key: "trades", label: <Link href="/trades">Trades</Link> },
  ];

  const authItems = useMemo<MenuProps["items"]>(() => {
    if (status === "authenticated") {
      return [
        { key: "profile", label: <Link href="/settings">Profile</Link> },
        { key: "settings", label: <Link href="/settings">Settings</Link> },
        { type: "divider" },
        { key: "signout", label: <span onClick={() => signOut({ callbackUrl: "/" })}>Sign out</span> },
      ];
    }
    return [
      { key: "signup", label: <Link href="/signup">Create account</Link> },
      { key: "signin", label: <Link href="/signin">Sign in</Link> },
    ];
  }, [status]);

  const mobileItems: MenuProps["items"] = useMemo(
    () => [...mainItems, { type: "divider" }, ...(authItems || [])],
    [mainItems, authItems]
  );

  const userEmail = session?.user?.email || null;
  const userName = session?.user?.name || null;
  const userImage = (session?.user as any)?.image || null;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-blue-600">Zella</span> Journal
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/products" className="text-sm text-gray-700 hover:text-black">Products</Link>
          <Link href="/pricing" className="text-sm text-gray-700 hover:text-black">Pricing</Link>
          <Link href="/calendar" className="text-sm text-gray-700 hover:text-black">Calendar</Link>
          <Link href="/trades" className="text-sm text-gray-700 hover:text-black">Trades</Link>
          <Dropdown menu={{ items: authItems }} placement="bottomRight" trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar src={userImage || undefined} icon={<UserOutlined />} />
              <div className="hidden sm:block text-sm">
                <div className="font-medium leading-tight">
                  {status === "authenticated" ? (userName || userEmail || "Account") : "Join"}
                </div>
                <div className="text-gray-500 -mt-1">
                  {status === "authenticated" ? "Profile & Settings" : "Create account / Sign in"}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Dropdown
            menu={{ items: mobileItems }}
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
