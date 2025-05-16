'use client';

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            MyDebugTools
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A developer's all-in-one debugging toolkit — making development easier and faster.
          </p>
           
          
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <ul className="text-left space-y-4 text-gray-600">
              <li>✅ JSON Formatter & Beautifier - Format and validate your JSON with ease</li>
              <li>✅ JWT Decoder - Decode and verify JWT tokens instantly</li>
              <li>✅ Base64 Tools - Quick encoding and decoding of Base64 strings</li>
              <li>✅ API Tester - Test your APIs with a lightweight interface</li>
              <li>✅ Icon Finder - Find the perfect icon for your project</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 