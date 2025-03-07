'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client-side auth component
const AdminAuth = dynamic(() => import('./AdminAuth'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AdminAuth>{children}</AdminAuth>
    </Suspense>
  );
} 