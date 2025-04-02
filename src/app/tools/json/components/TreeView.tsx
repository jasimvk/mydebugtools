'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface TreeViewProps {
  data: any;
  theme?: 'light' | 'dark';
}

const TreeView: React.FC<TreeViewProps> = ({ data, theme = 'light' }) => {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="json"
        value={jsonString}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default TreeView; 