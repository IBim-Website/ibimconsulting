"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Check,
  Youtube,
  Package,
  X,
  Search,
  Loader2,
  ShoppingCart,
  ChevronLeft,
  Download,
} from "lucide-react";
import { useCart } from "@/app/CartContext";

const getEmbedUrl = (url) => {
  if (!url) return "";
  let videoId = "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
};

export default function PackagesGrid({ isMounted = true }) {
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

  const isInCart = useMemo(() => {
    return selectedBundle && cart.some((item) => item.id === selectedBundle.id);
  }, [selectedBundle, cart]);

  useEffect(() => {
    if (selectedBundle || activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedBundle, activeVideo]);

  // FETCH PACKAGES
  useEffect(() => {
    const fetchPackages = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const response = await fetch(
          `/api/packages?page=${page}&limit=1000&status=AVAILABLE`,
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Failed to fetch packages");

        const mappedPackages = (result.records || []).map((record) => {
          const pricing = record.pricing || {};
          const monthly = parseFloat(pricing.monthlyPrice) || 0;
          const annual = parseFloat(pricing.annualPrice) || 0;
          const oneTime = parseFloat(pricing.oneTimePrice) || 0;
          const floating = parseFloat(pricing.floatingPrice) || 0;

          let defaultPrice = 0;
          let defaultPlan = "Monthly";
          if (oneTime > 0) {
            defaultPrice = oneTime;
            defaultPlan = "One-Time";
          } else if (monthly > 0) {
            defaultPrice = monthly;
            defaultPlan = "Monthly";
          } else if (annual > 0) {
            defaultPrice = annual;
            defaultPlan = "Annual";
          } else if (floating > 0) {
            defaultPrice = floating;
            defaultPlan = "Floating";
          }

          return {
            id: record.package_uuid,
            name:
              record.package_name || record.packageName || "Unnamed Package",
            price: defaultPrice,
            defaultPlan: defaultPlan,
            pricingOptions: {
              monthly: monthly > 0 ? monthly : null,
              annual: annual > 0 ? annual : null,
              oneTime: oneTime > 0 ? oneTime : null,
              floating: floating > 0 ? floating : null,
            },
            groupType: record.groupType || "General",
            products: Array.isArray(record.product_codes)
              ? record.product_codes
              : [],
            packageInfo: Array.isArray(record.packageInfo)
              ? record.packageInfo
              : typeof record.packageInfo === "string"
                ? record.packageInfo.split(",").map((s) => s.trim())
                : [],
            youtubeLink: record.youtubeLink || null,
            slug: (record.package_code || "unnamed")
              .toLowerCase()
              .replace(/[_ ]+/g, "-"),
          };
        });
        mappedPackages.sort((a, b) => a.name.localeCompare(b.name));
        setPackages((prev) =>
          page === 1 ? mappedPackages : [...prev, ...mappedPackages],
        );
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

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    if (allProducts.length > 0) return;
    setIsProductsLoading(true);
    try {
      const response = await fetch("/api/products?limit=1000");
      const result = await response.json();
      if (result.success && result.records) {
        const mapped = result.records.map((r) => {
          return {
            id: r.product_uuid || r.product_code || r.id,
            toolCode: r.product_code,
            name: r.product_name || "Unknown Tool",
            image: r.image?.[0]?.url || null,
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

  const updatePackagePlan = (pkgId, newPlan) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg) => {
        if (pkg.id === pkgId) {
          let newPrice = pkg.price;
          if (newPlan === "Monthly") newPrice = pkg.pricingOptions.monthly;
          if (newPlan === "Annual") newPrice = pkg.pricingOptions.annual;
          if (newPlan === "One-Time") newPrice = pkg.pricingOptions.oneTime;
          if (newPlan === "Floating") newPrice = pkg.pricingOptions.floating;

          return { ...pkg, defaultPlan: newPlan, price: newPrice };
        }
        return pkg;
      }),
    );

    if (selectedBundle && selectedBundle.id === pkgId) {
      setSelectedBundle((prev) => {
        let newPrice = prev.price;
        if (newPlan === "Monthly") newPrice = prev.pricingOptions.monthly;
        if (newPlan === "Annual") newPrice = prev.pricingOptions.annual;
        if (newPlan === "One-Time") newPrice = prev.pricingOptions.oneTime;
        if (newPlan === "Floating") newPrice = prev.pricingOptions.floating;

        return { ...prev, defaultPlan: newPlan, price: newPrice };
      });
    }
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [packages, searchQuery]);

  const bundleItems = useMemo(() => {
    if (!selectedBundle || allProducts.length === 0) return [];
    return allProducts.filter((product) =>
      selectedBundle.products.some(
        (p) => p === product.toolCode || p === product.name,
      ),
    );
  }, [selectedBundle, allProducts]);

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8 pb-24">
      {/* Go to Tools Button */}
      <div className="absolute top-8 left-6 md:left-12 z-50">
        <a
          href="/tools"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/40 border border-blue-800/30 text-blue-200/70 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-300 backdrop-blur-md"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-semibold tracking-wide">
            Go to Tools
          </span>
        </a>
      </div>

      {/* HEADER & SEARCH */}
      <div className="flex flex-col items-center mb-4 text-center pt-12">
        {/* <div className="inline-flex items-center gap-3 px-5 py-2.5 ml-10 rounded-full bg-blue-950/40 border border-blue-500/20 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-cyan-500 to-blue-500"></span>
          </span>
          <span>
            Imperial & Metric Supported . Tekla Version 2022 And Above
          </span>
        </div> */}

        <h2 className="text-4xl font-extrabold text-white drop-shadow-xl">
          Explore Packages{" "}
        </h2>

        {/* NEW PRESENTATION BUTTON */}
        <div className="flex items-center text-center pt-12">
          <a
            href="https://workdrive.zoho.com.au/file/s2pql5906f2176cd74e5eae7066c1b8abf440"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-2.5 ml-10 rounded-full bg-blue-950/40 border border-blue-500/20 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          >
            <Download
              size={18}
              className="group-hover:-translate-y-1 transition-transform"
            />
            <span className="text-sm font-bold tracking-wide text-cyan-300">
              Download Automation Tools Document
            </span>
          </a>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 ml-10 rounded-full bg-blue-950/40 border border-blue-500/20 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            {/* <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-cyan-500 to-blue-500"></span>
            </span> */}
            <span className="text-sm font-bold tracking-wide">
              Imperial & Metric Supported . Tekla Version 2022 And Above
            </span>
          </div>
        </div>
        {/* NEW ROI BUTTON */}
        {/* <a
          href="https://claude.ai/public/artifacts/f4d548c2-8e96-414a-91b1-d00ddafb5ae4"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 group flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-800/40 hover:text-emerald-200 hover:border-emerald-400/60 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        >
          <Download
            size={22}
            className="group-hover:-translate-y-1 transition-transform"
          />
          <span className="text-sm font-bold tracking-wide">
            Your Time And Cost Savings Calculator
          </span>
        </a> */}

        {/* <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search all packages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-[#0A1025]/80 pl-12 pr-4 py-4 text-white border border-emerald-900/50 focus:border-emerald-500/50 focus:outline-none backdrop-blur-xl transition-all"
          />
        </div> */}
      </div>

      {/* ERROR STATE */}
      {error && !isLoading && (
        <div className="py-6 mb-8 flex flex-col items-center justify-center text-red-400 bg-red-950/20 rounded-2xl border border-red-900/40 backdrop-blur-sm">
          <p className="font-medium">Failed to load packages.</p>
          <p className="text-sm opacity-60 mt-1">{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && page === 1 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-wrap justify-center gap-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-[#0A1025]/90 p-5 border border-emerald-900/30 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-1 shadow-xl w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <Package size={20} />
                    </div>
                    {pkg.youtubeLink && (
                      <button
                        onClick={() => setActiveVideo(pkg.youtubeLink)}
                        className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      >
                        <Youtube size={16} />
                      </button>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                    {pkg.name}
                  </h4>
                </div>

                <div className="space-y-2 mb-6 opacity-80">
                  {pkg.products.slice(0, 3).map((prod, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-blue-100/70"
                    >
                      <Check size={12} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{prod}</span>
                    </div>
                  ))}
                  {pkg.products.length > 3 && (
                    <div className="text-[11px] font-medium text-emerald-500/80 pt-1 pl-1">
                      + {pkg.products.length - 3} more tools included
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-900/30">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-xl font-bold text-white">
                      AU${pkg.price.toFixed(2)}
                    </span>
                    <select
                      value={pkg.defaultPlan}
                      onChange={(e) =>
                        updatePackagePlan(pkg.id, e.target.value)
                      }
                      className="bg-[#020617] text-emerald-400 text-[10px] uppercase font-bold tracking-wider border border-emerald-900/50 rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer hover:bg-[#0c1a28] transition-colors"
                    >
                      {pkg.pricingOptions.monthly && (
                        <option value="Monthly">Monthly</option>
                      )}
                      {pkg.pricingOptions.annual && (
                        <option value="Annual">Annual</option>
                      )}
                      {pkg.pricingOptions.oneTime && (
                        <option value="One-Time">One-Time</option>
                      )}
                      {pkg.pricingOptions.floating && (
                        <option value="Floating">Floating</option>
                      )}
                    </select>
                  </div>
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
        </div>
      )}

      {/* 1. BUNDLE PRODUCTS MODAL */}
      {selectedBundle && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            onClick={() => setSelectedBundle(null)}
          ></div>

          <div className="relative w-[95vw] max-w-[1400px] max-h-[85vh] bg-[#0A1025] rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-emerald-900/30 flex justify-between items-center bg-emerald-950/10">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedBundle.name}
                </h3>
                <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest mt-1">
                  Bundle Components
                </p>
              </div>
              <button
                onClick={() => setSelectedBundle(null)}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isProductsLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-emerald-500 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Verifying Tools...
                  </span>
                </div>
              ) : bundleItems.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {bundleItems.map((product) => (
                    <div
                      key={product.id}
                      className="w-28 sm:w-32 flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-xl overflow-hidden bg-black border border-emerald-900/50 shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-900 bg-emerald-900/10">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <h5 className="font-bold text-white text-xs sm:text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h5>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 h-full flex flex-col justify-center items-center text-blue-200/50">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p>No product details found for this selection.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-emerald-900/30 bg-emerald-950/20 flex justify-between items-center">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] uppercase text-emerald-500/60 font-bold">
                  Select Plan
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    AU${selectedBundle.price.toFixed(2)}
                  </span>
                  <select
                    value={selectedBundle.defaultPlan}
                    onChange={(e) =>
                      updatePackagePlan(selectedBundle.id, e.target.value)
                    }
                    className="bg-[#0A1025] text-emerald-400 text-[11px] uppercase font-bold tracking-wider border border-emerald-500/30 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {selectedBundle.pricingOptions.monthly && (
                      <option value="Monthly">Monthly</option>
                    )}
                    {selectedBundle.pricingOptions.annual && (
                      <option value="Annual">Annual</option>
                    )}
                    {selectedBundle.pricingOptions.oneTime && (
                      <option value="One-Time">One-Time</option>
                    )}
                    {selectedBundle.pricingOptions.floating && (
                      <option value="Floating">Floating</option>
                    )}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isInCart) {
                    addToCart({
                      id: selectedBundle.id,
                      name: selectedBundle.name,
                      price: selectedBundle.price,
                      package: selectedBundle.defaultPlan,
                      pricingOptions: selectedBundle.pricingOptions,
                      groupType: selectedBundle.groupType,
                      products: selectedBundle.products,
                      slug: selectedBundle.slug,
                    });
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
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            onClick={() => setActiveVideo(null)}
          ></div>
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
