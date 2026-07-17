export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rateFromINR: number;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    rateFromINR: 1.0,
    locale: "en-IN",
  },
  {
    code: "USD",
    name: "United States Dollar",
    symbol: "$",
    rateFromINR: 0.012,
    locale: "en-US",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    rateFromINR: 0.011,
    locale: "de-DE",
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    symbol: "£",
    rateFromINR: 0.0094,
    locale: "en-GB",
  },
  {
    code: "AED",
    name: "United Arab Emirates Dirham",
    symbol: "AED ",
    rateFromINR: 0.044,
    locale: "en-AE",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    rateFromINR: 0.018,
    locale: "en-AU",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    rateFromINR: 0.016,
    locale: "en-CA",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    rateFromINR: 1.85,
    locale: "ja-JP",
  },
];

export function getCurrencyByCode(code: string): Currency {
  return (
    CURRENCIES.find(
      (c) => c.code.toLowerCase() === (code || "").toLowerCase()
    ) || CURRENCIES[0]
  );
}

export function convertAndFormatPrice(valueInINR: number, currency: Currency): string {
  const converted = valueInINR * currency.rateFromINR;
  
  if (currency.code === "JPY") {
    return `${currency.symbol}${Math.round(converted).toLocaleString("en-US")}`;
  }
  
  if (currency.code === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(valueInINR);
  }

  // Format with clean currency symbol and thousands separator
  const formattedNumber = converted.toLocaleString("en-US", {
    minimumFractionDigits: converted < 100 && converted !== Math.round(converted) ? 2 : 0,
    maximumFractionDigits: converted < 100 && converted !== Math.round(converted) ? 2 : 0,
  });

  return `${currency.symbol}${formattedNumber}`;
}
