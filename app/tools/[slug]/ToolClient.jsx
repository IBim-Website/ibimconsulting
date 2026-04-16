"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoriesList } from '../constants'; 
import { useCart } from '@/app/CartContext'; // Adjust import path if necessary

const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : url;
};

export default function ToolClient({ slug }) {
  const [tool, setTool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState('');
  
  // Cart Context and Button State
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        // Fetch with a higher limit so we don't miss the tool if it's not on page 1
        const response = await fetch('/api/products?limit=100&status=ACTIVE');
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to fetch data');

        const fetchedRecords = result.records || [];

        // 1. Find the record using the new Backoffice product_code
        const foundRecord = fetchedRecords.find(record => {
          const rawToolCode = record.product_code || "";
          const recordSlug = rawToolCode.toLowerCase().replace(/[_ ]+/g, '-');
          return recordSlug === slug;
        });

        if (!foundRecord) {
          throw new Error("Tool not found");
        }

        // 2. Extract GHL extra payload (already parsed by our backend fix!)
        let parsedData = foundRecord.extraPayload || {};
        if (typeof parsedData === 'string') {
            try { parsedData = JSON.parse(parsedData); } catch (e) {}
        }

        const pricingData = parsedData.pricing || {};

        let defaultPlan = '';
        if (pricingData.oneTimePrice && parseFloat(pricingData.oneTimePrice) > 0) defaultPlan = 'oneTimePrice';
        else if (pricingData.annualPrice && parseFloat(pricingData.annualPrice) > 0) defaultPlan = 'annualPrice';
        else if (pricingData.monthlyPrice && parseFloat(pricingData.monthlyPrice) > 0) defaultPlan = 'monthlyPrice';
        
        setSelectedPricing(defaultPlan);

        // 3. Extract Image safely from the new structure
        let imageUrl = "https://placehold.co/1200x800/020617/3b82f6?text=No+Image";
        if (foundRecord.image) {
            if (Array.isArray(foundRecord.image) && foundRecord.image.length > 0) {
                imageUrl = foundRecord.image[0].url;
            } else if (foundRecord.image.url) {
                imageUrl = foundRecord.image.url;
            } else if (typeof foundRecord.image === 'string') {
                imageUrl = foundRecord.image;
            }
        }

        // 4. Safely extract Description (Checking GHL first, then unpacking Backoffice JSON strings if needed)
        let finalDesc = parsedData.description;
        if (!finalDesc && foundRecord.description) {
            try {
                const parsedBoDesc = JSON.parse(foundRecord.description);
                if (Array.isArray(parsedBoDesc) && parsedBoDesc[0]?.Content) {
                    finalDesc = parsedBoDesc[0].Content.join("");
                } else {
                    finalDesc = foundRecord.description;
                }
            } catch(e) {
                finalDesc = foundRecord.description;
            }
        }

        // 5. Set Tool State
        setTool({
          id: foundRecord.product_uuid || foundRecord.id || foundRecord.product_code,
          name: foundRecord.product_name || parsedData.productName || "Unnamed Product",
          description: finalDesc || "<p>No description available.</p>",
          pricing: pricingData,
          category: parsedData.category || ["Uncategorized"],
          image: imageUrl,
          youtubeLink: parsedData.links?.youtubeLink || null,
        });

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchToolDetails();
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedPricing || !tool) return;

    let planName = "Monthly";
    if (selectedPricing === 'oneTimePrice') planName = "One-Time"; 
    if (selectedPricing === 'annualPrice') planName = "Annual";

    const cartItem = {
      id: tool.id,
      name: tool.name,
      price: parseFloat(tool.pricing[selectedPricing]),
      category: Array.isArray(tool.category) ? tool.category[0] : tool.category,
      package: planName, 
      image: tool.image,
      slug: slug,
      pricingOptions: {
        monthly: tool.pricing.monthlyPrice ? parseFloat(tool.pricing.monthlyPrice) : null,
        annual: tool.pricing.annualPrice ? parseFloat(tool.pricing.annualPrice) : null,
        oneTime: tool.pricing.oneTimePrice ? parseFloat(tool.pricing.oneTimePrice) : null,
      }
    };

    addToCart(cartItem);

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#020617] px-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
        <p className="text-blue-200/60 mb-8">
          {error === "Tool not found" 
            ? "We couldn't find the tool you're looking for." 
            : "Something went wrong loading this tool."}
        </p>
        <Link href="/tools" className="text-cyan-400 hover:text-amber-400 transition-colors border border-cyan-400/30 hover:border-amber-400/50 rounded-xl px-6 py-3 text-sm">
          &larr; Back to all tools
        </Link>
      </div>
    );
  }

  const categoryArray = Array.isArray(tool.category) ? tool.category : [tool.category];
  
  const validCategories = categoryArray.filter(cat => 
    categoriesList.some(validCat => validCat.toLowerCase() === cat.toLowerCase())
  );

  const hasMonthly = tool.pricing.monthlyPrice && parseFloat(tool.pricing.monthlyPrice) > 0;
  const hasAnnual = tool.pricing.annualPrice && parseFloat(tool.pricing.annualPrice) > 0;
  const hasOneTime = tool.pricing.oneTimePrice && parseFloat(tool.pricing.oneTimePrice) > 0;

  const prices = {
    oneTimePrice: hasOneTime ? parseFloat(tool.pricing.oneTimePrice) : 0,
    annualPrice: hasAnnual ? parseFloat(tool.pricing.annualPrice) : 0,
    monthlyPrice: hasMonthly ? parseFloat(tool.pricing.monthlyPrice) : 0,
  };

  let highestPriceKey = '';
  let maxPrice = 0;
  Object.entries(prices).forEach(([key, val]) => {
    if (val > maxPrice) {
      maxPrice = val;
      highestPriceKey = key;
    }
  });

  const getWrapperClasses = (planKey) => {
    const isSelected = selectedPricing === planKey;
    const isHighest = highestPriceKey === planKey;
    let base = "flex-1 flex flex-col items-start justify-between p-3 rounded-xl border text-left transition-all duration-300 outline-none relative overflow-hidden group ";

    if (isHighest) {
      return base + (isSelected
        ? 'border-amber-400 bg-gradient-to-br from-amber-900/40 to-[#020617]/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
        : 'border-amber-500/40 bg-gradient-to-br from-amber-900/10 to-[#020617]/60 hover:border-amber-400/80 hover:bg-amber-900/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]');
    }
    return base + (isSelected
      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
      : 'border-blue-900/50 bg-[#020617]/60 hover:bg-blue-900/20 hover:border-blue-700/50');
  };

  const getRadioClasses = (planKey) => {
    const isSelected = selectedPricing === planKey;
    const isHighest = highestPriceKey === planKey;

    if (isHighest) {
      return {
        outer: isSelected ? 'border-amber-400' : 'border-amber-600/60',
        inner: isSelected ? 'bg-amber-400 opacity-100' : 'bg-amber-400 opacity-0'
      };
    }
    return {
      outer: isSelected ? 'border-cyan-400' : 'border-blue-700/80',
      inner: isSelected ? 'bg-cyan-400 opacity-100' : 'bg-cyan-400 opacity-0'
    };
  };

  const getTextClasses = (planKey) => {
    const isSelected = selectedPricing === planKey;
    const isHighest = highestPriceKey === planKey;

    if (isHighest) {
      return {
        title: isSelected ? 'text-amber-300' : 'text-amber-300/70',
        price: isSelected ? 'text-white' : 'text-amber-100/90'
      };
    }
    return {
      title: isSelected ? 'text-cyan-300' : 'text-blue-300/70',
      price: isSelected ? 'text-white' : 'text-blue-100/80'
    };
  };

  return (
    <>
      <div className="h-screen bg-[#020617] text-white py-6 px-4 lg:px-8 flex flex-col overflow-hidden font-sans">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col h-full">
          
          <div className="shrink-0 mb-4">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400/70 hover:text-cyan-400 transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Tools
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            
            {/* LEFT SIDE: Header + Image + Action Box */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-h-0">
              
              <div className="bg-[#0A1025]/80 rounded-2xl border border-blue-900/50 p-5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col gap-5 shrink-0">
                
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {validCategories.map((cat, idx) => (
                        <span key={idx} className="text-[9px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 uppercase tracking-widest font-bold rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-300 leading-tight">
                    {tool.name}
                  </h1>
                </div>

                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 border border-blue-900/30 flex items-center justify-center group/image">
                  <img 
                    src={tool.image} 
                    alt={tool.name} 
                    className="w-full h-full object-contain opacity-90 p-2 transition-opacity duration-300 group-hover/image:opacity-75"
                  />
                  
                  {/* Centered Play Button Overlay */}
                  {tool.youtubeLink && (
                    <button
                      onClick={() => setActiveVideo(tool.youtubeLink)}
                      className="absolute z-20 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#020617]/70 text-cyan-400 hover:text-white hover:bg-cyan-500 border border-cyan-500/50 backdrop-blur-md transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-110 group/play"
                      aria-label="Play Demo Video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 ml-1.5 transition-transform duration-300 group-hover/play:scale-105">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Box */}
              <div className="bg-[#0A1025]/40 rounded-2xl border border-blue-900/30 p-5 flex flex-col gap-4 shrink-0">
                
                <div className="flex flex-row gap-2">
                  {hasOneTime && (
                    <button 
                      onClick={() => setSelectedPricing('oneTimePrice')}
                      className={getWrapperClasses('oneTimePrice')}
                    >
                      {highestPriceKey === 'oneTimePrice' && (
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/20 blur-xl rounded-full pointer-events-none"></div>
                      )}
                      <div className="flex items-center gap-2 mb-2 w-full z-10">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${getRadioClasses('oneTimePrice').outer}`}>
                          <div className={`w-1.5 h-1.5 rounded-full transition-opacity ${getRadioClasses('oneTimePrice').inner}`}></div>
                        </div>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold truncate transition-colors ${getTextClasses('oneTimePrice').title}`}>
                          Lifetime
                        </p>
                      </div>
                      <p className={`text-lg font-extrabold transition-colors z-10 ${getTextClasses('oneTimePrice').price}`}>
                        ${tool.pricing.oneTimePrice}
                      </p>
                    </button>
                  )}

                  {hasAnnual && (
                    <button 
                      onClick={() => setSelectedPricing('annualPrice')}
                      className={getWrapperClasses('annualPrice')}
                    >
                      {highestPriceKey === 'annualPrice' && (
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/20 blur-xl rounded-full pointer-events-none"></div>
                      )}
                      <div className="flex items-center gap-2 mb-2 w-full z-10">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${getRadioClasses('annualPrice').outer}`}>
                          <div className={`w-1.5 h-1.5 rounded-full transition-opacity ${getRadioClasses('annualPrice').inner}`}></div>
                        </div>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold truncate transition-colors ${getTextClasses('annualPrice').title}`}>
                          Annual
                        </p>
                      </div>
                      <p className={`text-lg font-bold transition-colors z-10 ${getTextClasses('annualPrice').price}`}>
                        ${tool.pricing.annualPrice} <span className="text-[10px] font-normal opacity-70">/yr</span>
                      </p>
                    </button>
                  )}

                  {hasMonthly && (
                    <button 
                      onClick={() => setSelectedPricing('monthlyPrice')}
                      className={getWrapperClasses('monthlyPrice')}
                    >
                      {highestPriceKey === 'monthlyPrice' && (
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/20 blur-xl rounded-full pointer-events-none"></div>
                      )}
                      <div className="flex items-center gap-2 mb-2 w-full z-10">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${getRadioClasses('monthlyPrice').outer}`}>
                          <div className={`w-1.5 h-1.5 rounded-full transition-opacity ${getRadioClasses('monthlyPrice').inner}`}></div>
                        </div>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold truncate transition-colors ${getTextClasses('monthlyPrice').title}`}>
                          Monthly
                        </p>
                      </div>
                      <p className={`text-lg font-bold transition-colors z-10 ${getTextClasses('monthlyPrice').price}`}>
                        ${tool.pricing.monthlyPrice} <span className="text-[10px] font-normal opacity-70">/mo</span>
                      </p>
                    </button>
                  )}
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedPricing || isAdded}
                  className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:cursor-not-allowed disabled:shadow-none
                    ${isAdded 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-none scale-100' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white active:scale-95 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 border border-transparent'
                    }
                  `}
                >
                  {isAdded ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                      Add to cart
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RIGHT SIDE: Spacious Description Box */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto bg-[#0A1025]/40 rounded-2xl border border-blue-900/30 p-8 lg:p-10 min-h-0 prose-invert scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
                
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 border-b border-blue-900/40 pb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-500">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                  </svg>
                  Product Overview
                </h2>
                
                <div 
                  className="prose prose-invert prose-blue max-w-none text-[15px] leading-loose tracking-wide 
                             prose-p:text-blue-100/80 prose-p:mb-6 
                             prose-headings:text-white prose-headings:mt-10 prose-headings:mb-5 
                             prose-strong:text-cyan-300 
                             prose-li:text-blue-100/80 prose-li:mb-3 
                             prose-ul:mb-8 prose-ol:mb-8 
                             prose-a:text-amber-400 hover:prose-a:text-amber-300"
                  dangerouslySetInnerHTML={{ __html: tool.description }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 sm:p-6 transition-opacity duration-300 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setActiveVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-[0_20px_50px_-10px_rgba(34,211,238,0.3)] border border-cyan-500/30 overflow-hidden animate-in zoom-in-95 duration-300 z-10">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-[#0A1025]/80 hover:bg-cyan-600 text-white rounded-full transition-colors duration-300 border border-blue-800/50 hover:border-cyan-400 backdrop-blur-sm group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={getEmbedUrl(activeVideo)}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}