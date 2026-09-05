import type { Metadata, Viewport } from "next";
import { bricolage, inter } from "@/lib/fonts";
import "./globals.css";
import { SessionProvider } from "@/lib/session-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ConfirmationProvider } from "@/components/ui/confirmation-modal";
import { Suspense } from "react";
import { TopLoader } from "@/components/layout/top-loader";
import { PageLoadingOverlay } from "@/components/layout/page-loading-overlay";
import { NetworkStatusIndicator } from "@/components/layout/network-status-indicator";

export const metadata: Metadata = {
  title: {
    default: "Layerat — Super Admin Dashboard",
    template: "%s · Layerat Super Admin",
  },
  description: "Unified Super Admin Command Center for Layerat platform governance, content moderation, RBAC roles, and CMS.",
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={bricolage.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black`}
      >
        <ThemeProvider>
          <ConfirmationProvider>
            <SessionProvider>
              <Suspense fallback={null}>
                <TopLoader />
                <PageLoadingOverlay />
              </Suspense>

              <main className="flex-1 flex flex-col">{children}</main>
              <NetworkStatusIndicator />
            </SessionProvider>
          </ConfirmationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
