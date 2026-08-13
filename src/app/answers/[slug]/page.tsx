import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/seo'
import { answerPages, getAnswerPage } from '../data'
import { liveTools } from '@/app/tools/lib/tool-registry'

// `related` stores display names, a few of which predate the registry's current
// naming. Anything that resolves becomes a real link — these 19 pages had
// exactly one outbound internal link each because the chips were plain spans.
const RELATED_NAME_ALIASES: Record<string, string> = {
  'Base64 Encoder and Decoder': 'Base64',
  'HTTP Status Codes': 'HTTP Status',
  'JSON Formatter': 'JSON Tools',
  'URL Encoder and Decoder': 'URL Encoder',
  'Security Headers + CORS Inspector': 'Security Headers Inspector',
  'OpenTelemetry Trace Viewer': 'OpenTelemetry Trace Viewer',
}

const toolPathByName = new Map(liveTools.map((tool) => [tool.name, tool.path]))

function resolveToolPath(name: string) {
  return toolPathByName.get(RELATED_NAME_ALIASES[name] ?? name) ?? null
}

export function generateStaticParams() {
  return answerPages.map((page) => ({ slug: page.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getAnswerPage(params.slug)

  if (!page) {
    return {}
  }

  return buildMetadata({
    title: `${page.title} | debugtools`,
    description: page.description,
    path: `/answers/${page.slug}/`,
    keywords: [page.toolName, page.title, 'developer tools', 'debugging tools'],
  })
}

export default function AnswerPage({ params }: { params: { slug: string } }) {
  const page = getAnswerPage(params.slug)

  if (!page) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `https://debugtools.org/answers/${page.slug}/#webpage`,
        name: page.title,
        description: page.description,
        url: `https://debugtools.org/answers/${page.slug}/`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Answers', item: 'https://debugtools.org/answers/' },
          { '@type': 'ListItem', position: 2, name: page.title, item: `https://debugtools.org/answers/${page.slug}/` },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `https://debugtools.org/answers/${page.slug}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: page.title,
            acceptedAnswer: {
              '@type': 'Answer',
              text: page.shortAnswer,
            },
          },
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `https://debugtools.org/answers/${page.slug}/#howto`,
        name: page.title,
        description: page.description,
        tool: {
          '@type': 'SoftwareApplication',
          name: page.toolName,
          url: `https://debugtools.org${page.toolHref}`,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any',
        },
        step: page.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text: step,
        })),
      },
    ],
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-10 text-[#09090b] sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl rounded-md border border-[#e4e4e7] bg-white p-6">
        <Link href="/answers/" className="font-mono text-xs font-semibold text-[#2563eb]">
          debugtools / answers
        </Link>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{page.title}</h1>
        <p className="mt-5 rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4 text-sm leading-6 text-[#09090b]">
          <strong>Short answer:</strong> {page.shortAnswer}
        </p>

        <h2 className="mt-8 text-xl font-semibold">Steps</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#71717a]">
          {page.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="mt-8 rounded-md border border-[#e4e4e7] bg-[#fafafa] p-4">
          <h2 className="text-base font-semibold">Use debugtools</h2>
          <p className="mt-2 text-sm leading-6 text-[#71717a]">
            Open the <Link href={page.toolHref} className="font-semibold text-[#2563eb]">{page.toolName}</Link> to run this workflow in the browser.
          </p>
        </div>

        <h2 className="mt-8 text-xl font-semibold">Related tools</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {page.related.map((tool) => {
            const href = resolveToolPath(tool)
            const className = 'rounded-full border border-[#e4e4e7] bg-white px-3 py-1 text-xs font-semibold text-[#71717a]'

            return href ? (
              <Link key={tool} href={href} className={`${className} hover:border-[#2563eb] hover:text-[#2563eb]`}>
                {tool}
              </Link>
            ) : (
              <span key={tool} className={className}>
                {tool}
              </span>
            )
          })}
        </div>
      </article>
    </main>
  )
}
