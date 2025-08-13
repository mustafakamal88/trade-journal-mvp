"use client";
import { useEffect, useMemo, useState } from "react";
import { Table, Tag, Button, Drawer, Form, Input, InputNumber, DatePicker, Select, Space, Typography, message } from "antd";
import dayjs from "dayjs";
type Trade = any;
export default function TradesPage() {
  const [data, setData] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const fetchTrades = async () => {
    setLoading(true);
    const r = await fetch("/api/trades");
    if (r.ok) setData(await r.json()); else message.error("Please sign in");
    setLoading(false);
  };
  useEffect(() => { fetchTrades(); }, []);
  const columns = useMemo(() => [
    { title: "Symbol", dataIndex: "symbol", key: "symbol" },
    { title: "Side", dataIndex: "side", key: "side", render: (v: string) => <Tag color={v === "LONG" ? "green" : "volcano"}>{v}</Tag> },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    { title: "Entry", dataIndex: "entryPrice", key: "entryPrice" },
    { title: "Exit", dataIndex: "exitPrice", key: "exitPrice" },
    { title: "P&L", dataIndex: "realizedPnl", key: "realizedPnl", render: (v: number) => <span className={v >= 0 ? "text-emerald-600" : "text-red-600"}>{Number(v).toFixed(2)}</span> },
    { title: "Opened", dataIndex: "openedAt", key: "openedAt", render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm") },
    { title: "Closed", dataIndex: "closedAt", key: "closedAt", render: (v: string) => v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-" },
    { title: "Tags", dataIndex: "tags", key: "tags", render: (arr: string[] = []) => <Space wrap>{arr.map(t => <Tag key={t}>{t}</Tag>)}</Space> },
  ], []);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Typography.Title level={3} style={{margin:0}}>Trades</Typography.Title>
        <Button type="primary" onClick={()=>setOpen(true)}>Add Trade</Button>
      </div>
      <Table rowKey="id" loading={loading} dataSource={data} columns={columns} pagination={{ pageSize: 10 }} />
      <AddTradeDrawer open={open} onClose={()=>setOpen(false)} onSaved={()=>{ setOpen(false); fetchTrades(); }}/>
    </div>
  );
}
function AddTradeDrawer({ open, onClose, onSaved }:{ open:boolean; onClose:()=>void; onSaved:()=>void; }) {
  const [form] = Form.useForm(); const [saving, setSaving] = useState(false);
  const onSubmit = async () => {
    const v = await form.validateFields(); setSaving(true);
    const payload = {
      symbol: v.symbol, side: v.side, instrument: v.instrument, strategy: v.strategy || undefined,
      account: v.account || undefined, timeframe: v.timeframe || undefined,
      quantity: Number(v.quantity), entryPrice: Number(v.entryPrice),
      exitPrice: v.exitPrice != null ? Number(v.exitPrice) : undefined,
      stopLoss: v.stopLoss != null ? Number(v.stopLoss) : undefined,
      takeProfit: v.takeProfit != null ? Number(v.takeProfit) : undefined,
      fees: v.fees != null ? Number(v.fees) : 0,
      openedAt: v.openedAt.toDate().toISOString(),
      closedAt: v.closedAt ? v.closedAt.toDate().toISOString() : undefined,
      tags: v.tags ? v.tags.split(",").map((s:string)=>s.trim()).filter(Boolean) : [],
      rr: v.rr != null ? Number(v.rr) : undefined,
      notes: v.notes || undefined
    };
    const r = await fetch("/api/trades", { method:"POST", headers:{ "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) { message.error("Save failed"); setSaving(false); return; }
    message.success("Trade saved"); setSaving(false); onSaved(); form.resetFields();
  };
  return (
    <Drawer title="Add Trade" open={open} onClose={onClose} width={480} destroyOnClose
      extra={<Button type="primary" loading={saving} onClick={onSubmit}>Save</Button>}>
      <Form form={form} layout="vertical" initialValues={{ side:"LONG", instrument:"STOCK", openedAt: dayjs(), closedAt: dayjs() }}>
        <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}><Input/></Form.Item>
        <Form.Item name="instrument" label="Instrument"><Select options={[
          {value:"STOCK",label:"Stock"},{value:"FUTURES",label:"Futures"},
          {value:"FOREX",label:"Forex"},{value:"CRYPTO",label:"Crypto"},{value:"OPTION",label:"Option"},
        ]}/></Form.Item>
        <Form.Item name="side" label="Side" rules={[{ required: true }]}><Select options={[{value:"LONG"},{value:"SHORT"}]}/></Form.Item>
        <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}><InputNumber className="w-full"/></Form.Item>
        <Form.Item name="entryPrice" label="Entry Price" rules={[{ required: true }]}><InputNumber step={0.01} className="w-full"/></Form.Item>
        <Form.Item name="exitPrice" label="Exit Price"><InputNumber step={0.01} className="w-full"/></Form.Item>
        <Form.Item name="stopLoss" label="Stop Loss"><InputNumber step={0.01} className="w-full"/></Form.Item>
        <Form.Item name="takeProfit" label="Take Profit"><InputNumber step={0.01} className="w-full"/></Form.Item>
        <Form.Item name="fees" label="Fees"><InputNumber step={0.01} className="w-full"/></Form.Item>
        <Form.Item name="rr" label="Risk/Reward"><InputNumber step={0.1} className="w-full"/></Form.Item>
        <Form.Item name="strategy" label="Strategy"><Input/></Form.Item>
        <Form.Item name="account" label="Account"><Input/></Form.Item>
        <Form.Item name="timeframe" label="Timeframe"><Input placeholder="e.g. 5m, 1h"/></Form.Item>
        <Form.Item name="openedAt" label="Opened At"><DatePicker showTime className="w-full"/></Form.Item>
        <Form.Item name="closedAt" label="Closed At"><DatePicker showTime className="w-full"/></Form.Item>
        <Form.Item name="tags" label="Tags (comma-separated)"><Input/></Form.Item>
        <Form.Item name="notes" label="Notes"><Input.TextArea rows={3}/></Form.Item>
      </Form>
    </Drawer>
  );
}
