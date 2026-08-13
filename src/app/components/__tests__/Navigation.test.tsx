import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from '../Navigation';

jest.mock('next/navigation', () => ({
  usePathname: () => '/tools/api',
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: jest.fn(),
}));

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<Navigation />);

    ['API Workbench', 'Utilities', 'Docs'].forEach((name) => {
      expect(screen.getByRole('link', { name: new RegExp(`^${name}$`, 'i') })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /^Project$/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^AI Debug$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Roadmap$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^CLI$/i })).not.toBeInTheDocument();
  });

  it('marks only the current page for assistive technology', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: /API Workbench/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /^Utilities$/i })).not.toHaveAttribute('aria-current');
  });

  it('renders logo link', () => {
    render(<Navigation />);

    // Anchored: the GitHub button's label ("Star DebugTools on GitHub") also
    // contains "DebugTools" and would otherwise make this query ambiguous.
    const logoLink = screen.getByRole('link', { name: /^debugtools$/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('opens the mobile menu with accessibility state', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);

    expect(screen.getByRole('button', { name: /close main menu/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('link', { name: /Sponsor/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Sign in/i }).length).toBeGreaterThan(0);
  });
});
