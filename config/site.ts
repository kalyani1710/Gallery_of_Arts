export const siteConfig = {
  name: "Gallery of Art",
  tagline: "Handmade Happiness, One Creation at a Time",
  slogan: "Handmade with Love, Created to Make You Smile",
  description:
    "Shop beautiful handmade pipe cleaner crafts, flowers, keychains, home décor, festive decorations and customized gifts from Gallery of Art.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  currency: "INR",
  currencySymbol: "₹",
  location: "India",
  email: process.env.NEXT_PUBLIC_EMAIL || "PLACEHOLDER_EMAIL",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "PLACEHOLDER_INSTAGRAM",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "PLACEHOLDER_YOUTUBE",
  announcement:
    "✨ Handmade with Love | Custom Orders Available | Shop Our Festive Collection ✨",
  shipping: {
    standard: 79,
    freeAbove: 999,
    disclaimer:
      "These shipping values are sample configuration for the website and are not the final business policy.",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/tutorials", label: "DIY Tutorials" },
  { href: "/about", label: "About" },
] as const;

export const shopDropdown = [
  { href: "/shop?category=flowers", label: "Flowers" },
  { href: "/shop?category=keychains", label: "Keychains" },
  { href: "/shop?category=hair-accessories", label: "Hair Accessories" },
  { href: "/shop?category=home-decor", label: "Home Décor" },
  { href: "/shop?category=pooja", label: "Pooja Décor" },
  { href: "/shop?category=gifts", label: "Gifts" },
] as const;

export const collectionDropdown = [
  { href: "/collections/diwali", label: "Diwali" },
  { href: "/collections/ganpati", label: "Ganpati" },
  { href: "/collections/navratri", label: "Navratri" },
  { href: "/collections/janmashtami", label: "Janmashtami" },
  { href: "/collections/kanya-pujan", label: "Kanya Pujan" },
  { href: "/collections/wedding-gifts", label: "Wedding Gifts" },
] as const;
