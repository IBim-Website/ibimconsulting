// app/layout.tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shop iBIM",
  description: "Our specialized store for Tekla Structures automation tools, residential detailing plugins, and professional BIM training modules is currently undergoing a structural update.",
};

export default function RootLayout({
  children,
}) {
  return (
    // --- ADD suppressHydrationWarning HERE ---
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark" // This forces dark mode
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}