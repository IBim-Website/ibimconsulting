"use client";

import React, { useState } from 'react';
import { Star, User, Quote } from 'lucide-react';

const testimonialsData = [
  {
    id: 1,
    name: "Damian Watson",
    company: "Connex Group",
    image: "https://ibimconsulting.com.au/testimonial-image/1698665654.png",
    text: "Having implemented some of IBIM's Teklas custom components and utilised their expertise to develop a number of API programs...",
    fullText: "Having implemented some of IBIM's Teklas custom components and utilised their expertise to develop a number of API programs for Tekla, I've been impressed by the results. The automation tools, particularly the ones tailored to our workflow, have drastically reduced our detailing time and improved overall accuracy across the board."
  },
  {
    id: 2,
    name: "Anthony Toppenberg",
    company: "Naturform",
    image: "https://ibimconsulting.com.au/testimonial-image/1698665638.png",
    text: "I first met Sriram in 2014 when he was conducting Tekla training and we continued our relationship through his Tekla support...",
    fullText: "I first met Sriram in 2014 when he was conducting Tekla training and we continued our relationship through his Tekla support role in Building Point and now with IBIM Consulting. Over this time, Sriram has consistently provided top-tier support and innovative tools that keep our team operating at peak efficiency."
  },
  {
    id: 3,
    name: "Colin Parkes",
    company: "Current Engineering",
    image: "https://ibimconsulting.com.au/testimonial-image/1698665521.png",
    text: "Sriram and his team have developed many tools that I use daily. Tube angle gusset, Panel clip to column and Ferrules at bolt...",
    fullText: "Sriram and his team have developed many tools that I use daily. Tube angle gusset, Panel clip to column and Ferrules at bolt location are three of my favourite tools. These three tools alone save me hours of repetitive work each week, allowing me to focus on the more complex aspects of our engineering projects."
  },
  {
    id: 4,
    name: "Bill Fisher",
    company: "TekSteel",
    image: "https://ibimconsulting.com.au/web-icon/user.jpg",
    text: "I have been looking for good apps and found the ones from Sriram to fit my needs perfectly. As most of my work is residential...",
    fullText: "I have been looking for good apps and found the ones from Sriram to fit my needs perfectly. As most of my work is residential these apps have saved me a great deal of time and are simple to use. Setting them up is intuitive, and the output quality is fantastic."
  }
];

export default function TestimonialsSection() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="relative w-full py-24 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-[100%] blur-[120px] pointer-events-none"></div>
      
      {/* Container widened to 1400px to accommodate 4 columns comfortably */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-md">
            Don't just take our word for it!
          </h2>
          <p className="text-base md:text-lg text-blue-200/70 font-medium">
            Join the industry leaders who are already optimizing their workflows with IBIM.
          </p>
        </div>

        {/* Updated Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {testimonialsData.map((testimonial, index) => {
            const isExpanded = expandedId === testimonial.id;
            
            return (
              <div 
                key={testimonial.id}
                style={{ transitionDelay: `${index * 100}ms` }}
                className="bg-[#0A1025]/80 border border-blue-900/40 p-6 rounded-3xl hover:border-cyan-500/30 transition-all duration-500 group shadow-lg relative backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 flex flex-col h-full"
              >
                {/* Decorative Quote Icon - reduced size for 4-column fit */}
                <Quote className="absolute top-4 right-4 text-blue-800/20 w-8 h-8 rotate-180 pointer-events-none group-hover:text-cyan-500/10 transition-colors duration-500" />
                
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-950/50 border border-blue-800/50 flex items-center justify-center shrink-0">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-blue-400/50 w-5 h-5" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-white font-bold text-sm lg:text-base leading-tight">
                      {testimonial.name}
                    </h4>
                    <div className="flex items-center gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-blue-300/50 font-semibold">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Testimonial Text */}
                <div className="relative z-10 flex-grow">
                  <p className="text-sm text-blue-100/80 leading-relaxed">
                    {isExpanded ? testimonial.fullText : testimonial.text}
                  </p>
                </div>

                {/* Toggle Button */}
                <div className="mt-4 pt-4 border-t border-blue-900/30 relative z-10">
                  <button 
                    onClick={() => toggleExpand(testimonial.id)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors uppercase tracking-widest"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}