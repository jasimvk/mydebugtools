# Google Analytics Implementation Guide

This document explains how Google Analytics is implemented in MyDebugTools and how to use it.

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the root directory with your Google Analytics Measurement ID:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-measurement-id
```

**To get your Measurement ID:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or select an existing one
3. Go to Admin > Data Streams
4. Create a new web stream or select existing
5. Copy the Measurement ID (format: G-XXXXXXXXXX)

### 2. Components Structure

The Google Analytics implementation consists of several components:

- **`GoogleAnalytics.tsx`** - Main component that loads the GA script
- **`AnalyticsProvider.tsx`** - Provider that tracks page views
- **`useAnalytics.ts`** - Hook for tracking custom events
- **`analytics.ts`** - Utility functions for various tracking scenarios

## Usage

### Automatic Page Tracking

Page views are automatically tracked when users navigate between pages. This is handled by the `AnalyticsProvider` component in the root layout.

### Custom Event Tracking

Use the `useAnalytics` hook in your components to track custom events:

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackTool, trackConversion, trackEngagement } = useAnalytics();

  const handleButtonClick = () => {
    trackEvent('button_click', 'UI Interaction', 'my_button');
  };

  const handleToolUsage = () => {
    trackTool('json-formatter', 'use');
  };

  return (
    <button onClick={handleButtonClick}>
      Click me
    </button>
  );
}
```

### Available Tracking Functions

#### 1. `trackEvent(action, category, label, value?)`
Track custom events with category and label.

```tsx
trackEvent('download', 'File Action', 'json-file', 1);
```

#### 2. `trackTool(toolName, action?)`
Track tool usage events.

```tsx
trackTool('json-formatter', 'use');
trackTool('base64-encoder', 'encode');
```

#### 3. `trackConversion(conversionType, value?)`
Track conversion events.

```tsx
trackConversion('task_completed', 1);
trackConversion('file_processed', 1);
```

#### 4. `trackEngagement(action, details?)`
Track user engagement events.

```tsx
trackEngagement('scroll_to_bottom', { 
  page_section: 'tools',
  time_spent: 30 
});
```

## Implementation in Tools

### Example: JSON Formatter Tool

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

export default function JsonFormatter() {
  const { trackTool, trackEvent } = useAnalytics();

  const handleFormat = (jsonString: string) => {
    // Track tool usage
    trackTool('json-formatter', 'format');
    
    // Track specific actions
    trackEvent('format_json', 'Tool Action', 'json-formatter');
    
    // Your formatting logic here
  };

  const handleValidate = () => {
    trackTool('json-formatter', 'validate');
    trackEvent('validate_json', 'Tool Action', 'json-formatter');
  };

  return (
    // Your component JSX
  );
}
```

### Example: API Tester Tool

```tsx
import { useAnalytics } from '../hooks/useAnalytics';

export default function ApiTester() {
  const { trackTool, trackEvent, trackConversion } = useAnalytics();

  const handleApiCall = async (url: string, method: string) => {
    // Track tool usage
    trackTool('api-tester', 'make_request');
    
    // Track specific API call details
    trackEvent('api_request', 'API Testing', `${method} ${url}`);
    
    try {
      // Make API call
      const response = await fetch(url, { method });
      
      // Track successful API call
      trackConversion('api_success', 1);
      trackEvent('api_success', 'API Testing', `${method} ${url}`);
      
    } catch (error) {
      // Track failed API call
      trackEvent('api_error', 'API Testing', `${method} ${url}`);
    }
  };

  return (
    // Your component JSX
  );
}
```

## Event Categories

Use these predefined categories for consistent tracking:

- **Tool Usage** - When users interact with tools
- **UI Interaction** - Button clicks, form submissions, etc.
- **User Engagement** - Scrolling, time spent, etc.
- **Conversion** - Task completions, successful operations
- **Error** - Error events and exceptions

## Privacy Considerations

- The implementation respects user privacy by only tracking when the GA script is loaded
- No personal data is collected
- All tracking is anonymous
- Users can opt out using browser extensions or GA opt-out tools

## Testing

### Development Testing

1. Set up your `.env.local` file with a test Measurement ID
2. Open browser developer tools
3. Go to Network tab and filter by "google-analytics"
4. Navigate through your app and verify requests are being sent

### Production Verification

1. Deploy with your production Measurement ID
2. Check Google Analytics Real-time reports
3. Verify events are appearing in the dashboard

## Troubleshooting

### Common Issues

1. **Events not showing in GA**
   - Check if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
   - Verify the Measurement ID format (G-XXXXXXXXXX)
   - Check browser console for errors

2. **Page views not tracking**
   - Ensure `AnalyticsProvider` is wrapping your app in `layout.tsx`
   - Check if the GA script is loading in the Network tab

3. **Custom events not working**
   - Verify `useAnalytics` hook is imported correctly
   - Check if the tracking functions are being called
   - Ensure the component is client-side rendered

### Debug Mode

Add this to your component to debug tracking:

```tsx
const { trackEvent } = useAnalytics();

const debugTrack = (action: string, category: string, label: string) => {
  console.log('Tracking event:', { action, category, label });
  trackEvent(action, category, label);
};
```

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for events and categories
2. **Meaningful Labels**: Use descriptive labels that help with analysis
3. **Avoid Over-tracking**: Don't track every single user interaction
4. **Test Thoroughly**: Always test tracking in development before deploying
5. **Monitor Performance**: Ensure tracking doesn't impact app performance

## Analytics Dashboard

Once implemented, you can view your analytics data in Google Analytics:

- **Real-time**: See live user activity
- **Audience**: User demographics and behavior
- **Acquisition**: How users find your site
- **Behavior**: Which tools are most popular
- **Conversions**: Track specific goals and events

This implementation provides comprehensive tracking for your MyDebugTools application while maintaining good performance and user privacy.
