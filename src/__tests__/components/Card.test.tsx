import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Component', () => {
  it('renders Card with default styles', () => {
    render(<Card>Test Content</Card>);
    const card = screen.getByText('Test Content').parentElement;
    expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm');
  });

  it('renders CardHeader with default styles', () => {
    render(<CardHeader>Header Content</CardHeader>);
    const header = screen.getByText('Header Content').parentElement;
    expect(header).toHaveClass('flex flex-col space-y-1.5 p-6');
  });

  it('renders CardTitle with default styles', () => {
    render(<CardTitle>Title Content</CardTitle>);
    const title = screen.getByText('Title Content');
    expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
  });

  it('renders CardDescription with default styles', () => {
    render(<CardDescription>Description Content</CardDescription>);
    const description = screen.getByText('Description Content');
    expect(description).toHaveClass('text-sm text-muted-foreground');
  });

  it('renders CardContent with default styles', () => {
    render(<CardContent>Content</CardContent>);
    const content = screen.getByText('Content').parentElement;
    expect(content).toHaveClass('p-6 pt-0');
  });

  it('renders CardFooter with default styles', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    const footer = screen.getByText('Footer Content').parentElement;
    expect(footer).toHaveClass('flex items-center p-6 pt-0');
  });

  it('renders a complete Card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Footer')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-class">Test Content</Card>);
    const card = screen.getByText('Test Content').parentElement;
    expect(card).toHaveClass('custom-class');
  });
}); 