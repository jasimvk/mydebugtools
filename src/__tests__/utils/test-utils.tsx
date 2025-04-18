import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    )
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data for testing
export const mockTools = [
  {
    name: 'JSON Formatter',
    description: 'Format and validate JSON data',
    href: '/tools/json',
    icon: 'CodeBracketIcon',
  },
  {
    name: 'Regex Tester',
    description: 'Test regular expressions',
    href: '/tools/regex',
    icon: 'MagnifyingGlassIcon',
  },
]

export const mockFeatures = [
  {
    name: 'Modern UI',
    description: 'Clean and intuitive interface',
    icon: 'PaintBrushIcon',
  },
  {
    name: 'Dark Mode',
    description: 'Support for light and dark themes',
    icon: 'MoonIcon',
  },
]

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { render } 