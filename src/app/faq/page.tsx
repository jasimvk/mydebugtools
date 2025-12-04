'use client';

import Link from 'next/link';
import { Terminal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is MyDebugTools really free?",
      answer: "Yes! MyDebugTools is 100% free and open-source. All tools are available without any subscription, registration, or hidden fees. We believe developer tools should be accessible to everyone."
    },
    {
      question: "Do I need to create an account?",
      answer: "No account required! All tools work instantly in your browser without any sign-up process. Your data stays private and is never sent to our servers."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. All processing happens locally in your browser. We don't store, transmit, or have access to any data you input into our tools. Your privacy is our top priority."
    },
    {
      question: "Can I use these tools offline?",
      answer: "Most tools work entirely in your browser, so once the page loads, many features will continue to work offline. However, some tools that require external resources may need an internet connection."
    },
    {
      question: "What tools are available?",
      answer: "We offer 30+ developer tools including JSON formatter, JWT decoder, Base64 encoder/decoder, API tester, code diff, regex tester, color picker, hash generators, and many more. New tools are added regularly."
    },
    {
      question: "Can I contribute to the project?",
      answer: "Yes! MyDebugTools is open-source on GitHub. We welcome contributions, bug reports, and feature requests. Check our GitHub repository for contribution guidelines."
    },
    {
      question: "Which browsers are supported?",
      answer: "MyDebugTools works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version for the best experience."
    },
    {
      question: "How can I report a bug or request a feature?",
      answer: "You can report bugs or request features by opening an issue on our GitHub repository. We actively monitor and respond to all issues."
    },
    {
      question: "Can I use these tools for commercial projects?",
      answer: "Yes! MyDebugTools is licensed under MIT, which means you can use it freely for personal or commercial projects without any restrictions."
    },
    {
      question: "Are there any usage limits?",
      answer: "No usage limits! Use the tools as much as you need. Since everything runs in your browser, there are no server-side restrictions or rate limits."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <Terminal className="h-8 w-8 text-gray-900" />
              <span className="text-2xl font-bold text-gray-900">
                MyDebugTools
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/jasimvk/mydebugtools"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                title="⭐ Star on GitHub if you like it"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Star</span>
              </a>
              <Link 
                href="/tools"
                className="px-6 py-2.5 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Browse Tools
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header - Improved */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about MyDebugTools
            </p>
          </div>

          {/* FAQ Accordion - Enhanced */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden transition-all hover:border-[#FF6C37]/50"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-6 flex items-center justify-between text-left hover:bg-orange-50/30 transition-colors group"
                >
                  <span className="text-base font-semibold text-gray-900 pr-4 group-hover:text-[#FF6C37] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#FF6C37] flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-200 bg-gradient-to-b from-orange-50/10 to-white">
                    <p className="text-gray-600 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA - Modern Card */}
          <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-10 shadow-xl text-center">
            <h2 className="text-3xl font-black text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
              Can't find what you're looking for? Reach out to us or explore our documentation.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-[#FF6C37] hover:bg-[#ff5722] text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Contact Us
              </Link>
              <a
                href="https://github.com/jasimvk/mydebugtools/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg transition-all duration-200 shadow hover:shadow-lg transform hover:scale-105"
              >
                Report an Issue
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Modern Dark */}
      <footer className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-8 md:p-10 shadow-xl">
            <div className="flex flex-col gap-8">
              {/* Footer Links */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center md:text-left">
                <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  ⭐ Star on GitHub
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  MIT License
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/issues" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Report Issue
                </a>
                <a href="https://github.com/jasimvk/mydebugtools/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Contribute
                </a>
                <Link href="/contact" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Contact
                </Link>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-medium text-sm">
                  Privacy & Terms
                </Link>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-700"></div>

              {/* Footer Bottom */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                <span className="text-gray-300">
                  Built with ❤️ for developers
                </span>
                <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#FF6C37] transition-colors font-semibold">
                  @jasimvk
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
