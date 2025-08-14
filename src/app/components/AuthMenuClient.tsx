"use client";

import Link from "next/link";
import { Dropdown, Avatar, MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";

type Props = {
  loggedIn: boolean;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function AuthMenuClient({ loggedIn, name, email, image }: Props) {
  const guestItems: MenuProps["items"] = [
    { key: "signup", label: <Link href="/signup">Create account</Link> },
    { key: "signin", label: <Link href="/signin">Sign in</Link> },
  ];

  const userItems: MenuProps["items"] = [
    { key: "profile", label: <Link href="/settings">Profile</Link> },
    { key: "settings", label: <Link href="/settings">Settings</Link> },
    { type: "divider" },
    {
      key: "signout",
      label: <span onClick={() => signOut({ callbackUrl: "/" })}>Sign out</span>,
    },
  ];

  return (
    <Dropdown
      trigger={["click"]}
      menu={{ items: loggedIn ? userItems : guestItems }}
      placement="bottomRight"
    >
      <div className="flex items-center gap-2 cursor-pointer">
        <Avatar src={image || undefined} icon={<UserOutlined />} />
        <div className="hidden sm:block text-sm">
          <div className="font-medium leading-tight">{name || email || "Account"}</div>
          <div className="text-gray-500 -mt-1">{loggedIn ? "Manage" : "Join / Sign in"}</div>
        </div>
      </div>
    </Dropdown>
  );
}
