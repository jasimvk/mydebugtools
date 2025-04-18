import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  const MockMonacoEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 font-mono text-sm border rounded p-3"
    />
  );
  return MockMonacoEditor;
});

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Mock jsonrepair
jest.mock('jsonrepair', () => ({
  jsonrepair: jest.fn((str) => str),
}));

describe('JSON Tools Page', () => {
  const sampleJSON = '{"name": "John", "age": 30}';
  const invalidJSON = '{"name": "John", age: 30}';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tabs', () => {
    render(<Page />);
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Validate')).toBeInTheDocument();
    expect(screen.getByText('Transform')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('loads sample JSON when clicking the sample button', async () => {
    render(<Page />);
    const sampleButton = screen.getByTitle('Load sample JSON');
    fireEvent.click(sampleButton);
    
    const editor = screen.getByTestId('monaco-editor');
    await waitFor(() => {
      expect(editor).toHaveValue(expect.stringContaining('"name"'));
    });
  });

  it('validates JSON input', async () => {
    render(<Page />);
    
    // Switch to validate tab
    fireEvent.click(screen.getByText('Validate'));
    
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: sampleJSON } });
    
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Valid JSON')).toBeInTheDocument();
    });
  });

  it('shows error for invalid JSON', async () => {
    render(<Page />);
    
    // Switch to validate tab
    fireEvent.click(screen.getByText('Validate'));
    
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: invalidJSON } });
    
    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
    });
  });

  it('allows exporting JSON in different formats', async () => {
    render(<Page />);
    
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: sampleJSON } });
    
    const formatSelect = screen.getByRole('combobox');
    fireEvent.change(formatSelect, { target: { value: 'yaml' } });
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    // Verify that saveAs was called
    const FileSaver = require('file-saver');
    expect(FileSaver.saveAs).toHaveBeenCalled();
  });

  it('clears the editor when clicking clear button', async () => {
    render(<Page />);
    
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: sampleJSON } });
    
    const clearButton = screen.getByTitle('Clear input');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(editor).toHaveValue('');
    });
  });
}); 