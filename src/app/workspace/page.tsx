import type { Metadata } from 'next';
import Navigation from '../components/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Workspaces and Teams | DebugTools',
  description: 'The DebugTools workspace direction: local personal tools, a self-hosted shared layer, hosted team plans, the Owner to Viewer role model, and the planned schema.',
  path: '/workspace/',
  keywords: ['debugtools workspaces', 'team api collections', 'self hosted developer tools', 'workspace roles'],
  noindex: true,
});

const layers = [
  {
    name: 'Local tools',
    price: 'Free',
    description: 'No account, no team setup, no shared storage. Utilities and API requests run from the browser first.',
    items: ['Personal workspace in this browser', 'Local collections', 'Private mode', 'No forced sync'],
  },
  {
    name: 'Self-hosted workspace',
    price: 'Open source',
    description: 'For teams that want shared collections and debug reports while keeping data under their own control.',
    items: ['Workspace members', 'Shared API collections', 'Project environments', 'Saved debug reports'],
  },
  {
    name: 'Hosted team workspace',
    price: 'Later',
    description: 'A managed version can monetize convenience without locking the core tools away.',
    items: ['Seat-based teams', 'Audit history', 'Private projects', 'Integrations and alerts'],
  },
];

const roles = [
  ['Owner', 'Billing, workspace settings, deletes, and transfer ownership.'],
  ['Admin', 'Invite members, manage projects, and edit shared collections.'],
  ['Developer', 'Run tools, save requests, create debug reports, and update project data.'],
  ['Viewer', 'Read shared collections and reports without changing workspace data.'],
];

const milestones = [
  ['Now', 'Personal local workspace with optional API collection sync.'],
  ['Next', 'Workspace switcher, member model, and shared collection ownership.'],
  ['Later', 'Projects, roles, activity log, and hosted team plans.'],
];

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#09090b]">
      <Navigation />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-[#e4e4e7] bg-white">
          <div className="border-b border-[#e4e4e7] px-5 py-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#71717a]">WORKSPACES.md</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#09090b]">Workspaces and teams</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#71717a]">
              DebugTools should stay fast for one developer and still have a clean path for teams. The core stays local-first; shared workspaces are an optional layer for collections, environments, and debug reports.
            </p>
          </div>

          <section className="grid border-b border-[#e4e4e7] md:grid-cols-3">
            {layers.map((layer) => (
              <article key={layer.name} className="border-b border-[#e4e4e7] p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#09090b]">{layer.name}</h2>
                  <span className="rounded-full border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-1 font-mono text-xs font-semibold text-[#71717a]">
                    {layer.price}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#71717a]">{layer.description}</p>
                <ul className="mt-4 space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-[#71717a]">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1f883d]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className="grid gap-0 border-b border-[#e4e4e7] lg:grid-cols-[1fr_380px]">
            <div className="border-b border-[#e4e4e7] p-5 lg:border-b-0 lg:border-r">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#71717a]">Role model</h2>
              <div className="mt-4 divide-y divide-[#e4e4e7] rounded-md border border-[#e4e4e7]">
                {roles.map(([role, description]) => (
                  <div key={role} className="grid gap-2 p-4 sm:grid-cols-[120px_1fr]">
                    <div className="font-mono text-sm font-semibold text-[#2563eb]">{role}</div>
                    <p className="text-sm leading-6 text-[#71717a]">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="bg-[#fafafa] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#71717a]">Scale path</h2>
              <div className="mt-4 space-y-3">
                {milestones.map(([step, text]) => (
                  <div key={step} className="rounded-md border border-[#e4e4e7] bg-white p-4">
                    <div className="font-mono text-xs font-semibold text-[#2563eb]">{step}</div>
                    <p className="mt-2 text-sm leading-6 text-[#71717a]">{text}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#71717a]">Database direction</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-[#e4e4e7] bg-white p-4">
                <h3 className="text-base font-semibold text-[#09090b]">First tables</h3>
                <p className="mt-2 text-sm leading-6 text-[#71717a]">
                  Start with organizations, workspaces, workspace_members, projects, collections, and saved_debug_reports. Keep saved secrets out of shared records by default.
                </p>
              </div>
              <div className="rounded-md border border-[#e4e4e7] bg-white p-4">
                <h3 className="text-base font-semibold text-[#09090b]">First UI</h3>
                <p className="mt-2 text-sm leading-6 text-[#71717a]">
                  Add a small workspace switcher only after shared collections exist. Until then, keep API Workbench focused on sending and inspecting requests.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
