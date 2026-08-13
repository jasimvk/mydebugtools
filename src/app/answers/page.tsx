import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { answerPages } from './data'

export const metadata: Metadata = buildMetadata({
  title: 'Developer Tool Answers | debugtools',
  description: 'Concise answers for common developer debugging tasks, with direct links to open-source debugtools utilities.',
  path: '/answers/',
  keywords: ['developer tool answers', 'json formatter answer', 'jwt decoder guide', 'api workbench guide'],
})

export default function AnswersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://debugtools.org/answers/#answers',
    name: 'debugtools developer tool answers',
    description: 'Concise answers for common API testing, formatting, encoding, hashing, diffing, URL, and HTTP debugging workflows.',
    itemListElement: answerPages.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: page.title,
      url: `https://debugtools.org/answers/${page.slug}/`,
      description: page.shortAnswer,
    })),
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-10 text-[#09090b] sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs text-[#71717a]">debugtools / answers</p>
        <h1 className="mt-2 text-4xl font-semibold">Developer tool answers</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#71717a]">
          Short, source-friendly answers for common debugging, formatting, and inspection workflows.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {answerPages.map((page) => (
            <Link
              key={page.slug}
              href={`/answers/${page.slug}/`}
              className="rounded-md border border-[#e4e4e7] bg-white p-5 hover:border-[#2563eb] hover:bg-[#fafafa]"
            >
              <h2 className="text-lg font-semibold text-[#2563eb]">{page.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#71717a]">{page.shortAnswer}</p>
              <div className="mt-4 text-sm font-semibold text-[#2563eb]">Read answer</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
