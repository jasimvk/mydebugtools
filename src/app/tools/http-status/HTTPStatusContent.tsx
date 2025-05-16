'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InformationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import StructuredData from '@/components/StructuredData';

interface StatusCode {
  code: number;
  name: string;
  description: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  reference: string;
}

const statusCodes: StatusCode[] = [
  // 1xx Informational
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.', category: '1xx', reference: 'RFC7231' },
  { code: 101, name: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.', category: '1xx', reference: 'RFC7231' },
  { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.', category: '1xx', reference: 'RFC2518' },
  { code: 103, name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.', category: '1xx', reference: 'RFC8297' },

  // 2xx Success
  { code: 200, name: 'OK', description: 'The request has succeeded.', category: '2xx', reference: 'RFC7231' },
  { code: 201, name: 'Created', description: 'The request has succeeded and a new resource has been created as a result.', category: '2xx', reference: 'RFC7231' },
  { code: 202, name: 'Accepted', description: 'The request has been received but not yet acted upon.', category: '2xx', reference: 'RFC7231' },
  { code: 203, name: 'Non-Authoritative Information', description: 'The returned metadata is different from what was originally available.', category: '2xx', reference: 'RFC7231' },
  { code: 204, name: 'No Content', description: 'The server successfully processed the request and is not returning any content.', category: '2xx', reference: 'RFC7231' },
  { code: 205, name: 'Reset Content', description: 'The server has fulfilled the request and desires that the client reset the document view.', category: '2xx', reference: 'RFC7231' },
  { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.', category: '2xx', reference: 'RFC7233' },
  { code: 207, name: 'Multi-Status', description: 'The message body that follows is an XML message and can contain a number of separate response codes.', category: '2xx', reference: 'RFC4918' },
  { code: 208, name: 'Already Reported', description: 'The members of a DAV binding have already been enumerated in a previous reply.', category: '2xx', reference: 'RFC5842' },
  { code: 226, name: 'IM Used', description: 'The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations.', category: '2xx', reference: 'RFC3229' },

  // 3xx Redirection
  { code: 300, name: 'Multiple Choices', description: 'The request has more than one possible response.', category: '3xx', reference: 'RFC7231' },
  { code: 301, name: 'Moved Permanently', description: 'The URL of the requested resource has been changed permanently.', category: '3xx', reference: 'RFC7231' },
  { code: 302, name: 'Found', description: 'The URI of requested resource has been changed temporarily.', category: '3xx', reference: 'RFC7231' },
  { code: 303, name: 'See Other', description: 'The client should look at another URI using a GET method.', category: '3xx', reference: 'RFC7231' },
  { code: 304, name: 'Not Modified', description: 'The client can use cached data.', category: '3xx', reference: 'RFC7232' },
  { code: 305, name: 'Use Proxy', description: 'The requested resource must be accessed through the proxy given by the Location field.', category: '3xx', reference: 'RFC7231' },
  { code: 307, name: 'Temporary Redirect', description: 'The request should be repeated with another URI.', category: '3xx', reference: 'RFC7231' },
  { code: 308, name: 'Permanent Redirect', description: 'The request and all future requests should be repeated using another URI.', category: '3xx', reference: 'RFC7538' },

  // 4xx Client Errors
  { code: 400, name: 'Bad Request', description: 'The server cannot or will not process the request due to an apparent client error.', category: '4xx', reference: 'RFC7231' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.', category: '4xx', reference: 'RFC7235' },
  { code: 402, name: 'Payment Required', description: 'Reserved for future use.', category: '4xx', reference: 'RFC7231' },
  { code: 403, name: 'Forbidden', description: 'The server understood the request but refuses to authorize it.', category: '4xx', reference: 'RFC7231' },
  { code: 404, name: 'Not Found', description: 'The requested resource could not be found.', category: '4xx', reference: 'RFC7231' },
  { code: 405, name: 'Method Not Allowed', description: 'The request method is not supported for the requested resource.', category: '4xx', reference: 'RFC7231' },
  { code: 406, name: 'Not Acceptable', description: 'The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.', category: '4xx', reference: 'RFC7231' },
  { code: 407, name: 'Proxy Authentication Required', description: 'The client must first authenticate itself with the proxy.', category: '4xx', reference: 'RFC7235' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.', category: '4xx', reference: 'RFC7231' },
  { code: 409, name: 'Conflict', description: 'The request could not be completed due to a conflict with the current state of the resource.', category: '4xx', reference: 'RFC7231' },
  { code: 410, name: 'Gone', description: 'The requested resource is no longer available at the server.', category: '4xx', reference: 'RFC7231' },
  { code: 411, name: 'Length Required', description: 'The request did not specify the length of its content.', category: '4xx', reference: 'RFC7231' },
  { code: 412, name: 'Precondition Failed', description: 'The server does not meet one of the preconditions specified in the request.', category: '4xx', reference: 'RFC7232' },
  { code: 413, name: 'Payload Too Large', description: 'The request is larger than the server is willing or able to process.', category: '4xx', reference: 'RFC7231' },
  { code: 414, name: 'URI Too Long', description: 'The URI provided was too long for the server to process.', category: '4xx', reference: 'RFC7231' },
  { code: 415, name: 'Unsupported Media Type', description: 'The request entity has a media type which the server or resource does not support.', category: '4xx', reference: 'RFC7231' },
  { code: 416, name: 'Range Not Satisfiable', description: 'The client has asked for a portion of the file but the server cannot supply that portion.', category: '4xx', reference: 'RFC7233' },
  { code: 417, name: 'Expectation Failed', description: 'The server cannot meet the requirements of the Expect request-header field.', category: '4xx', reference: 'RFC7231' },
  { code: 418, name: 'I\'m a teapot', description: 'This code was defined in 1998 as one of the traditional IETF April Fools\' jokes.', category: '4xx', reference: 'RFC2324' },
  { code: 421, name: 'Misdirected Request', description: 'The request was directed at a server that is not able to produce a response.', category: '4xx', reference: 'RFC7540' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.', category: '4xx', reference: 'RFC4918' },
  { code: 423, name: 'Locked', description: 'The resource that is being accessed is locked.', category: '4xx', reference: 'RFC4918' },
  { code: 424, name: 'Failed Dependency', description: 'The request failed due to failure of a previous request.', category: '4xx', reference: 'RFC4918' },
  { code: 425, name: 'Too Early', description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.', category: '4xx', reference: 'RFC8470' },
  { code: 426, name: 'Upgrade Required', description: 'The client should switch to a different protocol.', category: '4xx', reference: 'RFC7231' },
  { code: 428, name: 'Precondition Required', description: 'The origin server requires the request to be conditional.', category: '4xx', reference: 'RFC6585' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.', category: '4xx', reference: 'RFC6585' },
  { code: 431, name: 'Request Header Fields Too Large', description: 'The server is unwilling to process the request because its header fields are too large.', category: '4xx', reference: 'RFC6585' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: 'The server is denying access to the resource as a consequence of a legal demand.', category: '4xx', reference: 'RFC7725' },

  // 5xx Server Errors
  { code: 500, name: 'Internal Server Error', description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.', category: '5xx', reference: 'RFC7231' },
  { code: 501, name: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.', category: '5xx', reference: 'RFC7231' },
  { code: 502, name: 'Bad Gateway', description: 'The server received an invalid response from the upstream server.', category: '5xx', reference: 'RFC7231' },
  { code: 503, name: 'Service Unavailable', description: 'The server is currently unable to handle the request due to temporary overload or maintenance.', category: '5xx', reference: 'RFC7231' },
  { code: 504, name: 'Gateway Timeout', description: 'The upstream server failed to send a request in the time allowed by the server.', category: '5xx', reference: 'RFC7231' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The server does not support the HTTP protocol version used in the request.', category: '5xx', reference: 'RFC7231' },
];

export default function HTTPStatusContent() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCodes = statusCodes.filter(code => {
    const matchesSearch = code.code.toString().includes(search) ||
                         code.name.toLowerCase().includes(search.toLowerCase()) ||
                         code.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '1xx': return 'bg-blue-100 text-blue-800';
      case '2xx': return 'bg-green-100 text-green-800';
      case '3xx': return 'bg-yellow-100 text-yellow-800';
      case '4xx': return 'bg-red-100 text-red-800';
      case '5xx': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <StructuredData 
        title="HTTP Status Codes | MyDebugTools"
        description="Comprehensive reference of HTTP status codes with descriptions, categories, and RFC references."
        toolType="WebApplication"
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HTTP Status Codes</h1>
          <p className="text-gray-600">Reference guide for HTTP status codes and their meanings</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg mb-4">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">How to use:</h2>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Search for specific status codes by number or name</li>
          <li>Filter by category (1xx, 2xx, 3xx, 4xx, 5xx)</li>
          <li>Click on a status code to see detailed information</li>
          <li>Use the reference links to learn more about each status code</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search status codes..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="1xx">1xx - Informational</option>
          <option value="2xx">2xx - Success</option>
          <option value="3xx">3xx - Redirection</option>
          <option value="4xx">4xx - Client Error</option>
          <option value="5xx">5xx - Server Error</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCodes.map((code) => (
          <Card key={code.code} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  {code.code} - {code.name}
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(code.category)}`}>
                  {code.category}
                </span>
              </div>
              <CardDescription>
                {code.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Reference:</span> {code.reference}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <div className="text-center max-w-md">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No status codes found</h3>
            <p className="text-gray-500">
              Try adjusting your search or category filter to find what you're looking for.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 