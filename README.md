# MyDebugTools

A professional collection of 30+ developer tools built with Next.js 14 and React. Fast, reliable, and always free - featuring a clean, Postman-inspired interface.

[![GitHub stars](https://img.shields.io/github/stars/jasimvk/mydebugtools?style=social)](https://github.com/jasimvk/mydebugtools/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/jasimvk/mydebugtools)](https://github.com/jasimvk/mydebugtools/issues)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🔧 Core Developer Tools

- **JSON Tools** - Format, validate, minify, and transform JSON with syntax highlighting
- **JWT Decoder** - Decode and verify JWT tokens with detailed header/payload inspection
- **Base64 Converter** - Encode/decode text and files (images, PDFs) to Base64
- **Code Diff** - Side-by-side code comparison with syntax highlighting
- **HTTP Status** - Complete HTTP status codes reference with descriptions
- **Color Picker** - Pick, convert, and manage colors (HEX, RGB, HSL, CMYK)
- **SVG Optimizer** - Optimize SVG files with 13+ optimization options

### 🚀 Additional Tools
### hidden for now
- **API Tester** - Send HTTP requests with full header/body support
- **Regex Tester** - Test regular expressions with real-time matching
- **CSS Tools** - Minify, beautify, and validate CSS code
- **HTML Tools** - Format, minify, and validate HTML
- **Markdown Preview** - Live markdown editor with preview
- **Icon Finder** - Search and download icons for your projects
- **Crash Beautifier** - Format and analyze stack traces
- **Build Diff** - Compare build outputs
- **Bundle Analyzer** - Analyze JavaScript bundle sizes
- **And 15+ more tools!**

## 🎨 Design

Built with a clean, professional interface inspired by Postman:
- ✅ Inter font (same as Postman)
- ✅ No animations or distractions
- ✅ Clean white navbar with subtle borders
- ✅ Full-width layouts for maximum workspace
- ✅ Mobile-responsive design
- ✅ Professional color scheme (#FF6C37 accent)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jasimvk/mydebugtools.git
   cd mydebugtools
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional):**
   
   Create a `.env.local` file for analytics and ads:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-your-id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests with Jest
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3
- **Language:** TypeScript
- **Icons:** Heroicons, Lucide React
- **Font:** Inter (Google Fonts)
- **Analytics:** Google Analytics 4
- **Testing:** Jest, React Testing Library

## 🤝 How to Contribute

We welcome contributions of all kinds! Here's how you can help:

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Ideas

- 🐛 Report bugs or fix existing ones
- ✨ Suggest or implement new tools
- 📖 Improve documentation
- 🎨 Enhance UI/UX
- ⚡ Performance improvements
- 🧪 Add tests

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

## 💬 Community & Support

- **🐛 Found a bug?** [Open an issue](https://github.com/jasimvk/mydebugtools/issues)
- **💡 Feature request?** [Start a discussion](https://github.com/jasimvk/mydebugtools/discussions)
- **❓ Questions?** Check our [FAQ](https://mydebugtools.com) or open an issue

## 📁 Project Structure

```
mydebugtools/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── components/         # Shared components
│   │   │   ├── AdSlot.tsx     # Google AdSense integration
│   │   │   ├── GoogleAnalytics.tsx
│   │   │   └── Navigation.tsx
│   │   ├── tools/              # Tool pages
│   │   │   ├── layout.tsx     # Tools layout (navbar + footer)
│   │   │   ├── json/          # JSON Tools
│   │   │   ├── jwt/           # JWT Decoder
│   │   │   ├── base64/        # Base64 Converter
│   │   │   ├── code-diff/     # Code Diff
│   │   │   ├── svg/           # SVG Optimizer
│   │   │   └── ...            # 25+ more tools
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/             # Reusable components
│   │   └── ui/                # UI components
│   ├── lib/                   # Utility functions
│   │   └── utils.ts
│   └── __tests__/             # Test files
├── public/                     # Static assets
│   ├── ads.txt                # AdSense verification
│   ├── sitemap.xml            # SEO sitemap
│   └── robots.txt             # SEO robots
├── chrome-extension/           # Chrome extension files
├── scripts/                    # Build scripts
└── ...
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Heroicons](https://heroicons.com/) - Icon library
- [Lucide React](https://lucide.dev/) - Icon library
- [Inter Font](https://fonts.google.com/specimen/Inter) - Typography
- And all our amazing [contributors](https://github.com/jasimvk/mydebugtools/graphs/contributors)!

## 💬 Community & Support

- **🐛 Found a bug?** [Open an issue](https://github.com/jasimvk/mydebugtools/issues)
- **💡 Feature request?** [Start a discussion](https://github.com/jasimvk/mydebugtools/discussions)
- **❓ Questions?** Check our [FAQ](https://mydebugtools.com) or open an issue

## ⭐ Support the Project

If you find MyDebugTools helpful, please consider:
- ⭐ [Star the repository](https://github.com/jasimvk/mydebugtools)
- 🐦 [Share on Twitter](https://twitter.com/intent/tweet?text=Check%20out%20MyDebugTools%20-%20A%20collection%20of%2030%2B%20developer%20tools&url=https://github.com/jasimvk/mydebugtools)
- 🐛 Report bugs and suggest features
- 🤝 Contribute code or documentation
- 💬 Spread the word!

## 🗺️ Roadmap

- [x] JSON Tools with validation
- [x] JWT Decoder
- [x] Base64 Converter
- [x] Code Diff Tool
- [x] SVG Optimizer
- [x] HTTP Status Reference
- [x] Chrome Extension
- [ ] Database Query Tool
- [ ] Performance Monitoring
- [ ] Real-time Collaboration
- [ ] API Mocking Tool
- [ ] GraphQL Playground

Check our full [Roadmap](https://mydebugtools.com/roadmap) for more details.

---

**Developed & Maintained by [Jasim](https://x.com/jasimvk)**

Made with ❤️ for developers, by developers.
