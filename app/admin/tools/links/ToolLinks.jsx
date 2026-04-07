"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ToolsTable({ isMounted = true }) {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // API Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Copy State for UI Feedback
  const [copiedId, setCopiedId] = useState(null);

  // Fetch tools from the API
  useEffect(() => {
    const fetchTools = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const response = await fetch(`/api/products?page=${page}&limit=15`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to fetch tools');

        const fetchedRecords = result.records || [];

        const mappedTools = fetchedRecords.map(record => {
          let parsedData = record.extraPayload || {};
          if (typeof parsedData === 'string') {
              try { parsedData = JSON.parse(parsedData); } catch (e) {}
          }

          const rawToolCode = record.product_code || "unnamed-tool";
          const formattedSlug = rawToolCode.toLowerCase().replace(/[_ ]+/g, '-');

          return {
            id: record.product_uuid || record.product_code || record.id,
            name: record.product_name || parsedData.productName || "Unnamed Product",
            toolCode: rawToolCode,
            slug: formattedSlug 
          };
        });

        if (page === 1) {
          setTools(mappedTools);
        } else {
          setTools(prev => {
            const newTools = mappedTools.filter(mt => !prev.some(pt => pt.id === mt.id));
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

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Copy Link Handler
  const handleCopyLink = async (slug, id) => {
    try {
      // Dynamically grab the current domain
      const fullUrl = `${window.location.origin}/tools/${slug}`;
      await navigator.clipboard.writeText(fullUrl);
      
      // Temporarily show the "Copied" state for this specific row
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className={`mb-8 border-b border-blue-900/30 pb-4 transition-all duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
          Product Directory
        </h2>
        <p className="text-sm text-blue-300/60 mt-1">Overview of all available tools and their direct links.</p>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="py-6 mb-8 flex flex-col items-center justify-center text-red-400 bg-red-950/20 rounded-2xl border border-red-900/40 backdrop-blur-sm">
          <p className="font-medium">Failed to load tools.</p>
          <p className="text-sm opacity-60 mt-1">{error}</p>
        </div>
      )}

      {/* Table Area */}
      <div className={`overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0A1025]/80 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-1000 delay-200 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-blue-200">
            <thead className="bg-[#020617]/80 text-xs uppercase text-amber-400/90 tracking-wider border-b border-blue-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold w-1/3">Product Name</th>
                <th scope="col" className="px-6 py-4 font-bold w-1/4">Product Code</th>
                <th scope="col" className="px-6 py-4 font-bold w-1/4">Product Link</th>
                <th scope="col" className="px-6 py-4 font-bold w-[150px] text-right">Actions</th>
              </tr>
            </thead>
            
            {/* Loading Skeleton */}
            {isLoading && (
              <tbody>
                {[1, 2, 3, 4, 5].map((skel) => (
                  <tr key={skel} className="border-b border-blue-900/20 animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-3/4 bg-blue-900/40 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-1/2 bg-blue-900/40 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-2/3 bg-blue-900/40 rounded"></div></td>
                    <td className="px-6 py-4 flex justify-end"><div className="h-8 w-24 bg-blue-900/40 rounded-lg"></div></td>
                  </tr>
                ))}
              </tbody>
            )}

            {/* Actual Data */}
            {!isLoading && !error && (
              <tbody className="divide-y divide-blue-900/30">
                {tools.map((tool) => (
                  <tr 
                    key={tool.id} 
                    className="hover:bg-blue-900/20 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4 font-medium text-white group-hover:text-cyan-300 transition-colors">
                      {tool.name}
                    </td>
                    <td className="px-6 py-4 text-blue-300/80 font-mono text-xs">
                      {tool.toolCode}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/tools/${tool.slug}`}
                        className="flex items-center gap-2 text-blue-400 hover:text-amber-400 transition-colors"
                      >
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                          /tools/{tool.slug}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCopyLink(tool.slug, tool.id)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 min-w-[100px] ${
                          copiedId === tool.id 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                            : 'bg-blue-950/40 text-blue-300 border-blue-800/50 hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-blue-900/40'
                        }`}
                      >
                        {copiedId === tool.id ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                            </svg>
                            Copy Link
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {tools.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-blue-300/50">
                      No tools found in the directory.
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* API Paginated Load More Button */}
      {!isLoading && (isLoadingMore || hasMore) && (
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-cyan-600 text-white px-8 py-3 text-sm font-bold transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Products'
            )}
          </button>
        </div>
      )}

    </div>
  );
}