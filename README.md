# MyDebugTools

A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.

[![GitHub stars](https://img.shields.io/github/stars/jasimvk/mydebugtools?style=social)](https://github.com/jasimvk/mydebugtools/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/jasimvk/mydebugtools)](https://github.com/jasimvk/mydebugtools/issues)

## Features

- **JSON Tools**
  - Format and validate JSON
  - Transform JSON to other formats
  - Compare JSON structures
  - Schema validation

- **API Testing**
  - Send HTTP requests
  - View response headers and body
  - Save and load request configurations
  - Environment variables support

- **More Tools Coming Soon**
  - Database Query Tool
  - Performance Monitoring
  - Collaboration Features
  - And more! Check our [Roadmap](https://mydebugtools.com/roadmap)

## Screenshots

| Homepage | Tools Page |
|----------|------------|
| ![Homepage screenshot](public/screenshots/homepage.png) | ![Tools page screenshot](public/screenshots/tools.png) |

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jasimvk/mydebugtools.git
   cd mydebugtools
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## How to Contribute

We welcome contributions of all kinds! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to report bugs and request features
- Coding style and pull request process
- License and code of conduct

Quick steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit and push (`git commit -m 'Add some amazing feature'`)
5. Open a Pull Request

## Community & Support

- **Found a bug or have a feature request?** [Open an issue](https://github.com/jasimvk/mydebugtools/issues)
- **Want to contribute?** [See our guidelines](CONTRIBUTING.md)
- **General questions?** Use GitHub Discussions or open an issue

## Development

### Project Structure

```
mydebugtools/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── components/   # Shared components
│   │   ├── tools/        # Tool-specific components
│   │   └── ...
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── ...
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
- And all our amazing contributors!

## Support

If you find this project helpful, please consider:
- [Starring the repository](https://github.com/jasimvk/mydebugtools)
- Reporting bugs
- Contributing code or documentation
- Sharing with your network

## Roadmap

Check out our [Roadmap](https://mydebugtools.com/roadmap) to see what's coming next!
