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
   Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```
   
   Add your Google Maps API key and API base URL to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev
   ```
   
   > **Important**: 
   > - The `.env.local` file is automatically ignored by Git (see `.gitignore`)
   > - All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
   > - Never commit API keys or sensitive information to version control
   > - For production, set environment variables in your hosting platform (e.g., Vercel)

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

   > **Note**: This project uses Cloudflare D1 as its database and Cloudflare Workers for the API. The API is hosted at https://your-worker-name.your-account.workers.dev and connects to the Cloudflare D1 database. See [docs/CLOUDFLARE_MIGRATION.md](docs/CLOUDFLARE_MIGRATION.md) for more details.

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
- **Database**: Cloudflare D1
- **API**: Cloudflare Workers

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
- Migrated to Cloudflare D1 and Workers
- Reorganized documentation into `/docs` directory

## 📚 Documentation

All project documentation is available in the [docs](./docs) directory:

- [Cloudflare Migration Guide](./docs/CLOUDFLARE_MIGRATION.md) - Details about the migration from SQLite to Cloudflare D1
- [Development Guidelines](./docs/CURSOR_RULES.md) - Coding standards and development guidelines

## Cloud Architecture

This project has been migrated from SQLite with Prisma to Cloudflare D1. The application now uses:

- **Cloudflare D1** as the database
- **Cloudflare Workers** for the API (hosted at https://your-worker-name.your-account.workers.dev)
- **Next.js** for the frontend (running locally or deployed to your preferred hosting platform)

### Development Setup

To run the application locally, you only need to start the Next.js development server:

```bash
npm run dev
```

This starts the Next.js app on http://localhost:3000, which connects to the Cloudflare Worker API hosted in the cloud.

### Local Development with Local API

If you need to make changes to the API or database schema, you can still run the worker locally:

1. Start the Cloudflare Worker locally:
   ```bash
   npm run dev:d1
   ```
   This starts the Cloudflare Worker on http://localhost:8787

2. Update your `.env.local` file to use the local worker:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Deployment

To deploy changes to the Cloudflare Worker:

```bash
npm run deploy:worker
```

This will publish your worker to Cloudflare.
