# Burrito Rater Codebase Reference

This document provides a comprehensive reference of all custom variables and functions used throughout the Burrito Rater application.

## Table of Contents
- [Environment Variables](#environment-variables)
- [Types and Interfaces](#types-and-interfaces)
- [Utility Functions](#utility-functions)
- [Map Component Functions](#map-component-functions)
- [Rating Form Functions](#rating-form-functions)
- [State Variables](#state-variables)

## Environment Variables

### API Configuration
- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the Cloudflare Worker API
  - Used in: `app/config.js`, API requests
  - Example: `https://your-worker-name.your-account.workers.dev`

### Authentication
- `NEXT_PUBLIC_ADMIN_PASSWORD`: Password for admin access
  - Used in: `app/admin/layout.tsx`
  - Purpose: Protects admin interface

### Google Maps
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
  - Used in: `app/components/Map.tsx`
  - Purpose: Required for map functionality

### CAPTCHA
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key
  - Used in: `app/components/RatingForm.tsx`
  - Purpose: Bot protection for rating submissions

## Types and Interfaces

### Rating Interface
```typescript
interface Rating {
  id: string;
  latitude: number;
  longitude: number;
  burritoTitle: string;
  rating: number;
  taste: number;
  value: number;
  price: number;
  restaurantName: string;
  review?: string;
  reviewerName?: string;
  reviewerEmoji?: string;
  hasPotatoes: boolean;
  hasCheese: boolean;
  hasBacon: boolean;
  hasChorizo: boolean;
  hasAvocado: boolean;
  hasVegetables: boolean;
  confirmed?: number;
}
```
- Used in: `app/components/Map.tsx`, `app/components/RatingList.tsx`
- Purpose: Defines the structure of a burrito rating

### Position Interface
```typescript
interface Position {
  lat: number;
  lng: number;
  name: string;
  address: string;
}
```
- Used in: `app/components/Map.tsx`, `app/components/RatingForm.tsx`
- Purpose: Defines location data structure

## Utility Functions

### `getApiUrl(endpoint: string): string`
- Location: `app/config.js`
- Purpose: Constructs API endpoint URLs
- Usage: `getApiUrl('ratings')` → `${NEXT_PUBLIC_API_BASE_URL}/ratings`

### `validatePassword(password: string): boolean`
- Location: `app/utils/auth.ts`
- Purpose: Validates user identity passwords
- Usage: Used in RatingForm for reviewer identity validation

### `generateUserEmoji(password: string): string`
- Location: `app/utils/auth.ts`
- Purpose: Generates consistent emoji for user identities
- Usage: Used in RatingForm for reviewer emoji generation

### `extractZipcode(address: string): string | undefined`
- Location: `app/components/RatingForm.tsx`
- Purpose: Extracts zipcode from address string
- Usage: Used when submitting ratings

## Map Component Functions

### `getRatingColor(rating: number, isStroke: boolean = false): string`
- Location: `app/components/Map.tsx`
- Purpose: Returns color for rating markers
- Usage: Used for map marker styling

### `handleSelectRating(rating: Rating): void`
- Location: `app/components/Map.tsx`
- Purpose: Handles rating marker click events
- Usage: Shows rating details in InfoWindow

### `handleStartRating(): void`
- Location: `app/components/Map.tsx`
- Purpose: Initiates rating submission process
- Usage: Opens rating form modal

## Rating Form Functions

### `getRatingEmoji(rating: number): string`
- Location: `app/components/RatingForm.tsx`
- Purpose: Returns emoji based on rating value
- Usage: Visual feedback in rating form

### `getPriceEmoji(price: number): string`
- Location: `app/components/RatingForm.tsx`
- Purpose: Returns emoji based on price value
- Usage: Visual feedback in rating form

### `handleTurnstileVerify(token: string): void`
- Location: `app/components/RatingForm.tsx`
- Purpose: Handles CAPTCHA verification
- Usage: Processes Turnstile CAPTCHA responses

## State Variables

### Map Component States
- `refreshTrigger`: Controls map data refresh
  - Location: `app/page.tsx`
  - Type: `number`
  - Purpose: Triggers map data refresh

- `selectedRating`: Currently selected rating
  - Location: `app/components/Map.tsx`
  - Type: `Rating | null`
  - Purpose: Controls InfoWindow display

### Rating Form States
- `isSubmitting`: Form submission state
  - Location: `app/components/RatingForm.tsx`
  - Type: `boolean`
  - Purpose: Controls form submission UI

- `ingredients`: Selected burrito ingredients
  - Location: `app/components/RatingForm.tsx`
  - Type: `Record<string, boolean>`
  - Purpose: Tracks ingredient checkboxes

## Constants

### Map Configuration
```typescript
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  // ... other options
};
```
- Location: `app/components/Map.tsx`
- Purpose: Configures Google Maps instance

### Default Map Center
```typescript
const defaultCenter = {
  lat: 34.0011,
  lng: -118.4285
};
```
- Location: `app/components/Map.tsx`
- Purpose: Sets initial map center (Mar Vista, CA) 