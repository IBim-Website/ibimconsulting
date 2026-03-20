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
          {/* Background: #060b1a is the mathematical "middle" between your two previous versions.
            It feels deep and expensive without being pitch black.
          */}
          <main className="min-h-screen bg-[#060b1a] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-100 pb-24 overflow-hidden relative">
            
            {/* Technical Grid: 
              Refined to 0.1 opacity so it's a "whisper" of a grid.
            */}
            <div 
              className="fixed inset-0 z-0 opacity-[0.1] pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}
            />
      
            {/* Ambient Lighting: 
              We've tightened the blur and lowered the intensity so the 
              background has "volume" without looking like a disco.
            */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000">
              {/* Soft Blue Top Glow */}
              <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
              
              {/* Very Subtle Indigo Center */}
              <div className="absolute top-[15%] -right-[15%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[140px] mix-blend-screen" />
              
              {/* Muted Amber Bottom - lowered to 5% opacity for just a hint of warmth */}
              <div className="absolute bottom-[-30%] left-[15%] w-[50%] h-[50%] rounded-full bg-amber-900/5 blur-[160px] mix-blend-screen" />
            </div>
      
            <CartProvider>
              <FloatingCart />
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