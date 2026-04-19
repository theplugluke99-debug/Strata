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
  title: "Strata | Premium Flooring — Essex & London",
  description: "Instant flooring quote online. Free home survey with samples. Vetted fitters. Fair pricing with no hidden costs. Serving Essex and London.",
  openGraph: {
    title: "Strata | Premium Flooring — Essex & London",
    description: "Instant flooring quote online. Free home survey with samples. Vetted fitters. Fair pricing with no hidden costs. Serving Essex and London.",
  },
  themeColor: "#111110",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if (window.location.hash) { window.history.replaceState(null, '', window.location.pathname); }` }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
