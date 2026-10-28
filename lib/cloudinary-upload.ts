import "server-only";

import { createHash } from "node:crypto";

export const MAX_CLOUDINARY_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FORMATS = "jpg,png,webp";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class CloudinaryUploadError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function safeCloudinaryMessage(message: unknown, secrets: string[]) {
  if (typeof message !== "string") return "Cloudinary returned no diagnostic message.";
  let safeMessage = message.replace(/[\r\n\t]+/g, " ").trim();
  for (const secret of secrets) {
    if (secret) safeMessage = safeMessage.split(secret).join("[redacted]");
  }
  return safeMessage
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[redacted database URI]")
    .replace(/(api[_ -]?secret\s*[=:]\s*)\S+/gi, "$1[redacted]")
    .slice(0, 240);
}

function imageBytesMatchType(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function uploadImageToCloudinary(file: File, folder: string) {
  if (!/^gallery-of-arts\/[a-z0-9-]+$/.test(folder)) {
    throw new CloudinaryUploadError("Invalid image upload destination.", 400);
  }
  if (file.size === 0) throw new CloudinaryUploadError("Choose a non-empty image file.", 400);
  if (file.size > MAX_CLOUDINARY_IMAGE_BYTES) throw new CloudinaryUploadError("Choose an image between 1 byte and 5 MB.", 413);
  if (!ALLOWED_TYPES.has(file.type)) throw new CloudinaryUploadError("Use a JPG, PNG, or WebP image.", 415);

  const fileBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuffer);
  if (!imageBytesMatchType(fileBytes, file.type)) {
    throw new CloudinaryUploadError("The selected file does not match its image type.", 415);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret || [cloudName, apiKey, apiSecret].some((value) => /^your_/i.test(value))) {
    throw new CloudinaryUploadError("Cloudinary is not configured on the Next.js server.", 503);
  }
  if (!/^[a-z0-9-]+$/i.test(cloudName) || !/^\d+$/.test(apiKey)) {
    throw new CloudinaryUploadError("Cloudinary configuration is invalid. Check the server cloud name and API key.", 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParameters = `allowed_formats=${ALLOWED_FORMATS}&folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(`${signedParameters}${apiSecret}`).digest("hex");
  const cloudinaryForm = new FormData();
  cloudinaryForm.set("file", new Blob([fileBuffer], { type: file.type }), file.name);
  cloudinaryForm.set("api_key", apiKey);
  cloudinaryForm.set("timestamp", String(timestamp));
  cloudinaryForm.set("folder", folder);
  cloudinaryForm.set("allowed_formats", ALLOWED_FORMATS);
  cloudinaryForm.set("signature", signature);

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: "POST",
      body: cloudinaryForm,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Could not reach Cloudinary for image upload:", error instanceof Error ? error.name : "UnknownError");
    throw new CloudinaryUploadError("Could not reach Cloudinary. Check the Next.js server network connection and retry.", 502);
  }

  const result = await response.json().catch(() => null) as { secure_url?: unknown; error?: { message?: unknown } } | null;
  const secureUrl = result?.secure_url;
  if (!response.ok || typeof secureUrl !== "string" || !secureUrl.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`)) {
    const message = safeCloudinaryMessage(result?.error?.message, [apiSecret, apiKey]);
    console.error("Cloudinary image upload was rejected:", { status: response.status, message });
    if (response.status === 401 || response.status === 403) throw new CloudinaryUploadError("Cloudinary rejected the API credentials or upload signature. Verify the server credentials and clock.", 502);
    if (response.status === 404) throw new CloudinaryUploadError("Cloudinary could not find this cloud environment. Check CLOUDINARY_CLOUD_NAME.", 502);
    if (response.status >= 400 && response.status < 500) throw new CloudinaryUploadError(`Cloudinary rejected the image upload: ${message}`, 502);
    throw new CloudinaryUploadError("Cloudinary image upload failed. Please retry.", 502);
  }

  return secureUrl;
}

export function logImageUploadError(label: string, error: unknown) {
  console.error(label, {
    name: error instanceof Error ? error.name : "UnknownError",
    message: safeCloudinaryMessage(error instanceof Error ? error.message : "Unknown server error", [
      process.env.CLOUDINARY_API_KEY || "",
      process.env.CLOUDINARY_API_SECRET || "",
    ]),
  });
}
