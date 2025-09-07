# Comparion 🔍

**Comparion** is a smart product comparison PWA powered by SearXNG search and Gemini AI. It helps users make informed purchasing decisions by providing structured side-by-side comparisons with key specs, pros/cons, and pricing.

![Comparion Demo](public/demo-screenshot.png)

## ✨ Features

- **Smart Search**: Powered by SearXNG for comprehensive product search
- **AI-Powered Analysis**: Gemini AI provides structured comparisons
- **PWA Ready**: Installable on desktop and mobile devices
- **Session Management**: Save and revisit previous comparisons
- **Responsive Design**: Works seamlessly on all devices
- **Product Categories**: 
  - General products with features, pricing, pros/cons
  - Advanced tech products with detailed specs (CPU, RAM, GPU, etc.)
- **Smart Recommendations**: 
  - 🏆 Best Overall
  - 💸 Best Budget
  - 🚀 Best Performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Gemini AI API key
- SearXNG instance (optional - uses public instance by default)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd comparion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   # Required: Get your Gemini AI API key from Google AI Studio
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional: Use your own SearXNG instance
   SEARXNG_BASE_URL=http://localhost:8080
   
   # Optional: Configure app URL for PWA
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Getting Gemini AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your `.env.local` file

### Setting up SearXNG (Optional)

For better search results, you can set up your own SearXNG instance:

1. **Using Docker:**
   ```bash
   docker run -d --name searxng -p 8080:8080 searxng/searxng
   ```

2. **Update your `.env.local`:**
   ```env
   SEARXNG_BASE_URL=http://localhost:8080
   ```

## 🏗️ Project Structure

```
comparion/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/
│   │   │   └── search/      # Search API endpoint
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ComparisonResults.tsx
│   │   ├── ComparisonSummaryCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── SearchInterface.tsx
│   │   └── SessionSidebar.tsx
│   ├── lib/                 # Utility libraries
│   │   ├── gemini.ts        # Gemini AI integration
│   │   └── searxng.ts       # SearXNG search integration
│   └── types/               # TypeScript type definitions
│       └── index.ts
├── public/                  # Static assets
│   └── manifest.json        # PWA manifest
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
└── next.config.js           # Next.js configuration
```

## 🎯 Usage

### Basic Search
1. Enter a product query (e.g., "Best smartphones under $500")
2. Click "Search" or press Enter
3. View the AI-generated comparison with product cards
4. Expand cards for detailed specifications

### Advanced Queries
- "Compare iPhone 15 vs Samsung Galaxy S24"
- "Best gaming laptops with RTX 4070"
- "Budget wireless headphones with good battery"

### Session Management
- Previous searches are saved in the sidebar
- Click on any previous session to reload the comparison
- Continue conversations by asking follow-up questions

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: Google Gemini AI API
- **Search**: SearXNG API
- **PWA**: Next.js PWA features

### API Endpoints

- `POST /api/search` - Main search and comparison endpoint
  ```json
  {
    "query": "Best laptops under $1000",
    "context": "Previous conversation context",
    "sessionId": "uuid"
  }
  ```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
```bash
# Build the image
docker build -t comparion .

# Run the container
docker run -p 3000:3000 comparion
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **"No search results found"**
   - Check your internet connection
   - Verify SearXNG instance is accessible
   - Try a different search query

2. **"Gemini API error"**
   - Verify your `GEMINI_API_KEY` is correct
   - Check your Google AI Studio quota
   - Ensure the API key has proper permissions

3. **PWA not installing**
   - Ensure you're using HTTPS in production
   - Check the manifest.json file
   - Verify service worker is registered

### Development Mode

In development mode, the app uses mock data if external services are unavailable. This allows you to work on the UI without requiring API keys.

## 🔮 Future Features

- [ ] User authentication with Google OAuth
- [ ] Export comparisons as PDF
- [ ] Product price tracking
- [ ] Advanced filtering and sorting
- [ ] Mobile app version
- [ ] Analytics dashboard
- [ ] Integration with shopping platforms

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the configuration guide

---

**Made with ❤️ by the Comparion team**
