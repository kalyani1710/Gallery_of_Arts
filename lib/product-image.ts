export const MAX_PRODUCT_IMAGES = 10;

export function isValidProductImage(value: string) {
  if (!value || value.length > 500) return false;
  if (/^\/images\/[a-zA-Z0-9/_\-.]+$/.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === "res.cloudinary.com"
      && /^\/[a-z0-9_-]+\/image\/upload\//i.test(url.pathname);
  } catch {
    return false;
  }
}

export function normalizeProductImages(mainImage: string, value: unknown): string[] | null {
  if (value !== undefined && (!Array.isArray(value) || value.length > MAX_PRODUCT_IMAGES || value.some((image) => typeof image !== "string"))) {
    return null;
  }

  const requestedImages = value === undefined ? [] : value as string[];
  const images = [...new Set([mainImage, ...requestedImages.map((image) => image.trim()).filter(Boolean)])];
  if (images.length === 0 || images.length > MAX_PRODUCT_IMAGES || images.some((image) => !isValidProductImage(image))) {
    return null;
  }
  return images;
}
