import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CCTV SERVER RECOVERY // CLASSIFIED',
  description: 'Escape Room — CCTV Server Recovery Mission',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'CCTV Recovery',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-green-400 h-[100dvh] w-[100dvw] overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
