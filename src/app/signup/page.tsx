"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Form, Input, Button, Card, message } from "antd";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const r = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await r.json();
      if (!r.ok) return message.error(data?.error || "Failed to register");

      message.success("Account created");
      // auto sign-in for smooth flow
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: "/trades",
      });
      if (res?.error) {
        // fallback to signin page if auto login fails
        router.push("/signin");
      } else {
        router.push("/trades");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-gray-500 mb-4">Start journaling your trades</p>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name">
            <Input placeholder="Your name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }, { min: 6, message: "Min 6 characters" }]}
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create account
          </Button>
        </Form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600">Sign in</Link>
        </div>
      </Card>
    </main>
  );
}
