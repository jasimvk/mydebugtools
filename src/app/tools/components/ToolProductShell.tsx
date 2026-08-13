import Link from 'next/link';
import { getToolProduct, getToolProductJsonLd } from '@/lib/tool-products';

export default function ToolProductShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const product = getToolProduct(slug);
  const jsonLd = getToolProductJsonLd(slug);

  if (!product) {
    return <>{children}</>;
  }

  const productTags = Array.from(
    new Set([product.category, product.pillar, product.maturity, product.privacy])
  );

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
      <section
        aria-labelledby={`${product.slug}-product-heading`}
        className="mx-auto mt-6 max-w-[1600px] rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-slate-900 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)]">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              DebugTools product
            </p>
            <h2 id={`${product.slug}-product-heading`} className="mt-2 text-xl font-semibold tracking-tight">
              {product.name}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {product.productSummary}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ProductPanel title="Use cases" items={product.useCases} />
              <ProductPanel title="How it works" items={product.howItWorks} />
              <ProductPanel title="Privacy" items={[product.privacyNote]} />
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap gap-2">
              {productTags.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {product.faqs.map((faq) => (
                <details key={faq.question} className="rounded-xl border border-slate-200 bg-white p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>

            {product.relatedTools.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Related</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.relatedTools.map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

function ProductPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
