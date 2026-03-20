import React from 'react';
import { 
  ArrowLeft, Play, ShoppingCart, 
  BarChart2, DollarSign, TrendingUp, Headset,
  Box
} from 'lucide-react';

export default function ToolStaticDesign() {
  return (
    <div className="min-h-screen pt-24 pb-24 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px]"></div>
        <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-8">

        {/* --- BOTTOM SECTION: STATS & FEATURES --- */}
        <div className="max-w-5xl mx-auto">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 mb-16 border-y border-blue-900/40 relative">
            <div className="flex flex-col items-center text-center">
              <h4 className="text-3xl md:text-4xl font-black text-white mb-3">3200+</h4>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-3 opacity-50"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60">Downloads</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="text-3xl md:text-4xl font-black text-white mb-3">25+</h4>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-3 opacity-50"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60">Countries</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="text-3xl md:text-4xl font-black text-white mb-3">300+</h4>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-3 opacity-50"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60">Active Users</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <h4 className="text-3xl md:text-4xl font-black text-white mb-3">7400+</h4>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-3 opacity-50"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60">Saved Hours</p>
            </div>
          </div>

          {/* CTA Text */}
          <div className="text-center mb-16">
            <p className="text-base md:text-lg font-medium text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Don't miss out on this incredible opportunity to supercharge your team! To take advantage of this offer and sign up for a subscription, simply click on the link below:
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Feature 1: Designed to Excel */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-10 rounded-[32px] flex flex-col items-center text-center hover:border-cyan-500/30 transition-colors group shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all shadow-inner">
                <BarChart2 size={32} className="text-blue-300/80 group-hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">Designed to Excel</h4>
              <p className="text-sm text-blue-200/70 leading-loose">
                Our tools are designed with your convenience in mind. We understand that not everyone on your team may be a tekla wizard, so we've ensured that our tools are backed up with video tutorials and help file to make it user-friendly. Whether you're a seasoned pro or a newbie, you can harness the power of automation without a steep learning curve.
              </p>
            </div>

            {/* Feature 2: Unbeatable Price */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-10 rounded-[32px] flex flex-col items-center text-center hover:border-cyan-500/30 transition-colors group shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all shadow-inner">
                <DollarSign size={32} className="text-blue-300/80 group-hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">Unbeatable Price</h4>
              <p className="text-sm text-blue-200/70 leading-loose">
                We understand the importance of affordability, and that's why we're offering these game-changing tools at an unbeatable low price — just 0.80 cents monthly cost for each tool. Plus, the more licenses you need, the greater your discounts. Save big on your automation journey and watch your productivity soar.
              </p>
            </div>

            {/* Feature 3: Stay Ahead */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-10 rounded-[32px] flex flex-col items-center text-center hover:border-cyan-500/30 transition-colors group shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all shadow-inner">
                <TrendingUp size={32} className="text-blue-300/80 group-hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">Stay Ahead</h4>
              <p className="text-sm text-blue-200/70 leading-loose">
                When you sign up for a subscription, you'll gain access to all our future tools and updates at no extra cost. That's right, you'll always have the latest and greatest automation tools in your toolkit, ensuring your business remains competitive and efficient.
              </p>
            </div>

            {/* Feature 4: Support */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-10 rounded-[32px] flex flex-col items-center text-center hover:border-cyan-500/30 transition-colors group shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-[#020617] border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-all shadow-inner">
                <Headset size={32} className="text-blue-300/80 group-hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">Support</h4>
              <p className="text-sm text-blue-200/70 leading-loose">
                Our dedicated support team is here to assist you whenever you need it. We take pride in providing top-notch customer service, ensuring that you have a smooth and hassle-free experience with our automation tools. Your success is our success, and we're here to help you every step of the way.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}