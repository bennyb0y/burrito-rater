'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-blue-600 border-b-2 border-blue-600 px-3 py-2 rounded-md text-sm sm:text-base font-semibold"
      : "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm sm:text-base font-semibold";
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-blue-600">
              🌯 Benny's Breakfast Burrito Rating 🌯
            </h1>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <Link
              href="/"
              className={getLinkClass("/")}
            >
              Map View
            </Link>
            <Link
              href="/list"
              className={getLinkClass("/list")}
            >
              List View
            </Link>
            <Link
              href="/guide"
              className={getLinkClass("/guide")}
            >
              User Guide
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 