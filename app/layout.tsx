import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import RadioMiniPlayer from "@/components/RadioMiniPlayer";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.onpointprompt.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <RadioMiniPlayer />
        </div>
      </body>
    </html>
  );
}
