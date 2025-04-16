# MyDebugTools

A powerful collection of development tools including JSON Formatter, JWT Decoder, Base64 Tools, API Tester, and Icon Finder - all in one place.

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

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jasimvk/mydebugtools.git
cd mydebugtools
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

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
- Starring the repository
- Reporting bugs
- Contributing code or documentation
- Sharing with your network

## Roadmap

Check out our [Roadmap](https://mydebugtools.com/roadmap) to see what's coming next!
