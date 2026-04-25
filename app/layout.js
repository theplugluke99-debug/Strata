import { Geist, Geist_Mono, Cormorant_Garamond, Outfit, Dancing_Script } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "Strata | Premium Carpets & Flooring — Essex & London",
  description: "Premium carpet and flooring specialists covering Essex and East London. Instant online quote, free home survey with samples delivered to your door, vetted fitters, no hidden costs. Supply and fit carpet, LVT, herringbone, laminate, vinyl and engineered wood.",
  keywords: "carpet fitters Essex, carpet fitting East London, flooring Essex, LVT fitting Essex, herringbone flooring Essex, carpet supply and fit London, free flooring survey Essex, flooring quote online, carpet fitter near me Essex, engineered wood flooring London, laminate flooring Essex, vinyl flooring fitting London, flooring specialists Essex, carpet fitting Chelmsford, carpet fitting Basildon, carpet fitting Ilford, flooring company Essex",
  openGraph: {
    title: "Strata | Premium Carpets & Flooring — Essex & London",
    description: "Instant online quote. Free home survey with samples. Vetted fitters. The price you're quoted is the price you pay — no surprises on fitting day.",
    url: "https://www.stratafloors.co.uk",
    siteName: "Strata Carpets & Flooring",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strata | Premium Carpets & Flooring — Essex & London",
    description: "Instant quote. Free home survey. Vetted fitters. No hidden costs. Ever.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.stratafloors.co.uk",
  },
  icons: {
    icon: [
      { url: '/favicon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${outfit.variable} ${dancing.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if (window.location.hash) { window.history.replaceState(null, '', window.location.pathname); }` }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
