import "./globals.css";
import { COMPANY } from "@/data/company";

export const metadata = {
  // metadataBase lets every page declare a relative canonical and lets OG
  // image paths resolve to absolute URLs.
  metadataBase: new URL(COMPANY.url),
  title: {
    default: "Sirah Digital | Intelligent Business Automation Systems",
    // Each route supplies its own title; this wraps it.
    template: "%s | Sirah Digital",
  },
  description: "Automate, simplify, and scale through custom software.",
  openGraph: {
    siteName: "Sirah Digital",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* overflow-x-hidden guarantees the "no horizontal scrolling" rule
          holds even if a decorative glow overshoots the viewport. */}
      <body className="bg-space antialiased m-0 p-0 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
