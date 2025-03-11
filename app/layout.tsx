import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Benny's Breakfast Burrito Rating",
  description: 'Rate and discover the best breakfast burritos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="flex flex-col h-full">
          <Navigation />
          <main className="flex-1 relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
