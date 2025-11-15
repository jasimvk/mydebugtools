'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import StructuredData from '@/components/StructuredData';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, create a mailto link
    const emailBody = `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
    window.location.href = `mailto:support@mydebugtools.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StructuredData
        title="Contact Us | MyDebugTools"
        description="Contact MyDebugTools for support, feedback, or questions"
        toolType="WebPage"
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            We'd love to hear from you! Whether you have questions, feedback, or need support, 
            feel free to reach out to us.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-blue-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-gray-600">support@mydebugtools.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-blue-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Website</p>
                <p className="text-gray-600">https://mydebugtools.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-blue-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">GitHub</p>
                <a href="https://github.com/jasimvk/mydebugtools" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  github.com/jasimvk/mydebugtools
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Is MyDebugTools free to use?</h4>
            <p className="text-gray-600">Yes, all our development tools are completely free to use.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Do you store my data?</h4>
            <p className="text-gray-600">No, all data processing happens locally in your browser. We don't store or transmit your tool data.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">How do I report a bug?</h4>
            <p className="text-gray-600">You can report bugs through our GitHub repository or contact us directly via email.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto pb-6 px-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs">
              <a href="https://github.com/jasimvk/mydebugtools" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">
                ⭐ Star on GitHub
              </a>
              <a href="https://github.com/jasimvk/mydebugtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">
                MIT License
              </a>
              <a href="https://github.com/jasimvk/mydebugtools/issues" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Report Issue</a>
              <a href="https://github.com/jasimvk/mydebugtools/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Contribute</a>
              <Link href="/contact" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Contact</Link>
              <Link href="/faq" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">FAQ</Link>
              <Link href="/privacy-policy" className="text-gray-600 hover:text-[#FF6C37] transition-colors font-medium">Privacy & Terms</Link>
            </div>
            <div className="text-xs text-gray-600">
              Built by <a href="https://x.com/jasimvk" target="_blank" rel="noopener noreferrer" className="text-[#FF6C37] hover:underline font-semibold">@jasimvk</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </div>
  );
}