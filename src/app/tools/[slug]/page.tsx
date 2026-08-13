import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import DebugWorkflowToolPage from '../components/DebugWorkflowToolPage';
import { debugWorkflowConfigs, getDebugWorkflowConfig } from '../lib/debug-workflow-configs';
import ToolProductShell from '../components/ToolProductShell';
import { toolMetadata } from '@/lib/tool-seo';

export function generateStaticParams() {
  return debugWorkflowConfigs.map((config) => ({ slug: config.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const config = getDebugWorkflowConfig(params.slug);

  if (!config) {
    return {};
  }

  return toolMetadata(params.slug);
}

export default function DynamicDebugWorkflowPage({ params }: { params: { slug: string } }) {
  const config = getDebugWorkflowConfig(params.slug);

  if (!config) {
    notFound();
  }

  return (
    <ToolProductShell slug={params.slug}>
      {/* Keyed so a client-side hop between two [slug] tools remounts the editor
          instead of carrying the previous tool's input over. */}
      <DebugWorkflowToolPage key={params.slug} slug={params.slug} />
    </ToolProductShell>
  );
}
