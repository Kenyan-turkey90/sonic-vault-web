import type { Metadata } from "next";
import { Oswald, IBM_Plex_Mono, Archivo } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sonic Vault — Your music, sealed in the vault",
  description:
    "A free Android music player. Offline-first, zero telemetry, full privacy. Download the APK from GitHub.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${ibmPlexMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0D] text-[#E9E4D8] font-sans">
        {children}
      </body>
    </html>
  );
}
