import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION || "us-east-1";

export async function GET(req: Request) {
  if (!bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const contentType = searchParams.get("contentType") || "image/png";
  const s3 = new S3Client({ region });
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return NextResponse.json({ url, key, publicUrl });
}
