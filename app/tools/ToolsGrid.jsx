"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesList, packagesList } from "./constants";
import { useCart } from "@/app/CartContext"; // Added cart context import
import { ReceiptTurkishLira } from "lucide-react";

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

export default function ToolsGrid({ isMounted }) {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // API Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPackage, setSelectedPackage] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);

  // Cart Context & UI State mapping for individual tools
  const { addToCart } = useCart();
  const [addedTools, setAddedTools] = useState({});

  useEffect(() => {
    const fetchTools = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const response = await fetch(
          `/api/products?page=${page}&limit=100&status=ACTIVE`,
        );
        const result = await response.json();

        if (!response.ok)
          throw new Error(result.error || "Failed to fetch tools");

        const fetchedRecords = result.records || [];
        console.log(fetchedRecords);
        fetchedRecords.sort((a, b) =>
          a.product_name.localeCompare(b.product_name),
        );
        const mappedTools = fetchedRecords.map((record) => {
          let parsedData = record.extraPayload || {};
          if (typeof parsedData === "string") {
            try {
              parsedData = JSON.parse(parsedData);
            } catch (e) {}
          }

          const rawToolCode = record.product_code || "unnamed-tool";
          const formattedSlug = rawToolCode
            .toLowerCase()
            .replace(/[_ ]+/g, "-");

          let imageUrl =
            "https://placehold.co/600x400/020617/3b82f6?text=No+Image";
          if (record.image) {
            if (Array.isArray(record.image) && record.image.length > 0) {
              imageUrl = record.image[0].url;
            } else if (record.image.url) {
              imageUrl = record.image.url;
            } else if (typeof record.image === "string") {
              imageUrl = record.image;
            }
          }

          return {
            id: record.product_uuid || record.id || rawToolCode,
            name:
              record.product_name ||
              parsedData.productName ||
              "Unnamed Product",
            price: parseFloat(
              parsedData.pricing?.monthlyPrice ||
                parsedData.pricing?.annualPrice ||
                0,
            ),
            category: parsedData.category || "Uncategorized",
            package: parsedData.subCategory || "None",
            image: imageUrl,
            youtubeLink: parsedData.links?.youtubeLink || null,
            slug: formattedSlug,
            rawPricing: parsedData.pricing || {}, // Stored for cart accuracy
            url: parsedData.links?.downloadUrl || 'https://ibim-production.s3.us-east-1.amazonaws.com/products/Arrange_View_2.0.zip'
          };
        });

        if (page === 1) {
          setTools(mappedTools);
        } else {
          setTools((prev) => {
            const newTools = mappedTools.filter(
              (mt) => !prev.some((pt) => pt.id === mt.id),
            );
            return [...prev, ...newTools];
          });
        }

        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Error loading tools:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchTools();
  }, [page]);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const catArray = Array.isArray(tool.category)
      ? tool.category
      : [tool.category || "Uncategorized"];
    const matchesCategory =
      selectedCategory === "All" || selectedCategory === "All Tools"
        ? true
        : catArray.some(
            (c) => c.toLowerCase() === selectedCategory.toLowerCase(),
          );
    const pkgArray = Array.isArray(tool.package)
      ? tool.package
      : [tool.package || "None"];
    const matchesPackage =
      selectedPackage === "All" || selectedPackage === "All Tools"
        ? true
        : pkgArray.some(
            (p) => p.toLowerCase() === selectedPackage.toLowerCase(),
          );
    if (searchQuery === "") {
      return matchesCategory && matchesPackage;
    } else {
      return matchesSearch;
    }
    return matchesSearch && matchesCategory && matchesPackage;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPackage("All");
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleAddToCart = (e, tool) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding to cart:", tool);

    // Replicate default plan selection from ToolClient
    let planName = "Monthly";
    let priceToUse = tool.price;

    if (
      tool.rawPricing.monthlyPrice &&
      parseFloat(tool.rawPricing.monthlyPrice) > 0
    ) {
      planName = "Monthly";
      priceToUse = parseFloat(tool.rawPricing.monthlyPrice);
    } else if (
      tool.rawPricing.annualPrice &&
      parseFloat(tool.rawPricing.annualPrice) > 0
    ) {
      planName = "Annual";
      priceToUse = parseFloat(tool.rawPricing.annualPrice);
    } else if (
      tool.rawPricing.oneTimePrice &&
      parseFloat(tool.rawPricing.oneTimePrice) > 0
    ) {
      planName = "One-Time";
      priceToUse = parseFloat(tool.rawPricing.oneTimePrice);
    } else {
      planName = tool.package || "None";
    }

    const cartItem = {
      id: tool.id,
      name: tool.name,
      price: priceToUse,
      category: Array.isArray(tool.category) ? tool.category[0] : tool.category,
      package: planName,
      image: tool.image,
      slug: tool.slug,
      url:tool.url,
      pricingOptions: {
        monthly: tool.rawPricing.monthlyPrice
          ? parseFloat(tool.rawPricing.monthlyPrice)
          : null,
        annual: tool.rawPricing.annualPrice
          ? parseFloat(tool.rawPricing.annualPrice)
          : null,
        oneTime: tool.rawPricing.oneTimePrice
          ? parseFloat(tool.rawPricing.oneTimePrice)
          : null,
      },
    };

    addToCart(cartItem);

    // Track state by tool ID so only the clicked button changes
    setAddedTools((prev) => ({ ...prev, [tool.id]: true }));
    setTimeout(() => {
      setAddedTools((prev) => ({ ...prev, [tool.id]: false }));
    }, 2000);
  };

  return (
    <>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row-reverse gap-8 mb-24 items-start">
          <aside
            className={`w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-24 rounded-3xl border border-blue-900/50 bg-[#0A1025]/80 p-6 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-20 transition-all duration-1000 delay-300 ${
              isMounted
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white drop-shadow-md">
                Filters
              </h3>
              <button
                onClick={handleClearFilters}
                className="group flex items-center gap-1.5 text-xs font-medium text-blue-400/60 hover:text-amber-400 transition-colors duration-300 outline-none"
              >
                <span className="relative overflow-hidden">
                  <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                    Clear All
                  </span>
                  <span className="block absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-amber-400">
                    Clear All
                  </span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-8 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-blue-400/80 group-focus-within:text-cyan-400 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-[#020617]/80 pl-11 pr-4 py-3 text-sm text-white border border-blue-800/50 focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-blue-200/30 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="mb-8">
              <h3 className="text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-4">
                Categories
              </h3>
              <div className="space-y-3">
                {categoriesList.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-blue-700/80 bg-[#020617] group-hover:border-cyan-400 transition-colors duration-300">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="peer sr-only"
                      />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-50 peer-checked:scale-100"></div>
                    </div>
                    <span
                      className={`text-sm transition-colors duration-300 ${selectedCategory === cat ? "text-cyan-300 font-medium" : "text-blue-200/80 group-hover:text-blue-100"}`}
                    >
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <div
              className={`flex items-center justify-between mb-8 px-2 border-b border-blue-900/30 pb-4 transition-all duration-1000 delay-200 ${isMounted ? "opacity-100" : "opacity-0"}`}
            >
              <h2 className="text-2xl font-bold text-white drop-shadow-lg transition-all mr-5">
                {selectedCategory !== "All"
                  ? selectedCategory
                  : "All Automation Tools"}
                <div className="inline-flex items-center gap-3 px-5 py-2.5 ml-10 rounded-full bg-blue-950/40 border border-blue-500/20 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-cyan-500 to-blue-500"></span>
                  </span>
                  <span>
                    Imperial & Metric Supported . Tekla Version 2022 And Above
                  </span>
                </div>
              </h2>
              {/* <span className="text-xs font-semibold text-cyan-300 px-3 py-1 bg-blue-950/60 rounded-md border border-blue-800/50 shadow-inner">
                {isLoading ? '...' : (filteredTools.length > 0 ? `${filteredTools.length} Loaded` : '0 Results')}
              </span> */}
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((skel) => (
                  <div
                    key={skel}
                    className="rounded-3xl bg-[#0A1025]/60 p-6 border border-blue-900/30 animate-pulse"
                  >
                    <div className="aspect-[4/3] w-full rounded-2xl bg-blue-950/40 mb-6"></div>
                    <div className="h-6 w-3/4 bg-blue-900/50 rounded-md mb-4"></div>
                    <div className="mt-6 flex justify-between border-t border-blue-900/30 pt-4">
                      <div className="h-8 w-1/3 bg-blue-950/40 rounded-md"></div>
                      <div className="h-8 w-1/3 bg-blue-800/30 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && !isLoading && (
              <div className="py-12 flex flex-col items-center justify-center text-red-400 bg-red-950/20 rounded-3xl border border-red-900/40 backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-4 opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-medium">Failed to load tools.</p>
                <p className="text-sm opacity-60 mt-1">{error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 overflow-y-auto h-[80vh] scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
                  {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"> */}
                  {filteredTools.map((tool, index) => {
                    const isAdded = addedTools[tool.id];
                    return (
                      <div
                        key={`${tool.id}-${index}`}
                        style={{ transitionDelay: `${(index % 9) * 100}ms` }}
                        className={`group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#0A1025]/90 to-[#020617]/90 p-1.5 backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.3)] ${isMounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
                      >
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-amber-500/0 opacity-0 transition-opacity duration-500 group-hover:from-cyan-500/40 group-hover:via-blue-600/40 group-hover:to-amber-600/40 group-hover:opacity-100 z-0 pointer-events-none"></div>

                        <div className="relative z-10 flex h-full flex-col justify-between rounded-2xl bg-[#0A1025]/80 p-5">
                          <div>
                            <div className="mb-6 aspect-[4/3] w-full rounded-2xl bg-[#020617] flex flex-col items-center justify-center border border-blue-900/30 overflow-hidden relative group-hover:border-amber-500/30 transition-colors duration-500 shadow-inner">
                              <img
                                src={tool.image}
                                alt={tool.name}
                                className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 scale-105 group-hover:scale-100"
                              />
                              {tool.youtubeLink && (
                                <button
                                  onClick={() =>
                                    setActiveVideo(tool.youtubeLink)
                                  }
                                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                >
                                  <div className="bg-cyan-500/90 text-white p-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] transform hover:scale-110 transition-transform duration-300">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="w-8 h-8 ml-1"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </button>
                              )}
                              <div className="absolute top-3 right-3 bg-[#020617]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/20 shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                <span className="text-[10px] text-amber-200/80 uppercase tracking-widest font-bold truncate block max-w-[120px]">
                                  {Array.isArray(tool.category)
                                    ? tool.category.join(" • ")
                                    : tool.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-300 leading-tight drop-shadow-sm">
                                {tool.name}
                              </h3>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-blue-900/30 pt-4 relative overflow-hidden">
                            <div className="flex flex-col transform group-hover:translate-x-1 transition-transform duration-500">
                              <span className="text-[10px] uppercase tracking-wider text-amber-500/60 font-semibold mb-0.5">
                                Starting at
                              </span>
                              <span className="text-xl font-extrabold text-white drop-shadow-md">
                                AU${tool.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 z-10 min-w-[130px]">
                              <button
                                onClick={(e) => handleAddToCart(e, tool)}
                                disabled={isAdded}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 active:scale-95 group/cart
                                  ${
                                    isAdded
                                      ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                                      : "bg-[#0A1025]/80 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 border border-blue-800/50 hover:border-cyan-400/50 text-cyan-400 hover:text-white shadow-[0_0_10px_rgba(37,99,235,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:-translate-y-0.5"
                                  }`}
                              >
                                {isAdded ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2.5}
                                      stroke="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                      />
                                    </svg>
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-4 h-4 group-hover/cart:scale-110 transition-transform"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                      />
                                    </svg>
                                    Add to Cart
                                  </>
                                )}
                              </button>

                              <Link
                                href={`/tools/${tool.slug}`}
                                className="w-full block"
                              >
                                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-cyan-600 text-white px-5 py-2.5 text-sm font-bold transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-blue-400/20 group-hover:-translate-y-0.5">
                                  Details
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                    />
                                  </svg>
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isLoadingMore && (
                  <div className="mt-12 flex justify-center items-center gap-3 text-cyan-400 font-bold uppercase tracking-widest text-sm">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Fetching...
                  </div>
                )}
                {/* Loading more */}
                {!isLoadingMore && hasMore && (
                  <div className="mt-12 flex items-center justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-cyan-600 text-white px-8 py-3 text-sm font-bold transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-blue-400/20"
                    >
                      Load More Tools
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLoading && !error && filteredTools.length === 0 && (
              <div className="py-24 mt-4 flex flex-col items-center justify-center text-blue-300/50 bg-[#0A1025]/40 rounded-3xl border-2 border-dashed border-blue-900/40 backdrop-blur-sm animate-in fade-in duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-16 h-16 mb-4 text-blue-800"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-xl mb-2 font-medium text-blue-200">
                  No tools found
                </p>
                <p className="text-sm text-blue-300/60">
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 text-cyan-400 hover:text-amber-400 text-sm font-semibold underline underline-offset-4 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 sm:p-6 transition-opacity duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setActiveVideo(null)}
          ></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-[0_20px_50px_-10px_rgba(34,211,238,0.3)] border border-cyan-500/30 overflow-hidden animate-in zoom-in-95 duration-300 z-10">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-[#0A1025]/80 hover:bg-cyan-600 text-white rounded-full transition-colors duration-300 border border-blue-800/50 hover:border-cyan-400 backdrop-blur-sm group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
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
