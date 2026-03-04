# System Settings Guide

## Overview

The system settings (timezone and currency) configured in Company Info are now available globally throughout the application. Any changes to these settings will automatically update all displays across the entire app.

## How It Works

### 1. System Settings Provider

The `SystemSettingsProvider` wraps your entire application and provides:
- Current timezone
- Current currency
- Company name and logo
- Formatting functions for currency and dates

### 2. Usage in Components

#### Using the Hook (Client Components)

```tsx
"use client"

import { useSystemSettings } from "@/contexts/system-settings-context"

export function MyComponent() {
  const { settings, formatCurrency, formatDate, formatDateTime } = useSystemSettings()

  return (
    <div>
      <p>Company: {settings.company}</p>
      <p>Timezone: {settings.timezone}</p>
      <p>Currency: {settings.currency}</p>
      
      {/* Format a price */}
      <p>Price: {formatCurrency(1299.99)}</p>
      
      {/* Format a date */}
      <p>Date: {formatDate(new Date())}</p>
      
      {/* Format a datetime */}
      <p>Created: {formatDateTime(new Date())}</p>
    </div>
  )
}
```

#### Using Utility Functions (Server Components or Outside Context)

```tsx
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format-utils"

export function ServerComponent({ asset }) {
  // You need to pass the currency/timezone from props or fetch it
  const currency = 'USD' // Get from settings
  const timezone = 'America/New_York' // Get from settings

  return (
    <div>
      <p>Cost: {formatCurrency(asset.cost, currency)}</p>
      <p>Purchase Date: {formatDate(asset.purchaseDate, timezone)}</p>
    </div>
  )
}
```

#### Using Ready-Made Components

```tsx
import { CurrencyDisplay } from "@/components/currency-display"
import { DateDisplay } from "@/components/date-display"

export function AssetCard({ asset }) {
  return (
    <div>
      <h3>{asset.name}</h3>
      <p>Cost: <CurrencyDisplay amount={asset.cost} /></p>
      <p>Purchase Date: <DateDisplay date={asset.purchaseDate} /></p>
      <p>Created: <DateDisplay date={asset.createdAt} format="datetime" /></p>
    </div>
  )
}
```

## Supported Currencies

The system supports 30+ currencies with proper symbols:
- USD ($), EUR (€), GBP (£), JPY (¥), CHF, CAD (C$)
- AUD (A$), NZD (NZ$), CNY (¥), INR (₹), KRW (₩), SGD (S$)
- And many more...

## Supported Timezones

50+ timezones covering all major regions:
- Americas: New_York, Chicago, Los_Angeles, Toronto, Mexico_City, Sao_Paulo, etc.
- Europe: London, Paris, Berlin, Madrid, Rome, Moscow, etc.
- Asia: Tokyo, Shanghai, Singapore, Hong Kong, Seoul, Dubai, etc.
- Australia: Sydney, Melbourne, Brisbane, Perth
- Africa: Cairo, Johannesburg, Lagos, Nairobi

## Automatic Updates

When you change the timezone or currency in Company Info:
1. The settings are saved to the database
2. A `companyInfoUpdated` event is dispatched
3. All components using `useSystemSettings` automatically refresh
4. All currency and date displays update immediately

## Example: Updating Asset Display

### Before (Hardcoded)
```tsx
<p>Cost: ${asset.cost.toFixed(2)}</p>
<p>Date: {new Date(asset.date).toLocaleDateString()}</p>
```

### After (Using System Settings)
```tsx
<p>Cost: <CurrencyDisplay amount={asset.cost} /></p>
<p>Date: <DateDisplay date={asset.date} /></p>
```

## Best Practices

1. **Use Components When Possible**: `<CurrencyDisplay>` and `<DateDisplay>` automatically handle system settings
2. **Use Hook in Client Components**: Access `useSystemSettings()` for full flexibility
3. **Use Utility Functions in Server Components**: Import from `@/lib/format-utils`
4. **Always Handle Loading States**: Check `isLoading` when using the hook

## Next Steps

To update existing pages to use system settings:

1. Import the hook or components:
   ```tsx
   import { useSystemSettings } from "@/contexts/system-settings-context"
   import { CurrencyDisplay } from "@/components/currency-display"
   import { DateDisplay } from "@/components/date-display"
   ```

2. Replace hardcoded currency displays:
   ```tsx
   // Replace this:
   ${cost.toFixed(2)}
   
   // With this:
   <CurrencyDisplay amount={cost} />
   ```

3. Replace hardcoded date displays:
   ```tsx
   // Replace this:
   {new Date(date).toLocaleDateString()}
   
   // With this:
   <DateDisplay date={date} />
   ```

## Files Created

- `src/contexts/system-settings-context.tsx` - Main provider and hook
- `src/lib/format-utils.ts` - Utility functions for server components
- `src/components/currency-display.tsx` - Reusable currency component
- `src/components/date-display.tsx` - Reusable date component

## Testing

1. Go to `/setup/company-info`
2. Change timezone to "Asia/Tokyo"
3. Change currency to "JPY" (¥)
4. Save changes
5. Navigate to any page with currency/date displays
6. Values should automatically show in yen with Tokyo timezone

## Support

All 30+ currencies have proper symbols and formatting.
All 50+ timezones use proper IANA timezone identifiers.





