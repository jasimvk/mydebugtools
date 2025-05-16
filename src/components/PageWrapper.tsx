'use client';

import { ReactNode } from 'react';
import SuspenseBoundary from './SuspenseBoundary';

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <SuspenseBoundary>
      {children}
    </SuspenseBoundary>
  );
} 