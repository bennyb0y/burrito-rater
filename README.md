# 🌯 Burrito Rater

A web application for rating and discovering burritos. Users can submit ratings for burritos they've tried, view ratings on a map, and browse a list of all ratings.

## 🚀 Features

- **🗺️ Interactive Map**: View burrito ratings on a Google Map
- **⭐ Rating Submission**: Submit ratings for burritos with details like price, taste, and comments
- **📋 Rating List**: Browse all submitted ratings in a sortable list
- **🔐 Admin Interface**: Manage and confirm ratings through an admin portal
- **📱 Responsive Design**: Works on desktop and mobile devices

## 💻 Tech Stack

- **Frontend**:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - Google Maps API

- **Backend**:
  - Cloudflare Workers
  - Cloudflare D1 (SQLite-compatible database)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Cloudflare account (for deployment)
- Google Maps API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bennyb0y/burrito-rater.git
   cd burrito-rater
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up Google Maps API**
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

4. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```

   For development with a separate API server, you can also add:
   ```
   NEXT_PUBLIC_DEV_API_BASE_URL=http://localhost:8787
   ```

   > **Important**: 
   > - The `.env.local` file is automatically ignored by Git (see `.gitignore`)
   > - All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
   > - Never commit API keys or sensitive information to version control
   > - For production, set environment variables in your hosting platform

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. (Optional) To run a local API server for development:
   ```bash
   npx wrangler dev worker.js --config wrangler.worker.toml
   ```
   This will start a local API server at http://localhost:8787 that you can use for development.

### Building for Production

1. Build the application:
   ```bash
   npm run pages:build
   ```

2. The build output will be in the `.vercel/output` directory.

## 🚢 Deployment

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
burrito-rater/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin interface
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── list/             # Rating list page
│   └── page.tsx          # Home page (map view)
├── public/               # Static assets
├── docs/                 # Documentation
├── worker/               # Cloudflare Worker code
├── next.config.ts        # Next.js configuration
└── package.json          # Project dependencies
```

## 📚 Documentation

All project documentation is available in the [docs](./docs) directory:

- [Deployment Guide](./docs/DEPLOYMENT.md) - Instructions for deploying the application
- [Admin Interface Guide](./docs/ADMIN_GUIDE.md) - Guide for using the admin interface
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Details about the database schema and structure
- [Cloudflare Migration Guide](./docs/CLOUDFLARE_MIGRATION.md) - Details about the migration from SQLite to Cloudflare D1

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Google Maps API](https://developers.google.com/maps)
- [Tailwind CSS](https://tailwindcss.com/)
