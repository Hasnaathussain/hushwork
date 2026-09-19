export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(priceCents / 100);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
