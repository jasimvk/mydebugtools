'use client';

import React from 'react';
import nextDynamic from 'next/dynamic';

const MonacoEditor = nextDynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TreeViewProps {
  data: any;
}

const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const jsonString = React.useMemo(() => JSON.stringify(data, null, 2), [data]);

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        defaultLanguage="json"
        value={jsonString}
        theme="light"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
          automaticLayout: true,
          renderValidationDecorations: 'off',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        onMount={(editor) => {
          // Ensure the editor is properly initialized
          editor.layout();
        }}
      />
    </div>
  );
};

export default TreeView; 