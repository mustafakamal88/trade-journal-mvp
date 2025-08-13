// app/page.tsx
import { Button, Card, Statistic } from 'antd';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Hero Section */}
      <section className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Journal your trades.{' '}
          <span className="text-blue-600">Stay consistent.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Log trades, see daily P&amp;L on a calendar, and keep notes with news and screenshots.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button type="primary" size="large">Get Started</Button>
          <Button size="large">View Calendar</Button>
        </div>
      </section>

      {/* Stats Card */}
      <Card className="shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Today at a glance</h2>
        <div className="grid grid-cols-3 gap-4">
          <Statistic title="P&L" value={325.0} precision={2} prefix="+" />
          <Statistic title="Trades" value={3} />
          <Statistic title="R/R" value={2.0} />
        </div>
      </Card>

      {/* Footer */}
      <footer className="mt-16 text-gray-500 text-sm">
        © {new Date().getFullYear()} Trade Journal
      </footer>
    </main>
  );
}
