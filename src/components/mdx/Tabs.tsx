'use client';

import React, { useState, Children, isValidElement } from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultTab?: string;
}

interface TabProps {
  label: string;
  value: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <div>{children}</div>;
}

export function Tabs({ children, defaultTab }: TabsProps) {
  const tabElements = Children.toArray(children).filter(isValidElement) as React.ReactElement<TabProps>[];

  const [activeTab, setActiveTab] = useState(
    defaultTab || (tabElements[0]?.props.value ?? '')
  );

  if (tabElements.length === 0) {
    return null;
  }

  const activeTabContent = tabElements.find(tab => tab.props.value === activeTab);

  return (
    <div className="my-6">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabElements.map((tab) => (
          <button
            key={tab.props.value}
            onClick={() => setActiveTab(tab.props.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.props.value
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTabContent && (
          <div className="prose prose-lg max-w-none">
            {activeTabContent.props.children}
          </div>
        )}
      </div>
    </div>
  );
}