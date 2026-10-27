import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voxel Drop — 3D puzzle',
  description:
    'A 3D falling-block puzzle inside an 8×8×8 cube. Play Focus or Hardcore, learn the controls and keep your progress on this device.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
