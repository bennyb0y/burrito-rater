import './globals.css';
import Navigation from './components/Navigation';

export const metadata = {
  title: 'Burrito Rater',
  description: 'Rate and discover the best breakfast burritos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col h-screen overflow-hidden">
          <Navigation />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
