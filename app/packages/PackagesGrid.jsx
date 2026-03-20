"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Check, Youtube, Package, X, Search, Loader2, ShoppingCart } from 'lucide-react';
// 1. Import the useCart hook
import { useCart } from '@/app/CartContext';

const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
};

export default function PackagesGrid({ isMounted = true }) {
  // 2. Initialize Cart Context
  const { addToCart, cart } = useCart();
  
  const [packages, setPackages] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if current selected bundle is already in cart
  const isInCart = useMemo(() => {
    return selectedBundle && cart.some(item => item.id === selectedBundle.id);
  }, [selectedBundle, cart]);

  useEffect(() => {
    if (selectedBundle || activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedBundle, activeVideo]);

  useEffect(() => {
    const fetchPackages = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const response = await fetch(`/api/packages?page=${page}&limit=12`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to fetch packages');

        const mappedPackages = (result.records || []).map(record => {
          let parsedData = {};
          try { parsedData = JSON.parse(record.properties.data || "{}"); } catch (e) {}
          return {
            id: record.id,
            name: parsedData.packageName || "Unnamed Package",
            price: parseFloat(parsedData.packagePrice || 0),
            groupType: parsedData.groupType || "General",
            products: Array.isArray(parsedData.products) ? parsedData.products : [],
            packageInfo: Array.isArray(parsedData.packageInfo) ? parsedData.packageInfo : [],
            youtubeLink: parsedData.youtubeLink || null,
            slug: (record.properties.package_code || "").toLowerCase().replace(/[_ ]+/g, '-')
          };
        });

        setPackages(prev => page === 1 ? mappedPackages : [...prev, ...mappedPackages]);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };
    fetchPackages();
  }, [page]);

  const fetchProducts = async () => {
    if (allProducts.length > 0) return;
    setIsProductsLoading(true);
    try {
      const response = await fetch('/api/products?limit=100');
      const result = await response.json();
      if (result.success) {
        const mapped = result.records.map(r => {
          let pData = {};
          try { pData = JSON.parse(r.properties.data || "{}"); } catch(e){}
          return {
            id: r.id,
            toolCode: r.properties.tool_code,
            name: pData.productName || "Unknown Tool",
            image: r.properties.image?.[0]?.url || null,
          };
        });
        setAllProducts(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handleViewBundle = (pkg) => {
    setSelectedBundle(pkg);
    fetchProducts();
  };

  const groupedPackages = useMemo(() => {
    const filtered = packages.filter(pkg => 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.reduce((acc, pkg) => {
      const group = pkg.groupType;
      if (!acc[group]) acc[group] = [];
      acc[group].push(pkg);
      return acc;
    }, {});
  }, [packages, searchQuery]);

  const bundleItems = useMemo(() => {
    if (!selectedBundle || allProducts.length === 0) return [];
    return allProducts.filter(product => 
      selectedBundle.products.some(p => 
        (typeof p === 'string' && (p === product.toolCode || p === product.name)) ||
        (p.tool_code === product.toolCode || p.name === product.name)
      )
    );
  }, [selectedBundle, allProducts]);

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8 pb-24">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col items-center mb-16 text-center pt-12">
        <h2 className="text-4xl font-extrabold text-white mb-6 drop-shadow-xl">Exploration Bundles</h2>
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search all packages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-[#0A1025]/80 pl-12 pr-4 py-4 text-white border border-emerald-900/50 focus:border-emerald-500/50 focus:outline-none backdrop-blur-xl transition-all"
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && page === 1 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
      ) : (
        <div className="space-y-20">
          {Object.entries(groupedPackages).map(([groupName, groupItems]) => (
            <section key={groupName} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/30 px-4 py-1.5 rounded-lg border border-emerald-800/30">
                  {groupName}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-800/50 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupItems.map((pkg) => (
                  <div key={pkg.id} className="group relative flex flex-col justify-between rounded-3xl bg-[#0A1025]/90 p-5 border border-emerald-900/30 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-1 shadow-xl">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400"><Package size={20} /></div>
                        {pkg.youtubeLink && (
                          <button onClick={() => setActiveVideo(pkg.youtubeLink)} className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg">
                            <Youtube size={16} />
                          </button>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">{pkg.name}</h4>
                    </div>

                    <div className="space-y-2 mb-6 opacity-80">
                      {pkg.products.slice(0, 3).map((prod, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-blue-100/70">
                          <Check size={12} className="text-emerald-500" />
                          <span className="truncate">{prod.name || prod}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-emerald-900/30">
                      <span className="text-lg font-bold text-white">${pkg.price.toFixed(2)}</span>
                      <button 
                        onClick={() => handleViewBundle(pkg)}
                        className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        View Bundle →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!isLoadingMore && hasMore && (
        <div className="mt-20 flex justify-center">
          <button onClick={() => setPage(p => p + 1)} className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 font-bold transition-all shadow-lg shadow-emerald-900/20">
            Load More Bundles
          </button>
        </div>
      )}

      {/* 1. BUNDLE PRODUCTS MODAL */}
      {selectedBundle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={() => setSelectedBundle(null)}></div>
          
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0A1025] rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-emerald-900/30 flex justify-between items-center bg-emerald-950/10">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedBundle.name}</h3>
                <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest mt-1">Bundle Components</p>
              </div>
              <button onClick={() => setSelectedBundle(null)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {isProductsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-emerald-500 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-sm font-bold uppercase tracking-widest">Verifying Tools...</span>
                </div>
              ) : bundleItems.length > 0 ? (
                bundleItems.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-emerald-900/50">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-900 bg-emerald-900/10"><Package size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-white text-lg leading-tight">{product.name}</h5>
                      <code className="text-[10px] text-emerald-500/70 font-mono mt-1 block">{product.toolCode}</code>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500"><Check size={18} /></div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-blue-200/50">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No product details found for this selection.</p>
                </div>
              )}
            </div>

            {/* Footer - Updated Button Logic */}
            <div className="p-6 border-t border-emerald-900/30 bg-emerald-950/20 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-emerald-500/60 font-bold">Total Price</span>
                <span className="text-3xl font-black text-white">${selectedBundle.price.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => {
                  if (!isInCart) {
                    addToCart(selectedBundle);
                  }
                }}
                disabled={isInCart}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                  isInCart 
                  ? "bg-emerald-900/50 text-emerald-400 cursor-default border border-emerald-500/30" 
                  : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-900/20"
                }`}
              >
                {isInCart ? (
                  <>
                    <Check size={18} />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIDEO DEMO MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setActiveVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={getEmbedUrl(activeVideo)}
              title="Demo Video"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}