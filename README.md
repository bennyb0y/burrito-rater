# Benny's Burrito Rating

A web application for rating and reviewing burritos across Los Angeles, with a focus on breakfast burritos.

## Features

### Map Interface
- Interactive Google Maps integration
- Search for locations with autocomplete
- Click on the map to find nearby restaurants
- View all burrito ratings as markers on the map
- Color-coded markers based on rating (1-5 stars)
- Click markers to view detailed ratings

### Rating System
- Rate burritos on multiple criteria:
  - Overall rating (1-5)
  - Taste rating (1-5)
  - Value rating (1-5)
  - Price
- Track ingredients:
  - Potatoes
  - Cheese
  - Bacon
  - Chorizo
  - Onion
  - Vegetables
- Add detailed reviews
- Optional reviewer identity with unique emoji generation

### List View
- Toggle between map and list views
- Sort ratings by:
  - Overall rating (high to low)
  - Price (high to low)
- View key information at a glance:
  - Restaurant name
  - Burrito title
  - Overall rating
  - Price
  - Taste and value ratings
  - Reviewer information
  - Review preview

### User Identity
- Optional reviewer name
- Unique emoji generation based on username/password
- Consistent identity across reviews
- Visual representation in both map and list views

## Technical Stack

- Next.js 14 with App Router
- TypeScript
- Google Maps API
- Prisma with SQLite
- Tailwind CSS
- React Google Maps API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with your Google Maps API key:
     ```
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Components

### Map Component (`app/components/Map.tsx`)
- Main interface for viewing and interacting with burrito ratings
- Handles map interactions, markers, and info windows
- Manages state for selected locations and ratings
- Provides search functionality for locations

### Rating Form (`app/components/RatingForm.tsx`)
- Form for submitting new burrito ratings
- Sliders for rating different aspects (overall, taste, value)
- Ingredient checkboxes
- Price input
- Optional reviewer identity fields

### API Routes
- `/api/ratings`: Handles CRUD operations for burrito ratings
- `/api/ratings/[id]`: Manages individual rating operations

### Database Schema
- Stores ratings with:
  - Location data (latitude, longitude)
  - Rating scores
  - Price
  - Ingredients
  - Reviews
  - Reviewer information

## Contributing

Feel free to submit issues and enhancement requests!
