import type { Metadata, Viewport } from "next";
import { Cinzel, Outfit } from "next/font/google";
import { artist } from "@/lib/catalog";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const title = "emerald tabs — The Tablet";
const description = artist.bio;

export const metadata: Metadata = {
  metadataBase: new URL(artist.siteUrl),
  title: {
    default: title,
    template: "%s · emerald tabs",
  },
  description,
  applicationName: "emerald tabs",
  authors: [{ name: artist.stageName, url: artist.profileUrl }],
  creator: artist.stageName,
  keywords: [
    "emerald tabs",
    "Tenderloin Lemonaide",
    "lo-fi",
    "San Francisco",
    "ElevenMusic",
    "Shatter Sync",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: artist.siteUrl,
    siteName: "emerald tabs",
    title,
    description,
    images: [
      {
        url: artist.avatarUrl,
        width: 940,
        height: 940,
        alt: "emerald tabs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [artist.avatarUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: artist.avatarUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: artist.stageName,
  url: artist.siteUrl,
  image: artist.avatarUrl,
  description: artist.bio,
  album: {
    "@type": "MusicAlbum",
    name: artist.album,
  },
  sameAs: [artist.profileUrl, artist.artistsUrl],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cinzel.variable} dark h-full scroll-smooth antialiased`}
    >
      <body className="relative min-h-full bg-background font-sans text-foreground">
        <a
          href="#tablet"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-emerald-400 focus:px-3 focus:py-2 focus:text-emerald-950"
        >
          Skip to the tablet
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
