"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, ChevronLeft, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';

export default function ProductBulkEdit() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: Ref to store a "snapshot" of data for reverting comparison
  const originalProductsRef = useRef([]);
  
  // Selection & Action States
  const [selectedId, setSelectedId] = useState(null);
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Backend Pagination State
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
            stripeProductId: payload.stripeProductId || '',
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
        // Store the baseline copy
        originalProductsRef.current = JSON.parse(JSON.stringify(flattenedData));
        setHasMore(data.hasMore); 
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to load products.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellChange = (id, field, value) => {
    // 1. Update State
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);

    // 2. Compare against Original
    const currentProduct = updatedProducts.find(p => p.id === id);
    const originalProduct = originalProductsRef.current.find(p => p.id === id);

    if (!currentProduct || !originalProduct) return;

    // Helper to normalize values for comparison
    const normalize = (val) => {
      if (val === null || val === undefined) return '';
      // If it's a number-like string (like "89.00"), convert to actual number
      const num = parseFloat(val);
      return isNaN(num) ? String(val).trim() : num;
    };

    // Check if row is actually different from the original database snapshot
    const isDifferent = Object.keys(currentProduct).some(key => {
      // Don't compare the ID itself
      if (key === 'id') return false; 
      
      const currentVal = normalize(currentProduct[key]);
      const originalVal = normalize(originalProduct[key]);

      return currentVal !== originalVal;
    });

    setDirtyRows(prev => {
      const newSet = new Set(prev);
      if (isDifferent) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    const productToDelete = products.find(p => p.id === selectedId);
    if (!productToDelete) return;

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${productToDelete.productName || 'this product'}"?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products?id=${selectedId}&stripeProductId=${productToDelete.stripeProductId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');

      setProducts(prev => prev.filter(p => p.id !== selectedId));
      setDirtyRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedId);
        return newSet;
      });
      setSelectedId(null);
      setStatus({ type: 'success', message: 'Product deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const handleSaveAll = async () => {
    if (dirtyRows.size === 0) return;
    
    setIsSavingAll(true);
    setStatus({ type: '', message: '' });

    const rowsToSave = products.filter(p => dirtyRows.has(p.id));
    let successCount = 0;

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
          links: { youtubeLink: rowData.youtubeLink, downloadUrl: rowData.downloadUrl }
        };

        const formData = new FormData();
        formData.append('recordId', rowData.id);
        formData.append('productPayload', JSON.stringify(payload));

        const response = await fetch('/api/products', { method: 'PATCH', body: formData });
        if (response.ok) successCount++;
      } catch (error) {
        console.error("Save error:", error);
      }
    }

    setIsSavingAll(false);
    setDirtyRows(new Set());
    // Update reference to the newly saved data
    originalProductsRef.current = JSON.parse(JSON.stringify(products));
    
    setStatus({ type: 'success', message: `Successfully updated ${successCount} products!` });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handlePageChange = (direction) => {
    if (dirtyRows.size > 0 && !window.confirm("Leave without saving? Changes will be lost.")) return;
    
    setDirtyRows(new Set());
    setSelectedId(null);
    if (direction === 'next' && hasMore) setCurrentPage(prev => prev + 1);
    else if (direction === 'prev' && currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const thClass = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400/80 whitespace-nowrap bg-[#0a0f1c] sticky top-0 z-10 border-b border-blue-500/20";
  const tdClass = "border-b border-blue-500/10 whitespace-nowrap";
  const inputClass = "w-full bg-transparent border-none text-blue-50 px-4 py-3 focus:outline-none transition-colors placeholder:text-blue-200/20";

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
          
          <div className="flex items-center gap-3">
            {status.message && (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${status.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                {status.message}
              </div>
            )}

            {/* Header Delete Button */}
            {selectedId && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all animate-in zoom-in-95"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Delete
              </button>
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
              {isSavingAll ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save All {dirtyRows.size > 0 && `(${dirtyRows.size})`}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-400/50 gap-4 uppercase tracking-widest text-xs font-bold">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
              Fetching Records...
            </div>
          ) : (
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className={`${thClass} min-w-[350px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]`}>Product Name</th>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>One Time</th>
                  <th className={thClass}>Monthly</th>
                  <th className={thClass}>Annual</th>
                  <th className={thClass}>Single Sys</th>
                  <th className={thClass}>Act. One Time</th>
                  <th className={thClass}>Act. Monthly</th>
                  <th className={thClass}>Act. Annual</th>
                  <th className={thClass}>Youtube</th>
                  <th className={thClass}>Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10 text-blue-100">
                {products.map((row) => {
                  const isDirty = dirtyRows.has(row.id);
                  const isSelected = selectedId === row.id;
                  
                  return (
                    <tr 
                      key={row.id} 
                      onClick={() => setSelectedId(row.id)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? 'bg-cyan-500/10' : 'hover:bg-blue-950/20'
                      }`}
                    >
                      <td className={`${tdClass} sticky left-0 z-10 ${isSelected ? 'bg-[#121d3a]' : 'bg-[#0a0f1c]'} group-hover:bg-[#0c1328] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] min-w-[350px]`}>
                        <div className="flex items-center relative pl-4">
                          {isDirty && <div className="absolute left-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>}
                          <input 
                            className={`${inputClass} font-medium ${isDirty ? 'text-cyan-300' : ''}`} 
                            value={row.productName} 
                            onChange={(e) => handleCellChange(row.id, 'productName', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td className={tdClass}><input className={inputClass} value={row.category} onChange={(e) => handleCellChange(row.id, 'category', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.oneTimePrice} onChange={(e) => handleCellChange(row.id, 'oneTimePrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.monthlyPrice} onChange={(e) => handleCellChange(row.id, 'monthlyPrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.annualPrice} onChange={(e) => handleCellChange(row.id, 'annualPrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.singleSystemPrice} onChange={(e) => handleCellChange(row.id, 'singleSystemPrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualOneTimePrice} onChange={(e) => handleCellChange(row.id, 'actualOneTimePrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualMonthlyPrice} onChange={(e) => handleCellChange(row.id, 'actualMonthlyPrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualAnnualPrice} onChange={(e) => handleCellChange(row.id, 'actualAnnualPrice', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} value={row.youtubeLink} onChange={(e) => handleCellChange(row.id, 'youtubeLink', e.target.value)} /></td>
                      <td className={tdClass}><input className={inputClass} value={row.downloadUrl} onChange={(e) => handleCellChange(row.id, 'downloadUrl', e.target.value)} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-blue-500/10 shrink-0 flex items-center justify-between bg-[#0a0f1c]/80">
          <div className="flex items-center gap-3 text-sm text-blue-300/50">
            Page <span className="text-cyan-400">{currentPage}</span>
            {dirtyRows.size > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                {dirtyRows.size} unsaved rows
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1 || isLoading} className="p-2 rounded-lg border border-blue-500/20 hover:text-cyan-400 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => handlePageChange('next')} disabled={!hasMore || isLoading} className="p-2 rounded-lg border border-blue-500/20 hover:text-cyan-400 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}