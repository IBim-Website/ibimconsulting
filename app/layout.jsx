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
          <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-amber-500/30 selection:text-amber-100 pb-24 overflow-hidden relative">
                
                {/* Blueprint Grid Pattern - Shared globally */}
                <div 
                  className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none blend-overlay" 
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)', 
                    backgroundSize: '50px 50px' 
                  }}
                />
          
                {/* AMBIENT GLOWS - Shared globally */}
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000" style={{ opacity: 1 }}>
                  <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                  <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-800/20 blur-[150px] mix-blend-screen" />
                  <div className="absolute bottom-[-40%] left-[20%] w-[60%] h-[60%] rounded-full bg-amber-700/10 blur-[180px] mix-blend-screen" />
                </div>
          
                  {children}
          
              </main>
        </ThemeProvider>
      </body>
    </html>
  );
}