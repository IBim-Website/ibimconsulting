"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, ChevronLeft, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';

export default function ProductBulkEdit() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // NEW: Track which row is deleting
  const [status, setStatus] = useState({ type: '', message: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false); 
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (pageToFetch) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?page=${pageToFetch}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (data.success) {
        const flattenedData = data.records.map(record => {
          const props = record.properties || {};
          const payload = JSON.parse(props.data || '{}');
          const pricing = payload.pricing || {};
          const links = payload.links || {};

          return {
            id: record.id,
            stripeProductId: payload.stripeProductId || '', // NEW: Extract Stripe ID
            productName: payload.productName || '',
            category: payload.category?.join(', ') || '', 
            oneTimePrice: pricing.oneTimePrice || '',
            monthlyPrice: pricing.monthlyPrice || '',
            annualPrice: pricing.annualPrice || '',
            singleSystemPrice: pricing.singleSystemPrice || '',
            actualOneTimePrice: pricing.actualOneTimePrice || '',
            actualMonthlyPrice: pricing.actualMonthlyPrice || '',
            actualAnnualPrice: pricing.actualAnnualPrice || '',
            actualSingleSystemPrice: pricing.actualSingleSystemPrice || '',
            youtubeLink: links.youtubeLink || '',
            downloadUrl: links.downloadUrl || '',
          };
        });
        
        setProducts(flattenedData);
        setHasMore(data.hasMore); 
      } else {
        setStatus({ type: 'error', message: 'Failed to load products.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error while fetching products.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellChange = (id, field, value) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
    setDirtyRows(prev => new Set(prev).add(id));
  };

  // NEW: Handle Single Deletion
  const handleDeleteRow = async (id, stripeProductId, productName) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${productName || 'this product'}"?\n\nThis will remove it from the CRM and deactivate it in Stripe.`);
    if (!confirmed) return;

    setDeletingId(id);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`/api/products?id=${id}&stripeProductId=${stripeProductId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to delete');

      // Remove from UI
      setProducts(prev => prev.filter(p => p.id !== id));
      setDirtyRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      setStatus({ type: 'success', message: 'Product deleted successfully.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);

    } catch (error) {
      console.error("Delete error:", error);
      setStatus({ type: 'error', message: error.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveAll = async () => {
    if (dirtyRows.size === 0) return;
    
    setIsSavingAll(true);
    setStatus({ type: '', message: '' });

    const rowsToSave = products.filter(p => dirtyRows.has(p.id));
    let successCount = 0;
    let errorCount = 0;

    for (const rowData of rowsToSave) {
      try {
        const payload = {
          productName: rowData.productName,
          category: rowData.category.split(',').map(s => s.trim()).filter(Boolean),
          pricing: {
            oneTimePrice: rowData.oneTimePrice,
            monthlyPrice: rowData.monthlyPrice,
            annualPrice: rowData.annualPrice,
            singleSystemPrice: rowData.singleSystemPrice,
            actualOneTimePrice: rowData.actualOneTimePrice,
            actualMonthlyPrice: rowData.actualMonthlyPrice,
            actualAnnualPrice: rowData.actualAnnualPrice,
            actualSingleSystemPrice: rowData.actualSingleSystemPrice,
          },
          links: {
            youtubeLink: rowData.youtubeLink,
            downloadUrl: rowData.downloadUrl
          }
        };

        const formData = new FormData();
        formData.append('recordId', rowData.id);
        formData.append('productPayload', JSON.stringify(payload));

        const response = await fetch('/api/products', {
          method: 'PATCH',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to update');
        successCount++;
      } catch (error) {
        console.error("Save error for row:", rowData.id, error);
        errorCount++;
      }
    }

    setIsSavingAll(false);
    
    if (errorCount === 0) {
      setDirtyRows(new Set());
      setStatus({ type: 'success', message: `Successfully updated ${successCount} product(s)!` });
    } else {
      setStatus({ type: 'error', message: `Updated ${successCount} items, but failed on ${errorCount} items.` });
    }

    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handlePageChange = (direction) => {
    if (dirtyRows.size > 0) {
      const confirmLeave = window.confirm(
        "You have unsaved changes on this page. If you leave, your changes will be lost.\n\nAre you sure you want to continue without saving?"
      );
      if (!confirmLeave) return;
    }
    
    setDirtyRows(new Set());
    
    if (direction === 'next' && hasMore) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const thClass = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400/80 whitespace-nowrap bg-[#0a0f1c] sticky top-0 z-10 border-b border-blue-500/20";
  const tdClass = "border-b border-blue-500/10 whitespace-nowrap";
  const inputClass = "w-full bg-transparent border-none text-blue-50 px-4 py-3 focus:bg-blue-900/40 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-cyan-400/50 transition-colors placeholder:text-blue-200/20";

  return (
    <div className="relative z-10 mx-auto w-full px-6 pt-10 pb-20">
      <div className="bg-[#0a0f1c]/90 border border-blue-500/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.05)] flex flex-col h-[85vh]">
        
        <div className="p-6 md:p-8 border-b border-blue-500/10 flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-8 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              BULK <span className="text-cyan-400 font-light">EDITOR</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {status.message && (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${status.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                {status.message}
              </div>
            )}

            <button
              onClick={handleSaveAll}
              disabled={isSavingAll || dirtyRows.size === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all ${
                dirtyRows.size > 0 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:-translate-y-0.5' 
                  : 'bg-blue-900/30 text-blue-500/50 cursor-not-allowed'
              }`}
            >
              {isSavingAll ? (
                <><Loader2 size={18} className="animate-spin" /> Syncing...</>
              ) : (
                <><Save size={18} /> Save All Changes {dirtyRows.size > 0 && `(${dirtyRows.size})`}</>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-400/50 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <p className="font-medium tracking-widest text-sm uppercase">Loading Page {currentPage}...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={`${thClass} min-w-[350px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]`}>Product Name</th>
                  <th className={thClass}>Category (Comma Separated)</th>
                  <th className={thClass}>One Time $</th>
                  <th className={thClass}>Monthly $</th>
                  <th className={thClass}>Annual $</th>
                  <th className={thClass}>Single Sys $</th>
                  <th className={thClass}>Actual One Time $</th>
                  <th className={thClass}>Actual Monthly $</th>
                  <th className={thClass}>Actual Annual $</th>
                  <th className={thClass}>Youtube Link</th>
                  <th className={thClass}>Download URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10 text-blue-100">
                {products.map((row) => {
                  const isDirty = dirtyRows.has(row.id);
                  return (
                    <tr key={row.id} className="hover:bg-blue-950/20 transition-colors group">
                      
                      {/* UPDATED: Sticky Column with Delete Button */}
                      <td className={`${tdClass} sticky left-0 z-10 bg-[#0a0f1c] group-hover:bg-[#0c1328] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] min-w-[350px]`}>
                        <div className="flex items-center relative pl-3 gap-1">
                          {/* Dirty indicator dot */}
                          {isDirty && <div className="absolute left-1 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>}
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteRow(row.id, row.stripeProductId, row.productName)}
                            disabled={deletingId === row.id}
                            className="p-1.5 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-50"
                            title="Delete Product"
                          >
                            {deletingId === row.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>

                          <input 
                            className={`${inputClass} font-medium ${isDirty ? 'text-cyan-300' : ''}`} 
                            value={row.productName} 
                            onChange={(e) => handleCellChange(row.id, 'productName', e.target.value)} 
                            placeholder="Product Name" 
                          />
                        </div>
                      </td>
                      
                      <td className={tdClass}><input className={inputClass} value={row.category} onChange={(e) => handleCellChange(row.id, 'category', e.target.value)} placeholder="Cat 1, Cat 2" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.oneTimePrice} onChange={(e) => handleCellChange(row.id, 'oneTimePrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.monthlyPrice} onChange={(e) => handleCellChange(row.id, 'monthlyPrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.annualPrice} onChange={(e) => handleCellChange(row.id, 'annualPrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.singleSystemPrice} onChange={(e) => handleCellChange(row.id, 'singleSystemPrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualOneTimePrice} onChange={(e) => handleCellChange(row.id, 'actualOneTimePrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualMonthlyPrice} onChange={(e) => handleCellChange(row.id, 'actualMonthlyPrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualAnnualPrice} onChange={(e) => handleCellChange(row.id, 'actualAnnualPrice', e.target.value)} placeholder="0.00" /></td>
                      <td className={tdClass}><input className={inputClass} value={row.youtubeLink} onChange={(e) => handleCellChange(row.id, 'youtubeLink', e.target.value)} placeholder="https://youtube.com..." /></td>
                      <td className={tdClass}><input className={inputClass} value={row.downloadUrl} onChange={(e) => handleCellChange(row.id, 'downloadUrl', e.target.value)} placeholder="https://..." /></td>
                    </tr>
                  )
                })}
                {products.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="11" className="text-center py-10 text-blue-400/50">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-blue-500/10 shrink-0 flex items-center justify-between bg-[#0a0f1c]/80">
          <div className="flex items-center gap-3">
            <p className="text-sm text-blue-300/50">
              Showing page <span className="text-cyan-400">{currentPage}</span>
            </p>
            {dirtyRows.size > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                <AlertCircle size={14} /> {dirtyRows.size} Unsaved
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1 || isLoading || isSavingAll}
              className="p-2 rounded-lg border border-blue-500/20 text-blue-300 hover:text-cyan-400 hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-blue-50 px-4">
              Page {currentPage}
            </span>
            <button 
              onClick={() => handlePageChange('next')}
              disabled={!hasMore || isLoading || isSavingAll}
              className="p-2 rounded-lg border border-blue-500/20 text-blue-300 hover:text-cyan-400 hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}