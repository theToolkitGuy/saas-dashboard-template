import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import config from "@/saas.config";
import { ThemeProvider, themeScript } from "@/lib/theme";
import { AppStateProvider } from "@/lib/state/provider";
import { StatePanel } from "@/components/organism/StatePanel";
import "./globals.css";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });

export const metadata: Metadata = {
  title: config.app.name,
  description: `${config.app.name} dashboard`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={interTight.variable} data-theme="light" suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint, so dark mode never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-base-100 text-base-content font-sans antialiased">
        <ThemeProvider>
          {/* Real app: <AppStateProvider initialState={await loadAppState()}> (lib/backend.ts) */}
          <AppStateProvider>
            {children}
            <StatePanel />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
