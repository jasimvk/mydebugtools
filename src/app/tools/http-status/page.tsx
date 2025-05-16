'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MagnifyingGlassIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import StructuredData from '@/components/StructuredData';
import SuspenseBoundary from '@/components/SuspenseBoundary';
import { Suspense } from 'react';

interface StatusCode {
  code: number;
  name: string;
  description: string;
  likelyCause: string;
}

type StatusCodeCategory = 'Informational (1xx)' | 'Success (2xx)' | 'Redirection (3xx)' | 'Client Error (4xx)' | 'Server Error (5xx)';

interface StatusCodes {
  [key: string]: StatusCode[];
}

// HTTP Status Code categories and their codes
const statusCodes: StatusCodes = {
  'Informational (1xx)': [
    { 
      code: 100, 
      name: 'Continue', 
      description: 'The server has received the request headers and the client should proceed to send the request body.',
      likelyCause: 'This is a normal part of the HTTP protocol, indicating that the server is ready to receive the request body.',
    },
    { 
      code: 101, 
      name: 'Switching Protocols', 
      description: 'The server is switching protocols as requested by the client.',
      likelyCause: 'Common when upgrading from HTTP to WebSocket or HTTP/1.1 to HTTP/2.0.',
    },
    { 
      code: 102, 
      name: 'Processing', 
      description: 'The server has received and is processing the request, but no response is available yet.',
      likelyCause: 'Used for long-running operations to prevent client timeout. Common in file uploads or complex processing.',
    },
    { 
      code: 103, 
      name: 'Early Hints', 
      description: 'Used to return some response headers before final HTTP message.',
      likelyCause: 'Helps browsers start loading resources before the main response is ready, improving performance.',
    },
  ],
  'Success (2xx)': [
    { 
      code: 200, 
      name: 'OK', 
      description: 'The request has succeeded.',
      likelyCause: 'Standard response for successful HTTP requests.',
    },
    { 
      code: 201, 
      name: 'Created', 
      description: 'The request has succeeded and a new resource has been created.',
      likelyCause: 'Common after successful POST requests that create new resources.',
    },
    { 
      code: 202, 
      name: 'Accepted', 
      description: 'The request has been accepted for processing, but the processing has not been completed.',
      likelyCause: 'Used for asynchronous processing, like background jobs or queued operations.',
    },
    { 
      code: 203, 
      name: 'Non-Authoritative Information', 
      description: 'The returned metadata is different from what was originally available.',
      likelyCause: 'Common when using a proxy or cache that modified the response.',
    },
    { 
      code: 204, 
      name: 'No Content', 
      description: 'The server successfully processed the request and is not returning any content.',
      likelyCause: 'Used for successful operations that don\'t need to return data, like DELETE requests.',
    },
    { 
      code: 205, 
      name: 'Reset Content', 
      description: 'The server has fulfilled the request and desires that the client reset the document view.',
      likelyCause: 'Common after form submissions to clear the form for new input.',
    },
    { 
      code: 206, 
      name: 'Partial Content', 
      description: 'The server is delivering only part of the resource due to a range header sent by the client.',
      likelyCause: 'Used for resumable downloads or streaming content.',
    },
  ],
  'Redirection (3xx)': [
    { 
      code: 300, 
      name: 'Multiple Choices', 
      description: 'The request has more than one possible response.',
      likelyCause: 'Server offers multiple representations of the resource, and the client should choose one.',
    },
    { 
      code: 301, 
      name: 'Moved Permanently', 
      description: 'The URL of the requested resource has been changed permanently.',
      likelyCause: 'Resource has been permanently moved to a new URL. Search engines should update their links.',
    },
    { 
      code: 302, 
      name: 'Found', 
      description: 'The URI of requested resource has been changed temporarily.',
      likelyCause: 'Common in POST-Redirect-GET pattern or temporary redirects.',
    },
    { 
      code: 303, 
      name: 'See Other', 
      description: 'The client should look at another URI using a GET method.',
      likelyCause: 'Used to redirect after a POST request to prevent form resubmission.',
    },
    { 
      code: 304, 
      name: 'Not Modified', 
      description: 'The response has not been modified since the last request.',
      likelyCause: 'Client\'s cached version is still valid. Saves bandwidth by not resending unchanged content.',
    },
    { 
      code: 307, 
      name: 'Temporary Redirect', 
      description: 'The request should be repeated with another URI.',
      likelyCause: 'Similar to 302 but guarantees the same HTTP method will be used.',
    },
    { 
      code: 308, 
      name: 'Permanent Redirect', 
      description: 'The request and all future requests should be repeated using another URI.',
      likelyCause: 'Similar to 301 but guarantees the same HTTP method will be used.',
    },
  ],
  'Client Error (4xx)': [
    { 
      code: 400, 
      name: 'Bad Request', 
      description: 'The server cannot or will not process the request due to an apparent client error.',
      likelyCause: 'Invalid syntax, malformed request, or missing required parameters.',
    },
    { 
      code: 401, 
      name: 'Unauthorized', 
      description: 'Authentication is required and has failed or has not been provided.',
      likelyCause: 'Missing or invalid authentication credentials, expired tokens, or insufficient permissions.',
    },
    { 
      code: 403, 
      name: 'Forbidden', 
      description: 'The server understood the request but refuses to authorize it.',
      likelyCause: 'User is authenticated but doesn\'t have permission to access the resource.',
    },
    { 
      code: 404, 
      name: 'Not Found', 
      description: 'The requested resource could not be found.',
      likelyCause: 'Resource doesn\'t exist, has been moved, or the URL is incorrect.',
    },
    { 
      code: 405, 
      name: 'Method Not Allowed', 
      description: 'The method specified in the request is not allowed for the resource.',
      likelyCause: 'Using POST on a read-only endpoint or GET on a write-only endpoint.',
    },
    { 
      code: 406, 
      name: 'Not Acceptable', 
      description: 'The requested resource is capable of generating only content not acceptable according to the Accept headers.',
      likelyCause: 'Server can\'t provide content in the format requested by the client.',
    },
    { 
      code: 408, 
      name: 'Request Timeout', 
      description: 'The server timed out waiting for the request.',
      likelyCause: 'Client took too long to send the complete request.',
    },
    { 
      code: 409, 
      name: 'Conflict', 
      description: 'The request could not be completed due to a conflict with the current state of the resource.',
      likelyCause: 'Concurrent modification conflicts, like trying to update a resource that was modified by someone else.',
    },
    { 
      code: 410, 
      name: 'Gone', 
      description: 'The requested resource is no longer available and has been permanently removed.',
      likelyCause: 'Resource was intentionally removed and won\'t be available again.',
    },
    { 
      code: 429, 
      name: 'Too Many Requests', 
      description: 'The user has sent too many requests in a given amount of time.',
      likelyCause: 'Rate limiting, API quota exceeded, or DDoS protection triggered.',
    },
  ],
  'Server Error (5xx)': [
    { 
      code: 500, 
      name: 'Internal Server Error', 
      description: 'A generic error message given when an unexpected condition was encountered.',
      likelyCause: 'Server-side exceptions, database errors, or unhandled errors in application code.',
    },
    { 
      code: 501, 
      name: 'Not Implemented', 
      description: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request.',
      likelyCause: 'Server doesn\'t support the functionality required to fulfill the request.',
    },
    { 
      code: 502, 
      name: 'Bad Gateway', 
      description: 'The server received an invalid response from the upstream server.',
      likelyCause: 'Proxy server received an invalid response from the backend server.',
    },
    { 
      code: 503, 
      name: 'Service Unavailable', 
      description: 'The server is currently unable to handle the request due to temporary overload or maintenance.',
      likelyCause: 'Server is down for maintenance, overloaded, or experiencing issues.',
    },
    { 
      code: 504, 
      name: 'Gateway Timeout', 
      description: 'The upstream server failed to send a request in the time allowed by the server.',
      likelyCause: 'Backend server took too long to respond to the proxy server.',
    },
    { 
      code: 505, 
      name: 'HTTP Version Not Supported', 
      description: 'The server does not support the HTTP protocol version used in the request.',
      likelyCause: 'Client is using an HTTP version that the server doesn\'t support.',
    },
  ],
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData 
        title="HTTP Status Codes | MyDebugTools"
        description="Comprehensive reference for HTTP status codes with explanations, common use cases, and best practices for web development."
        toolType="WebApplication"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HTTP Status Codes</h1>
        <p className="text-lg text-gray-600">
          A comprehensive reference for HTTP status codes with explanations and use cases
        </p>
      </div>

      {/* Search and filter */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search status codes, names, or descriptions..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Status code categories */}
      <div className="space-y-8">
        {Object.entries(filteredStatusCodes).map(([category, codes]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-b pb-2">{category}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {codes.map((statusCode) => (
                <div
                  key={statusCode.code}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {statusCode.code}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusCode.code < 200
                            ? 'bg-blue-100 text-blue-800'
                            : statusCode.code < 300
                            ? 'bg-green-100 text-green-800'
                            : statusCode.code < 400
                            ? 'bg-yellow-100 text-yellow-800'
                            : statusCode.code < 500
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {statusCode.code < 200
                          ? 'Informational'
                          : statusCode.code < 300
                          ? 'Success'
                          : statusCode.code < 400
                          ? 'Redirection'
                          : statusCode.code < 500
                          ? 'Client Error'
                          : 'Server Error'}
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {statusCode.name}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {statusCode.description}
                    </p>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Likely Cause:
                      </p>
                      <p className="text-sm text-gray-600">
                        {statusCode.likelyCause}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(filteredStatusCodes).length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No status codes found matching your search.</p>
          </div>
        )}
      </div>

      {/* Best practices section */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Best Practices</h3>
        <ul className="space-y-3 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use appropriate status codes that accurately reflect the result of the request</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Include helpful error messages in the response body for 4xx and 5xx errors</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use 200 for successful GET requests and 201 for successful POST requests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use 204 when the request is successful but there's no content to return</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use 400 for client errors and 500 for server errors</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Include proper CORS headers when necessary</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use 429 to rate limit requests and include a Retry-After header</span>
          </li>
        </ul>
      </div>
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