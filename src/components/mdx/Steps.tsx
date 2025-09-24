import React, { Children, isValidElement } from 'react';

interface StepsProps {
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <div className="prose prose-sm max-w-none">{children}</div>
    </div>
  );
}

export function Steps({ children }: StepsProps) {
  const stepElements = Children.toArray(children).filter(isValidElement) as React.ReactElement<StepProps>[];

  return (
    <div className="my-8">
      {stepElements.map((step, index) => (
        <div key={index} className="relative flex">
          {/* Step Number */}
          <div className="flex flex-col items-center mr-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            {index < stepElements.length - 1 && (
              <div className="w-px bg-gray-300 flex-1 mt-4 min-h-8" />
            )}
          </div>

          {/* Step Content */}
          <div className="flex-1 pb-8">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">
              {step.props.title}
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              {step.props.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}