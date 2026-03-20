import { CartProvider } from './CartContext'; 
import FloatingCart from './FloatingCart';
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
  description: "Specialized store for Tekla Structures automation tools and professional BIM training.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
        >
          {/* Background Lifted: 
            From #020617 (near black) to #0f172a (Slate 900).
            Added a subtle radial gradient to give the screen a "center-lit" feel.
          */}
          <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_50%_0%,rgba(30,41,59,1)_0%,rgba(15,23,42,1)_100%)] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-100 pb-24 overflow-hidden relative">
            
            {/* Grid: 
               Changed from blue-200/20 to slate-500/10 for a cleaner, 
               less "neon" technical look.
            */}
            <div 
              className="fixed inset-0 z-0 opacity-[0.2] pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(71, 85, 105, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(71, 85, 105, 0.2) 1px, transparent 1px)', 
                backgroundSize: '45px 45px' 
              }}
            />
      
            {/* Elevated Ambient Glows:
               We use lighter shades (blue-600/indigo-500) but keep opacity low 
               to create "soft light" rather than "dark shadows".
            */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000">
              {/* Top Left Glow */}
              <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
              
              {/* Center Right Glow */}
              <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
              
              {/* Subtle Bottom Warmth */}
              <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-slate-400/5 blur-[150px]" />
            </div>
      
            <CartProvider>
              <FloatingCart />
              {/* Relative Z-index to ensure content sits above the glows */}
              <div className="relative z-10">
                {children}
              </div>
            </CartProvider>
      
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}