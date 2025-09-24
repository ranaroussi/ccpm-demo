'use client';

import React, { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export function CodeBlock({
  children,
  language = 'text',
  title,
  showLineNumbers = false,
  highlightLines = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const lines = children.split('\n');

  return (
    <div className="relative my-6">
      {title && (
        <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg border-b border-gray-700">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wide">{language}</span>
        </div>
      )}

      <div className="relative">
        <pre className={`overflow-x-auto p-4 bg-gray-900 text-gray-100 ${
          title ? 'rounded-b-lg' : 'rounded-lg'
        }`}>
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <div className="table-auto w-full">
                {lines.map((line, index) => {
                  const lineNumber = index + 1;
                  const isHighlighted = highlightLines.includes(lineNumber);

                  return (
                    <div
                      key={index}
                      className={`table-row ${
                        isHighlighted ? 'bg-blue-900/50' : ''
                      }`}
                    >
                      <div className="table-cell pr-4 text-right select-none text-gray-500 text-sm border-r border-gray-700 mr-4">
                        {lineNumber}
                      </div>
                      <div className="table-cell pl-4 w-full">
                        {line || '\u00A0'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              children
            )}
          </code>
        </pre>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md transition-colors text-sm"
          title="Copy code"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}