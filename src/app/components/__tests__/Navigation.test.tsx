import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import Navigation from '../Navigation';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() })
}));

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(
      <ThemeProvider attribute="class">
        <Navigation />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(
      <ThemeProvider attribute="class">
        <Navigation />
      </ThemeProvider>
    );
    
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('renders logo link', () => {
    render(
      <ThemeProvider attribute="class">
        <Navigation />
      </ThemeProvider>
    );
    
    const logoLink = screen.getByRole('link', { name: /logo/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });
}); 