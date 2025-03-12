# 🌯 Burrito Rater

A web application for rating and discovering burritos, built with Next.js and deployed on Cloudflare Pages and Cloudflare D1.

## 🚀 Features

- **🗺️ Interactive Map**: View burrito ratings on a Google Map
- **⭐ Rating Submission**: Submit ratings for burritos with details like price, taste, and comments
- **📋 Rating List**: Browse all submitted ratings in a sortable list
- **🔐 Admin Interface**: Manage and confirm ratings through an admin portal
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔄 Real-time Updates**: Updates are reflected instantly

## 💻 Tech Stack

- **Frontend**:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - Google Maps API

- **Backend**:
  - Cloudflare Workers
  - Cloudflare D1 (Edge Database)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v10 or later)
- Google Maps API key
- Cloudflare account

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
     - Add your domains (localhost, your production domain, etc.)
     - Under "API restrictions", select "Restrict key"
     - Select the APIs you enabled (Maps JavaScript API and Places API)
     - Click "Save"

4. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_API_BASE_URL=https://your-worker-name.your-account.workers.dev
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```

   > **Important**: 
   > - The `.env.local` file is automatically ignored by Git (see `.gitignore`)
   > - All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
   > - Never commit API keys or sensitive information to version control
   > - For production, set environment variables in your hosting platform

### Development

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Cloudflare account with Workers and D1 enabled
- Google Maps API key

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in required values
4. Start the development server:
   ```bash
   npm run dev
   ```

### Development Tools

#### Bundle Analysis
The project includes bundle analysis tools to help optimize performance:

```bash
# Run bundle analyzer
npm run analyze
```

This will generate an interactive visualization of the bundle composition at:
- `dist/analyze/client.html` - Client-side bundles
- `dist/analyze/edge.html` - Edge runtime bundles
- `dist/analyze/nodejs.html` - Server-side bundles

#### Code Splitting
The application uses Next.js dynamic imports and webpack optimizations to manage bundle sizes:

- Large components (like maps) are loaded dynamically
- Vendor code is split into separate chunks
- CSS is optimized using `critters`

### Available Scripts

```bash
# Development
npm run dev          # Start Next.js development server
npm run dev:worker   # Start local worker development
npm run analyze      # Analyze bundle sizes

# Deployment
npm run deploy:app   # Deploy to Cloudflare Pages
npm run deploy:worker # Deploy worker
```

The application connects directly to the Cloudflare Worker API, which uses Cloudflare D1 as the database. This ensures that all environments (development and production) use the same data source.

### Deployment

For detailed deployment instructions, see the [Administration and DevOps Guide](./docs/ADMIN_DEVOPS.md).

Quick deployment commands:
```bash
# Deploy API worker
npm run deploy:worker

# Deploy frontend
npm run pages:deploy
```

> **Note**: Always deploy the API worker and frontend separately to avoid Edge Runtime errors. See the [Administration and DevOps Guide](./docs/ADMIN_DEVOPS.md#edge-runtime-error) for more details.

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

For detailed documentation, please refer to the [Documentation Index](./docs/README.md).

The documentation covers:
- Deployment guides
- Admin interface usage
- Database schema
- Development workflows
- DevOps processes
- Product management
  - [Project Roadmap](./docs/PRODUCT_MGMT/ROADMAP.md)
  - [Project Checklist](./docs/PRODUCT_MGMT/TODO_CHECKLIST.md)
  - [Bug Tracking](./docs/PRODUCT_MGMT/BUGS.md)
- And more

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
