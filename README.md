# DebugTools

Open-source debugging toolkit for modern developers.

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Open Source](https://img.shields.io/badge/open--source-yes-brightgreen)

- Website: https://debugtools.org
- Repository: https://github.com/jasimvkarim/mydebugtools
- License: MIT

DebugTools helps developers analyze stack traces, logs, HAR files, GitHub Actions failures, Android Logcat output, Kubernetes issues, OpenTelemetry traces, auth flows, CORS problems, security headers, certificates, and production incidents from one local-first toolbox.

Most developer utility sites solve one small task: format, decode, convert. DebugTools is focused on the larger debugging workflow: understand what happened, explain why it failed, suggest a fix, and help prevent the repeat.

## Local-first promise

Local-first by default. Your pasted logs, tokens, stack traces, and crash reports stay in your browser unless you explicitly choose AI analysis.

## Product model

DebugTools is open source first, not SaaS-only:

1. Utility tools bring search traffic.
2. Debugging workflows create differentiation.
3. A self-hosted or hosted workspace can monetize convenience later.

The hosted layer should monetize convenience, not lock away the core tools.

## Tools

Flagship and public utility routes:

- API Workbench
- JSON Tools
- JWT Decoder
- Base64
- HTTP Status
- Hash Generator
- Regex Tester
- URL Encoder
- Code Diff
- HTML Tools
- CSS Tools
- Markdown Preview
- Color Picker
- Icon Finder
- Database Query
- UUID Generator
- Timestamp Converter
- Password Generator

Debugging workflow routes:

- Stack Trace Explainer
- Log Trace Rebuilder
- HAR Analyzer / HTTP Profiler
- CI / GitHub Actions Debugger
- Security Headers + CORS Inspector
- SAML / OIDC Debugger
- Certificate Chain Viewer
- Android Logcat Analyzer
- Kubernetes Debug Helper
- OpenTelemetry Trace Viewer
- React Native Debug Pack
- Mobile Network Debug Checklist
- API Auth Config Tester
- OAuth Token Inspector
- WebSocket Debugger
- Redirect Inspector
- Cookie Security Inspector
- CSP Parser
- Secret Scanner
- Schema Validator
- SQL Explain
- SQL Flow
- Flamegraph Viewer
- Perfetto Summary
- Heap / Memory Event Visualizer
- Node Performance Analyzer
- Python Profiler
- Java Thread Dump
- JVM GC Log
- Native Debug Session
- Binary Inspector

See the live catalog at https://debugtools.org/tools/all.

## Local development

```bash
git clone https://github.com/jasimvkarim/mydebugtools.git
cd mydebugtools
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

No environment variables are required for the local-first tools.

Optional AI analysis uses bring-your-own provider keys. Optional cloud sync for API Workbench collections uses NextAuth, Google OAuth, and Supabase:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-local-secret
GOOGLE_CLIENT_ID=replace-me
GOOGLE_CLIENT_SECRET=replace-me
NEXT_PUBLIC_SUPABASE_URL=replace-me
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-me
SUPABASE_SERVICE_ROLE_KEY=replace-me
```

Optional analytics can be enabled on the Vercel project that serves the active production domain:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Keep real credentials out of issues, screenshots, fixtures, and committed files.

## Scripts

```bash
npm run dev                 # Start the Next.js dev server
npx tsc --noEmit --pretty false
npm test                    # Run Jest tests
npm run build               # Generate sitemap and build the app
npm run build:extension     # Package the Chrome extension
```

For targeted work, run the smallest relevant Jest file first, then `tsc` and `build` before opening a pull request.

## Self-hosting

DebugTools is built with Next.js and TypeScript. The free tools run in the browser by default. See [docs/self-hosting.md](docs/self-hosting.md) for local, Docker, and deployment notes.

## Contributing

Issues and pull requests are welcome. Please keep reports reproducible and patches scoped to one tool, parser, workflow, or docs surface.

- Bug reports: include steps, sample input, expected behavior, actual behavior, browser/OS, and screenshots when UI is involved.
- Feature proposals: describe the debugging workflow, privacy model, input/output examples, and why it belongs in DebugTools.
- Pull requests: include verification commands and update docs or changelog entries when behavior changes.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor guide.

## Security

DebugTools is designed around a local-first model, but API Workbench can contact arbitrary URLs and optional sync can store collections remotely. Do not paste production secrets into public issues or shared recordings. See [SECURITY.md](SECURITY.md) for reporting and handling guidance.

## Roadmap

The near-term roadmap is:

1. Keep API Workbench as the flagship tool: request runner correctness, docs generation, AI context export, cloud sync, and team workspace flows.
2. Finish route-specific polish for every public tool: samples, copy/download/export, mobile layout, and smoke tests.
3. Deepen debugging analyzers with richer imports, fixtures, reports, and safer redaction.
4. Extract shared logic for a future CLI and self-hosted workflows.
5. Keep the open-source project surface current: README, changelog, releases, roadmap, issue templates, and security notes.

Full roadmap: https://debugtools.org/roadmap.
