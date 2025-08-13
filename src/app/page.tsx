import Link from "next/link";
import { Button, Card, Statistic, Row, Col } from "antd";

export default function HomePage() {
  return (
    <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px]">
      <div className="rounded-[10px] bg-white p-8 md:p-12">
        <Row gutter={[24,24]} align="middle">
          <Col xs={24} md={12}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Journal your trades. <span className="text-blue-600">Stay consistent.</span>
            </h1>
            <p className="mt-4 text-gray-600">Log trades, see daily P&L on a calendar, and keep notes with news and screenshots.</p>
            <div className="mt-6 flex gap-3">
              <Link href="/signin"><Button type="primary" size="large">Get Started</Button></Link>
              <Link href="/calendar"><Button size="large">View Calendar</Button></Link>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Today at a glance">
              <Row gutter={16}>
                <Col span={8}><Statistic title="P&L" value={325} precision={2} prefix="+" /></Col>
                <Col span={8}><Statistic title="Trades" value={3} /></Col>
                <Col span={8}><Statistic title="R/R" value={2} precision={1} /></Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
}
