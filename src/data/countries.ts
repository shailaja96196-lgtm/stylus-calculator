export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

export const COUNTRIES: CountryConfig[] = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$' },
  { code: 'AE', name: 'UAE', currency: 'AED', symbol: 'د.إ' },
];