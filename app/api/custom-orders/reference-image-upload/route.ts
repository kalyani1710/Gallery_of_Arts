import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { CloudinaryUploadError, logImageUploadError, MAX_CLOUDINARY_IMAGE_BYTES, uploadImageToCloudinary } from "@/lib/cloudinary-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!(await getSession())) return NextResponse.json({ error: "Please sign in before uploading a reference image." }, { status: 401 });

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_CLOUDINARY_IMAGE_BYTES + 64 * 1024) {
      return NextResponse.json({ error: "Choose an image smaller than 5 MB." }, { status: 413 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Choose a valid image file to upload." }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    const secureUrl = await uploadImageToCloudinary(file, "gallery-of-arts/custom-order-references");
    return NextResponse.json({ secureUrl }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof CloudinaryUploadError) return NextResponse.json({ error: error.message }, { status: error.status });
    logImageUploadError("Custom order reference image upload failed:", error);
    return NextResponse.json({ error: "The reference image could not be uploaded. Please retry." }, { status: 500 });
  }
}
