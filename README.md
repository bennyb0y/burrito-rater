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
- **Hosting**: Cloudflare Pages

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
- Removed migration scripts and unused API routes
- Deployed frontend to Cloudflare Pages
- Removed local D1 development setup (using cloud as single source of truth)

## 📚 Documentation

All project documentation is available in the [docs](./docs) directory:

- [Cloudflare Migration Guide](./docs/CLOUDFLARE_MIGRATION.md) - Details about the migration from SQLite to Cloudflare D1
- [Cloudflare Pages Deployment Guide](./docs/CLOUDFLARE_PAGES.md) - Guide for deploying the frontend to Cloudflare Pages
- [Development Workflow Guide](./docs/WORKFLOW.md) - Complete CI/CD workflow from development to deployment
- [Development Guidelines](./docs/CURSOR_RULES.md) - Coding standards and development guidelines

## Cloud Architecture

This project uses a cloud-first architecture:

- **Cloudflare D1** as the database (single source of truth)
- **Cloudflare Workers** for the API (hosted at https://your-worker-name.your-account.workers.dev)
- **Cloudflare Pages** for the frontend (automatically deployed from GitHub)

### Development Setup

To run the application locally, start the Next.js development server:

```bash
npm run dev
```

This starts the Next.js app on http://localhost:3000, which connects to the Cloudflare Worker API hosted in the cloud.

### Deployment

#### API Deployment

To deploy changes to the Cloudflare Worker API:

```bash
npm run deploy:worker
```

#### Frontend Deployment

The frontend is automatically deployed to Cloudflare Pages when you push to the main branch of your GitHub repository. You can also manually deploy it with:

```bash
npm run build
npm run pages:build
npm run pages:deploy
```

For local testing of the Cloudflare Pages build:

```bash
npm run build
npm run pages:build
npm run pages:dev
```

#### Important Configuration

For Cloudflare Pages deployment, ensure:

1. The `wrangler.toml` file includes:
   ```toml
   compatibility_flags = ["nodejs_compat"]
   pages_build_output_dir = ".vercel/output/static"
   ```

2. The `nodejs_compat` compatibility flag is also set in the Cloudflare Pages dashboard:
   - Go to your project settings
   - Navigate to the "Functions" or "Build & Deploy" section
   - Find "Compatibility flags"
   - Add `nodejs_compat` as a compatibility flag for both Production and Preview environments

Without this flag, the application will fail with a "Node.JS Compatibility Error" message.

For more details, see the [Cloudflare Pages Deployment Guide](./docs/CLOUDFLARE_PAGES.md).
