import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preload" href="/globals.css" as="style" />
        <meta httpEquiv="Cache-Control" content="public, max-age=604800, immutable" />
      </head>
      <body>{children}</body>
    </html>
  );
}
