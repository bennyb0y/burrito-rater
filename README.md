# 🌯 Burrito Rater

A web application for discovering and rating the best breakfast burritos in Los Angeles. Built with Next.js, TypeScript, and Google Maps API.

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/bennyb0y/burrito-rater.git
   cd burrito-rater
   npm install
   ```

2. **Set up Google Maps API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable these APIs in "APIs & Services" > "Library":
     - Maps JavaScript API
     - Places API
   - Create credentials:
     - Go to "APIs & Services" > "Credentials"
     - Click "Create Credentials" > "API Key"
     - Copy your API key
   - Configure API key restrictions:
     - Click on your API key to edit
     - Under "Application restrictions", select "HTTP referrers (websites)"
     - Add these domains:
       ```
       localhost
       localhost:3000
       127.0.0.1
       127.0.0.1:3000
       ```
     - Under "API restrictions", select "Restrict key"
     - Select the APIs you enabled (Maps JavaScript API and Places API)
     - Click "Save"

3. **Set up Environment**
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Maps API key to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features

### 🗺️ Interactive Map
- Real-time location search with Google Maps
- Color-coded burrito ratings
- Click-to-rate any restaurant
- Visual rating distribution

### ⭐ Rating Systems
- Overall rating (1-5)
- Taste rating (1-5)
- Value rating (1-5)
- Price tracking
- Ingredient tracking:
  - 🥔 Potatoes
  - 🧀 Cheese
  - 🥓 Bacon
  - 🌶️ Chorizo
  - 🧅 Onion
  - 🥬 Vegetables
- Authenticated user reviews

### 👤 User Features
- Anonymous or named reviews
- Unique emoji identifiers
- Personal rating history
- Sort by rating or price

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps API, @react-google-maps/api
- **Database**: Prisma with SQLite
- **API**: Next.js API Routes

## 📱 Screenshots

[Coming Soon]

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🙏 Credits

Created by [@bennyb0y](https://github.com/bennyb0y)

## 🔄 Latest Updates

- Added emoji-based user identification
- Improved map interaction
- Enhanced rating form UI
- Added sorting and filtering options
- Fixed Git integration in Cursor
