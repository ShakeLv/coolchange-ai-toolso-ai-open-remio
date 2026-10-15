import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImageFromUrl } from "@/lib/r2-storage";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.session.userId;

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.type.split('/')[1] || 'png';
    const filename = `uploads/${userId}/${timestamp}_${random}.${extension}`;

    // For now, save to a temporary location
    // In production, you would upload to R2 or other storage
    // Since we already have R2 configured, let's use it
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    
    const STORAGE_ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID || '';
    const STORAGE_SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY || '';
    const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT || '';
    const STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME || 'toolso-uploads';
    const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || '';

    if (!STORAGE_ACCESS_KEY_ID || !STORAGE_SECRET_ACCESS_KEY) {
      // If R2 is not configured, return a data URL for testing
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    // Extract endpoint URL from the full endpoint if needed
    const getEndpointUrl = () => {
      if (STORAGE_ENDPOINT.includes('.r2.cloudflarestorage.com')) {
        const parts = STORAGE_ENDPOINT.split('/');
        return parts[0] + '//' + parts[2];
      }
      return STORAGE_ENDPOINT;
    };

    const r2Client = new S3Client({
      region: "auto",
      endpoint: getEndpointUrl(),
      credentials: {
        accessKeyId: STORAGE_ACCESS_KEY_ID,
        secretAccessKey: STORAGE_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: STORAGE_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    const publicUrl = `${STORAGE_PUBLIC_URL}/${filename}`;

    return NextResponse.json({ 
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to upload file" 
    }, { status: 500 });
  }
}