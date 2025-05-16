'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagnifyingGlassIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import StructuredData from '@/components/StructuredData';
import SuspenseBoundary from '@/components/SuspenseBoundary';

interface StatusCode {
  code: number;
  name: string;
  description: string;
}

type StatusCodeCategory = 'Informational (1xx)' | 'Success (2xx)' | 'Redirection (3xx)' | 'Client Error (4xx)' | 'Server Error (5xx)';

interface StatusCodes {
  [key: string]: StatusCode[];
}

// HTTP Status Code categories and their codes
const statusCodes: StatusCodes = {
  'Informational (1xx)': [
    { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.' },
    { code: 101, name: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.' },
    { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.' },
    { code: 103, name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.' }
  ],
  'Success (2xx)': [
    { code: 200, name: 'OK', description: 'The request has succeeded.' },
    { code: 201, name: 'Created', description: 'The request has succeeded and a new resource has been created.' },
    { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.' },
    { code: 203, name: 'Non-Authoritative Information', description: 'The returned metadata is different from what was originally available.' },
    { code: 204, name: 'No Content', description: 'The server successfully processed the request and is not returning any content.' },
    { code: 205, name: 'Reset Content', description: 'The server has fulfilled the request and desires that the client reset the document view.' },
    { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.' }
  ],
  'Redirection (3xx)': [
    { code: 300, name: 'Multiple Choices', description: 'The request has more than one possible response.' },
    { code: 301, name: 'Moved Permanently', description: 'The URL of the requested resource has been changed permanently.' },
    { code: 302, name: 'Found', description: 'The URI of requested resource has been changed temporarily.' },
    { code: 303, name: 'See Other', description: 'The client should look at another URI using a GET method.' },
    { code: 304, name: 'Not Modified', description: 'The response has not been modified since the last request.' },
    { code: 307, name: 'Temporary Redirect', description: 'The request should be repeated with another URI.' },
    { code: 308, name: 'Permanent Redirect', description: 'The request and all future requests should be repeated using another URI.' }
  ],
  'Client Error (4xx)': [
    { code: 400, name: 'Bad Request', description: 'The server cannot or will not process the request due to an apparent client error.' },
    { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.' },
    { code: 403, name: 'Forbidden', description: 'The server understood the request but refuses to authorize it.' },
    { code: 404, name: 'Not Found', description: 'The requested resource could not be found.' },
    { code: 405, name: 'Method Not Allowed', description: 'The method specified in the request is not allowed for the resource.' },
    { code: 406, name: 'Not Acceptable', description: 'The requested resource is capable of generating only content not acceptable according to the Accept headers.' },
    { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.' },
    { code: 409, name: 'Conflict', description: 'The request could not be completed due to a conflict with the current state of the resource.' },
    { code: 410, name: 'Gone', description: 'The requested resource is no longer available and has been permanently removed.' },
    { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.' }
  ],
  'Server Error (5xx)': [
    { code: 500, name: 'Internal Server Error', description: 'A generic error message given when an unexpected condition was encountered.' },
    { code: 501, name: 'Not Implemented', description: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request.' },
    { code: 502, name: 'Bad Gateway', description: 'The server received an invalid response from the upstream server.' },
    { code: 503, name: 'Service Unavailable', description: 'The server is currently unable to handle the request due to temporary overload or maintenance.' },
    { code: 504, name: 'Gateway Timeout', description: 'The upstream server failed to send a request in the time allowed by the server.' },
    { code: 505, name: 'HTTP Version Not Supported', description: 'The server does not support the HTTP protocol version used in the request.' }
  ]
};

function HttpStatusContent() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StatusCodeCategory | null>(null);

  // Filter status codes based on search
  const filteredStatusCodes = Object.entries(statusCodes).reduce((acc, [category, codes]) => {
    const filteredCodes = codes.filter(code => 
      code.code.toString().includes(search) ||
      code.name.toLowerCase().includes(search.toLowerCase()) ||
      code.description.toLowerCase().includes(search.toLowerCase())
    );
    if (filteredCodes.length > 0) {
      acc[category] = filteredCodes;
    }
    return acc;
  }, {} as StatusCodes);

  return (
    <div className="container mx-auto p-4">
      <StructuredData 
        title="HTTP Status Codes | MyDebugTools"
        description="Comprehensive reference for HTTP status codes with explanations, common use cases, and best practices for web development."
        toolType="WebApplication"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InformationCircleIcon className="h-6 w-6 text-blue-500" />
            HTTP Status Codes
          </CardTitle>
          <CardDescription>
            A comprehensive reference for HTTP status codes with explanations and use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filter */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search status codes, names, or descriptions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status code categories */}
          <div className="space-y-6">
            {Object.entries(filteredStatusCodes).map(([category, codes]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {codes.map((status) => (
                    <div
                      key={status.code}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-lg font-bold ${
                          status.code >= 500 ? 'text-red-600' :
                          status.code >= 400 ? 'text-orange-600' :
                          status.code >= 300 ? 'text-yellow-600' :
                          status.code >= 200 ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {status.code}
                        </span>
                        <span className="font-medium text-gray-900">{status.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{status.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(filteredStatusCodes).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No status codes found matching your search.</p>
              </div>
            )}
          </div>

          {/* Best practices section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Best Practices</h3>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Use appropriate status codes that accurately reflect the result of the request</li>
              <li>Include helpful error messages in the response body for 4xx and 5xx errors</li>
              <li>Use 200 for successful GET requests and 201 for successful POST requests</li>
              <li>Use 204 when the request is successful but there's no content to return</li>
              <li>Use 400 for client errors and 500 for server errors</li>
              <li>Include proper CORS headers when necessary</li>
              <li>Use 429 to rate limit requests and include a Retry-After header</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HttpStatusPage() {
  return (
    <SuspenseBoundary>
      <HttpStatusContent />
    </SuspenseBoundary>
  );
} 