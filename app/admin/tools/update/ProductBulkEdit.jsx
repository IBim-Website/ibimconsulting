"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, ChevronLeft, ChevronRight, Trash2, FileEdit, X, Search, Download, ImagePlus } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import ProductTable from './ProductTable';
import { exportToExcel } from './exportUtils'; 

const formatProductData = (records) => {
  return records.map(record => {
    let parsedData = record.extraPayload || {};
    if (typeof parsedData === 'string') {
        try { parsedData = JSON.parse(parsedData); } catch (e) {}
    }

    const pricing = parsedData.pricing || {};
    const links = parsedData.links || {};

    let finalDesc = parsedData.description;
    if (!finalDesc && record.description) {
        try {
            const parsedBoDesc = JSON.parse(record.description);
            if (Array.isArray(parsedBoDesc) && parsedBoDesc[0]?.Content) {
                finalDesc = parsedBoDesc[0].Content.join("");
            } else {
                finalDesc = record.description;
            }
        } catch(e) {
            finalDesc = record.description;
        }
    }

    let categoryStr = '';
    if (Array.isArray(parsedData.category)) {
        categoryStr = parsedData.category.join(', ');
    } else if (parsedData.category) {
        categoryStr = parsedData.category;
    }

    return {
      id: record.product_uuid || record.product_code, 
      productCode: record.product_code || '', 
      productPrefix: record.product_prefix || '',
      productName: record.product_name || parsedData.productName || '',
      status: record.status || 'INACTIVE', 
      description: finalDesc || '', 
      category: categoryStr, 
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
};

export default function ProductBulkEdit() {
  const [products, setProducts] = useState([]);
  
  // Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const originalProductsRef = useRef([]);
  const fileInputRef = useRef(null);
  
  // Selection & Action States
  const [selectedId, setSelectedId] = useState(null);
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // Fetching 1000 products by default in one request
        const response = await fetch(`/api/products?page=1&limit=1000&status=all`);
        const data = await response.json();

        if (data.success && isMounted) {
          const formattedData = formatProductData(data.records);
          setProducts(formattedData);
          originalProductsRef.current = JSON.parse(JSON.stringify(formattedData));
          setIsInitialLoading(false);
        }
      } catch (error) {
        setStatus({ type: 'error', message: 'Failed to load products.' });
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false; 
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = (product.productName || '').toLowerCase().includes(query);
    const categoryMatch = (product.category || '').toLowerCase().includes(query);
    return nameMatch || categoryMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCellChange = (id, field, value) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);

    const currentProduct = updatedProducts.find(p => p.id === id);
    const originalProduct = originalProductsRef.current.find(p => p.id === id);

    if (!currentProduct || !originalProduct) return;

    const normalize = (val) => {
      if (val === null || val === undefined) return '';
      const num = parseFloat(val);
      return isNaN(num) ? String(val).trim() : num;
    };

    const isDifferent = Object.keys(currentProduct).some(key => {
      if (key === 'id') return false; 
      if (key === 'status') return currentProduct[key] !== originalProduct[key];
      
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    const product = products.find(p => p.id === selectedId);
    if (!product || !product.productCode) {
      setStatus({ type: 'error', message: 'Product code missing. Cannot attach image.' });
      return;
    }

    setIsUploadingImage(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('productCode', product.productCode);
      formData.append('image', file);

      const response = await fetch('/api/products/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setStatus({ type: 'success', message: 'Image successfully attached to product!' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  const handleDeleteSelected = async () => {
    const productToDelete = products.find(p => p.id === selectedId);
    if (!productToDelete) return;

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${productToDelete.productName || 'this product'}"?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products?id=${productToDelete.id}&productCode=${productToDelete.productCode}`, {
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
          description: rowData.description, 
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
        formData.append('id', rowData.id); 
        formData.append('productCode', rowData.productCode); 
        formData.append('product_prefix', rowData.productPrefix);
        formData.append('product_name', rowData.productName);
        formData.append('description', rowData.description);
        formData.append('status', rowData.status); 
        formData.append('productPayload', JSON.stringify(payload));

        const response = await fetch('/api/products', { method: 'PATCH', body: formData });
        if (response.ok) successCount++;
      } catch (error) {
        console.error("Save error:", error);
      }
    }

    setIsSavingAll(false);
    setDirtyRows(new Set());
    originalProductsRef.current = JSON.parse(JSON.stringify(products));
    
    setStatus({ type: 'success', message: `Successfully updated ${successCount} products!` });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handlePageChange = (direction) => {
    if (dirtyRows.size > 0 && !window.confirm("Leave without saving? Changes will be lost.")) return;
    
    setDirtyRows(new Set());
    setSelectedId(null);
    if (direction === 'next' && currentPage < totalPages) setCurrentPage(prev => prev + 1);
    else if (direction === 'prev' && currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const openDescriptionModal = () => {
    const product = products.find(p => p.id === selectedId);
    if (product) {
      setTempDescription(product.description || '');
      setIsDescModalOpen(true);
    }
  };

  const saveDescription = () => {
    handleCellChange(selectedId, 'description', tempDescription);
    setIsDescModalOpen(false);
  };

  const handleExport = () => {
    exportToExcel(filteredProducts);
  };

  return (
    <>
      <div className="relative z-10 mx-auto w-full px-6 pt-10 pb-20">
        <div className="bg-[#0a0f1c]/90 border border-blue-500/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.05)] flex flex-col h-[85vh]">
          
          <div className="p-6 md:p-8 border-b border-blue-500/10 flex flex-wrap gap-4 items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-8 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md whitespace-nowrap">
                BULK <span className="text-cyan-400 font-light">EDITOR</span>
              </h2>
            </div>
            
            <div className="relative flex-1 min-w-[250px] max-w-md mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50" size={18} />
              <input
                type="text"
                placeholder="Search name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isInitialLoading}
                className="w-full bg-[#121d3a]/50 border border-blue-500/20 text-blue-50 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-blue-200/30 shadow-inner disabled:opacity-50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400/50 hover:text-cyan-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {status.message && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${status.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  {status.message}
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={isInitialLoading || filteredProducts.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export list to Excel"
              >
                <Download size={18} />
                <span className="hidden lg:inline">Export CSV</span>
              </button>

              {selectedId && (
                <div className="flex gap-2 animate-in zoom-in-95">
                  
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/gif, image/webp" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                  >
                    {isUploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                    <span className="hidden md:inline">{isUploadingImage ? 'Uploading...' : 'Attach Image'}</span>
                  </button>

                  <button
                    onClick={openDescriptionModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-500/10 text-cyan-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                  >
                    <FileEdit size={18} />
                    <span className="hidden md:inline">Update Description</span>
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleSaveAll}
                disabled={isSavingAll || dirtyRows.size === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all whitespace-nowrap ${
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
            <ProductTable 
              products={displayedProducts}
              isLoading={isInitialLoading}
              dirtyRows={dirtyRows}
              selectedId={selectedId}
              onSelectRow={setSelectedId}
              onCellChange={handleCellChange}
            />
            
            {!isInitialLoading && displayedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-blue-400/50 text-sm">
                <Search size={32} className="mb-2 opacity-50" />
                {products.length === 0 ? "No products found in database." : `No products match "${searchQuery}"`}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-blue-500/10 shrink-0 flex items-center justify-between bg-[#0a0f1c]/80 flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-blue-300/50">
              <span>
                Page <span className="text-cyan-400 font-bold">{currentPage}</span> of <span className="text-white">{totalPages}</span>
              </span>
              
              <div className="w-px h-4 bg-blue-500/20"></div>
              <span>Total: <span className="text-white">{filteredProducts.length}</span> items</span>

              {dirtyRows.size > 0 && (
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20 ml-2">
                  {dirtyRows.size} unsaved rows
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-xs text-blue-300/50 uppercase tracking-wider font-bold">Rows:</label>
                <select 
                  value={itemsPerPage} 
                  onChange={handleItemsPerPageChange}
                  className="bg-[#121d3a] text-cyan-400 text-sm font-bold border border-blue-500/20 rounded-md px-2 py-1 focus:outline-none focus:border-cyan-400/50 cursor-pointer transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange('prev')} 
                  disabled={currentPage === 1 || isInitialLoading} 
                  className="p-2 rounded-lg border border-blue-500/20 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-blue-300/50 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => handlePageChange('next')} 
                  disabled={currentPage >= totalPages || isInitialLoading} 
                  className="p-2 rounded-lg border border-blue-500/20 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-blue-300/50 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDescModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0c1328] border border-blue-500/30 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(34,211,238,0.1)] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            <div className="px-6 py-4 border-b border-blue-500/20 flex justify-between items-center bg-[#0a0f1c]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileEdit className="text-cyan-400" size={20} />
                Update Description
              </h3>
              <button 
                onClick={() => setIsDescModalOpen(false)} 
                className="text-blue-400/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <RichTextEditor 
                description={tempDescription} 
                onChange={setTempDescription} 
              />
            </div>

            <div className="px-6 py-4 border-t border-blue-500/20 flex justify-end gap-3 bg-[#0a0f1c]">
              <button 
                onClick={() => setIsDescModalOpen(false)} 
                className="px-5 py-2 rounded-xl font-bold text-sm text-blue-300 hover:bg-blue-900/30 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveDescription} 
                className="px-5 py-2 rounded-xl font-bold text-sm bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-cyan-400 transition-colors"
              >
                Apply to Row
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}