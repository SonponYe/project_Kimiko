import type { Metadata, Viewport } from 'next';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'KIMIKO',
  description: 'Rest your fingers on the screen. Lifting one is the action.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KIMIKO',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-kimiko-bg font-sans text-kimiko-fg antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
