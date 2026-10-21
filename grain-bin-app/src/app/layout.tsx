import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Grain Bin | Digital Dollar Market Intelligence",
  description: "A clearer view of digital dollars. Explore USD stablecoin supply, momentum, and market concentration. A Shelterbelt experiment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
    <body>{children}</body>
  </html>;
}
