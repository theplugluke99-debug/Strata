import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Strata | Carpets & Flooring — Essex & London",
  description: "Get an instant flooring quote online. Free home survey with samples brought to you. Vetted fitters. Fair transparent pricing with no hidden costs. Carpet, LVT, herringbone, laminate and vinyl specialists covering Essex and London.",
  keywords: "flooring Essex, carpet fitting London, LVT flooring Essex, herringbone flooring London, supply and fit flooring, free flooring survey Essex, carpet fitter near me, flooring quote online",
  openGraph: {
    title: "Strata | Carpets & Flooring — Essex & London",
    description: "Instant quote. Free home survey. Vetted fitters. The price you're quoted is the price you pay.",
    url: "https://www.stratafloors.co.uk",
    siteName: "Strata",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strata | Carpets & Flooring — Essex & London",
    description: "Instant quote. Free home survey. Vetted fitters. No hidden costs.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.stratafloors.co.uk",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if (window.location.hash) { window.history.replaceState(null, '', window.location.pathname); }` }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
