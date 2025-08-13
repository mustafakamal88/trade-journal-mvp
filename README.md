# Trade Journal — Ant Design + Tailwind (with Google OAuth + S3 Uploads)

## Setup
1) Ensure `.env` contains your Neon DB URL (already filled), NEXTAUTH values, optional Google OAuth, and S3 bucket creds.
2) Install & migrate:
```
npm install
npx prisma generate
npx prisma migrate dev --name init
```
3) Seed a user:
```
SEED_EMAIL=you@example.com SEED_PASSWORD=test123 npm run seed
```
4) Start:
```
npm run dev
```

## Screens
- `/signin` — credentials sign-in (Google button appears if GOOGLE_* set)
- `/trades` — Antd table + Add Trade drawer
- `/calendar` — Antd calendar with win/loss badges
- `/day/YYYY-MM-DD` — P&L, trades, notes, news, and S3 screenshot uploads

## S3
Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `S3_BUCKET`. Then use the upload on the day page.
