"use client";

import { useEffect, useState } from "react";
import { Button, Card, Form, Input, message } from "antd";

export default function SettingsPage() {
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/settings/profile");
      if (r.ok) {
        const data = await r.json();
        form.setFieldsValue({ name: data.name || "", email: data.email || "" });
      }
    })();
  }, [form]);

  const saveProfile = async (v: any) => {
    setProfileLoading(true);
    const r = await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v.name }),
    });
    setProfileLoading(false);
    if (!r.ok) return message.error("Failed to update profile");
    message.success("Profile updated");
  };

  const changePassword = async (v: any) => {
    if (!v.currentPassword || !v.newPassword) return;
    setPwdLoading(true);
    const r = await fetch("/api/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    const data = await r.json().catch(() => null);
    setPwdLoading(false);
    if (!r.ok) return message.error(data?.error || "Failed to change password");
    message.success("Password changed");
    form.resetFields(["currentPassword", "newPassword"]);
  };

  return (
    <main className="min-h-screen p-4 max-w-3xl mx-auto space-y-6">
      <Card title="Profile">
        <Form layout="vertical" form={form} onFinish={saveProfile}>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Name" name="name">
            <Input placeholder="Your name" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={profileLoading}>
            Save
          </Button>
        </Form>
      </Card>

      <Card title="Change password">
        <Form layout="vertical" onFinish={changePassword}>
          <Form.Item
            label="Current password"
            name="currentPassword"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="New password"
            name="newPassword"
            rules={[{ required: true }, { min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={pwdLoading}>
            Update password
          </Button>
        </Form>
      </Card>
    </main>
  );
}
