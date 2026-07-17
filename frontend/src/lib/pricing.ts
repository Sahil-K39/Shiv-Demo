import { getCurrencyByCode, convertAndFormatPrice } from "./currencies";

export function formatPriceINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPrice(valueInINR: number, currencyCode = "INR"): string {
  const currency = getCurrencyByCode(currencyCode);
  return convertAndFormatPrice(valueInINR, currency);
}
