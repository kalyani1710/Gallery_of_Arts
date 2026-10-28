import { siteConfig } from "@/config/site";

export function getWhatsAppNumber() {
  return siteConfig.whatsapp.replace(/[^\d]/g, "");
}

export function createWhatsAppMessage(lines: string[]) {
  return lines.join("\n");
}

export function createWhatsAppUrl(message: string) {
  const number = getWhatsAppNumber();
  const text = encodeURIComponent(message);
  if (!number) {
    return `https://wa.me/?text=${text}`;
  }
  return `https://wa.me/${number}?text=${text}`;
}

export function productOrderMessage(input: {
  name: string;
  quantity: number;
  price: number;
  color?: string;
}) {
  return createWhatsAppMessage([
    `Hello ${siteConfig.name}!`,
    "I would like to order:",
    "",
    `Product:`,
    input.name,
    "",
    `Quantity:`,
    String(input.quantity),
    "",
    `Price:`,
    `₹${input.price} each`,
    input.color ? `\nColour:\n${input.color}` : "",
    "",
    "Please share availability and delivery details.",
  ]);
}

export function cartOrderMessage(input: {
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  customer?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes?: string;
  };
}) {
  const itemLines = input.items.flatMap((item) => [
    `${item.name}`,
    `Qty: ${item.quantity} × ₹${item.price}`,
    "",
  ]);

  const customerLines = input.customer
    ? [
        "Customer details:",
        `Name: ${input.customer.name}`,
        `Phone: ${input.customer.phone}`,
        `Email: ${input.customer.email}`,
        `Address: ${input.customer.address}, ${input.customer.city}, ${input.customer.state} ${input.customer.pincode}`,
        input.customer.notes ? `Notes: ${input.customer.notes}` : "",
        "",
      ]
    : [];

  return createWhatsAppMessage([
    `Hello ${siteConfig.name}!`,
    "I would like to place an order:",
    "",
    ...itemLines,
    `Subtotal: ₹${input.subtotal}`,
    `Shipping: ₹${input.shipping}`,
    `Total: ₹${input.total}`,
    "",
    ...customerLines,
    "Please share availability and delivery details.",
  ]);
}

export function customOrderMessage(input: {
  name: string;
  phone: string;
  productType: string;
  occasion: string;
  details: string;
}) {
  return createWhatsAppMessage([
    `Hello ${siteConfig.name}!`,
    "I would like to discuss a custom handmade order.",
    "",
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    `Product type: ${input.productType}`,
    `Occasion: ${input.occasion}`,
    "",
    "Details:",
    input.details || "I have an idea in mind.",
  ]);
}

export function contactMessage() {
  return createWhatsAppMessage([
    `Hello ${siteConfig.name}!`,
    "I would like to know more about your handmade crafts.",
  ]);
}
