"use client";

import React, { useState, useEffect } from 'react';
import { categoriesList, packagesList } from './constants'; // Removed toolsData

export default function ToolsGrid({ isMounted }) {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPackage, setSelectedPackage] = useState("All");

  // Fetch tools from the CRM via our API route
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/products');
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to fetch tools');

        // GoHighLevel returns records inside a `customObjects` array
        const fetchedRecords = result.records || [];

        const mappedTools = fetchedRecords.map(record => {
          let parsedData = {};
          try {
            // We stringified the payload into the "data" property in the POST route
            parsedData = JSON.parse(record.properties.data || "{}");
          } catch (e) {
            console.error("Error parsing tool data for record:", record.id);
          }

          return {
            id: record.id,
            name: parsedData.productName || "Unnamed Product",
            // Fallback price logic to grab the lowest/starting price available
            price: parseFloat(parsedData.pricing?.monthlyPrice || parsedData.pricing?.annualPrice || 0),
            category: parsedData.category || "Uncategorized",
            // Mapping your form's "subCategory" to the filter's "package"
            package: parsedData.subCategory || "None", 
            // GHL stores files as an array of objects
            image: record.properties.image?.[0]?.url || "https://placehold.co/600x400/020617/3b82f6?text=No+Image"
          };
        });

        setTools(mappedTools);
      } catch (err) {
        console.error("Error loading tools:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  const filteredTools = tools.filter(tool => {
    // 1. Search filter
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Category filter (handle both Array and String formats safely)
    const catArray = Array.isArray(tool.category) ? tool.category : [tool.category || "Uncategorized"];
    const matchesCategory = selectedCategory === "All" || selectedCategory === "All Tools" 
      ? true 
      : catArray.some(c => c.toLowerCase() === selectedCategory.toLowerCase());
    
    // 3. Package filter (handle both Array and String formats safely)
    const pkgArray = Array.isArray(tool.package) ? tool.package : [tool.package || "None"];
    const matchesPackage = selectedPackage === "All" || selectedPackage === "All Tools" 
      ? true 
      : pkgArray.some(p => p.toLowerCase() === selectedPackage.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesPackage;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPackage("All");
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row-reverse gap-8 mb-24 items-start">
        
        {/* SIDEBAR FILTERS */}
        <aside 
          className={`w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-24 rounded-3xl border border-blue-900/50 bg-[#0A1025]/80 p-6 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-20 transition-all duration-1000 delay-300 ${
            isMounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white drop-shadow-md">Filters</h3>
            <button 
              onClick={handleClearFilters}
              className="group flex items-center gap-1.5 text-xs font-medium text-blue-400/60 hover:text-amber-400 transition-colors duration-300 outline-none"
            >
              <span className="relative overflow-hidden">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">Clear All</span>
                <span className="block absolute inset-0 transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-amber-400">Clear All</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-8 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-blue-400/80 group-focus-within:text-cyan-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-4">Categories</h3>
            <div className="space-y-3">
              {categoriesList.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-blue-700/80 bg-[#020617] group-hover:border-cyan-400 transition-colors duration-300">
                    <input 
                      type="radio" name="category" value={cat} 
                      checked={selectedCategory === cat} onChange={(e) => setSelectedCategory(e.target.value)}
                      className="peer sr-only" 
                    />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-50 peer-checked:scale-100"></div>
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${selectedCategory === cat ? 'text-cyan-300 font-medium' : 'text-blue-200/80 group-hover:text-blue-100'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h3 className="text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-4">Packages</h3>
            <div className="space-y-3">
              {packagesList.map(pkg => (
                <label key={pkg} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded-full border border-blue-700/80 bg-[#020617] group-hover:border-amber-400 transition-colors duration-300">
                    <input 
                      type="radio" name="package" value={pkg} 
                      checked={selectedPackage === pkg} onChange={(e) => setSelectedPackage(e.target.value)}
                      className="peer sr-only" 
                    />
                    <div className="w-2 h-2 rounded-full bg-amber-400 opacity-0 peer-checked:opacity-100 transition-all duration-300 scale-50 peer-checked:scale-100"></div>
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${selectedPackage === pkg ? 'text-amber-300 font-medium' : 'text-blue-200/80 group-hover:text-blue-100'}`}>
                    {pkg}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID AREA */}
        <div className="flex-1 w-full">
          <div className={`flex items-center justify-between mb-8 px-2 border-b border-blue-900/30 pb-4 transition-all duration-1000 delay-200 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg transition-all">
              {selectedCategory !== 'All' ? selectedCategory : 'All Automation Tools'}
            </h2>
            <span className="text-xs font-semibold text-cyan-300 px-3 py-1 bg-blue-950/60 rounded-md border border-blue-800/50 shadow-inner">
              {isLoading ? '...' : filteredTools.length} Result{filteredTools.length !== 1 && 's'}
            </span>
          </div>

          {/* Loading State Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((skel) => (
                <div key={skel} className="rounded-3xl bg-[#0A1025]/60 p-6 border border-blue-900/30 animate-pulse">
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
          
          {/* Error State */}
          {error && !isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-red-400 bg-red-950/20 rounded-3xl border border-red-900/40 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">Failed to load tools.</p>
              <p className="text-sm opacity-60 mt-1">{error}</p>
            </div>
          )}

          {/* Actual Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool, index) => (
                <div 
                  key={tool.id} 
                  style={{ transitionDelay: `${(index % 10) * 100}ms` }}
                  className={`group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#0A1025]/90 to-[#020617]/90 p-1.5 backdrop-blur-xl transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.3)] ${
                    isMounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-amber-500/0 opacity-0 transition-opacity duration-500 group-hover:from-cyan-500/40 group-hover:via-blue-600/40 group-hover:to-amber-600/40 group-hover:opacity-100 z-0 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex h-full flex-col justify-between rounded-2xl bg-[#0A1025]/80 p-5">
                      <div>
                        <div className="mb-6 aspect-[4/3] w-full rounded-2xl bg-[#020617] flex flex-col items-center justify-center border border-blue-900/30 overflow-hidden relative group-hover:border-amber-500/30 transition-colors duration-500 shadow-inner">
                            <img 
                            src={tool.image} alt={tool.name} 
                            className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 scale-105 group-hover:scale-100"
                            />
                            <div className="absolute top-3 right-3 bg-[#020617]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/20 shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <span className="text-[10px] text-amber-200/80 uppercase tracking-widest font-bold truncate block max-w-[120px]">
                                  {Array.isArray(tool.category) ? tool.category.join(' • ') : tool.category}
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
                            <span className="text-[10px] uppercase tracking-wider text-amber-500/60 font-semibold mb-0.5">Starting at</span>
                            <span className="text-xl font-extrabold text-white drop-shadow-md">${tool.price.toFixed(2)}</span>
                        </div>
                        <button className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-cyan-600 text-white px-5 py-2 text-sm font-bold transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-blue-400/20 group-hover:-translate-y-0.5">
                            Details
                        </button>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTools.length === 0 && (
            <div className="py-24 mt-4 flex flex-col items-center justify-center text-blue-300/50 bg-[#0A1025]/40 rounded-3xl border-2 border-dashed border-blue-900/40 backdrop-blur-sm animate-in fade-in duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 text-blue-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xl mb-2 font-medium text-blue-200">No tools found</p>
              <p className="text-sm text-blue-300/60">Try adjusting your filters or search term.</p>
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
  );
}