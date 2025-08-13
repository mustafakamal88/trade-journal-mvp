"use client";
import { Form, Input, Button, Divider, message } from "antd";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const onFinish = async (values: any) => {
    const res = await signIn("credentials", { email: values.email, password: values.password, redirect: true, callbackUrl: "/trades" });
    if ((res as any)?.error) message.error((res as any).error);
  };
  const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_ENABLED;
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
      <Form layout="vertical" onFinish={onFinish} initialValues={{ email: "you@example.com", password: "test123" }}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input placeholder="you@example.com" /></Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password placeholder="••••••••" /></Form.Item>
        <Button type="primary" htmlType="submit" block>Sign in</Button>
      </Form>
      {googleEnabled && (
        <>
          <Divider>or</Divider>
          <Button onClick={()=>signIn("google",{ callbackUrl: "/trades" })} block>Sign in with Google</Button>
        </>
      )}
    </div>
  );
}
