"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, ChevronLeft, ChevronRight, Trash2, FileEdit, X, Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// 1. TipTap Toolbar Menu
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const getButtonClass = (isActive) => 
    `p-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-500/20 text-cyan-400' 
        : 'text-blue-400/50 hover:bg-blue-500/10 hover:text-blue-200'
    }`;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-blue-500/20 bg-[#0a0f1c]">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      
      <div className="w-[1px] h-6 bg-blue-500/20 mx-2" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
};

// 2. TipTap Editor Component 
const RichTextEditor = ({ description, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: description,
    immediatelyRender: false, 
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[250px] p-4 focus:outline-none text-blue-50',
      },
    },
  });

  return (
    <div className="bg-[#0a0f1c] rounded-xl border border-blue-500/20 overflow-hidden flex flex-col shadow-inner">
      <MenuBar editor={editor} />
      <div className="flex-1 cursor-text" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// 3. Main Bulk Edit Component
export default function ProductBulkEdit() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const originalProductsRef = useRef([]);
  
  // Selection & Action States
  const [selectedId, setSelectedId] = useState(null);
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Modal States
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

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
      // Fetching all (status=all) so you can see and edit both active and inactive products
      const response = await fetch(`/api/products?page=${pageToFetch}&limit=${itemsPerPage}&status=all`);
      const data = await response.json();

      if (data.success) {
        const flattenedData = data.records.map(record => {
          
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
            productPrefix: record.product_prefix || '', // <--- REQUIRED BY BACKOFFICE
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
        
        setProducts(flattenedData);
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
      // Strict check for status changes
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
        
        // Pass Backoffice Fields
        formData.append('product_prefix', rowData.productPrefix); // <--- REQUIRED ADDITION
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
    if (direction === 'next' && hasMore) setCurrentPage(prev => prev + 1);
    else if (direction === 'prev' && currentPage > 1) setCurrentPage(prev => prev - 1);
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

  const thClass = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400/80 whitespace-nowrap bg-[#0a0f1c] sticky top-0 z-10 border-b border-blue-500/20";
  const tdClass = "border-b border-blue-500/10 whitespace-nowrap";
  const inputClass = "w-full bg-transparent border-none text-blue-50 px-4 py-3 focus:outline-none transition-colors placeholder:text-blue-200/20";

  return (
    <>
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

              {selectedId && (
                <div className="flex gap-2 animate-in zoom-in-95">
                  <button
                    onClick={openDescriptionModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-500/10 text-cyan-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                  >
                    <FileEdit size={18} />
                    Update Description
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    Delete
                  </button>
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
                    <th className={thClass}>Status</th>
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
                        
                        <td className={tdClass}>
                          <select 
                            className={`${inputClass} font-bold cursor-pointer transition-colors ${row.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400 opacity-80'}`}
                            value={row.status}
                            onChange={(e) => handleCellChange(row.id, 'status', e.target.value)}
                          >
                            <option value="ACTIVE" className="bg-[#0a0f1c] text-emerald-400">ACTIVE</option>
                            <option value="INACTIVE" className="bg-[#0a0f1c] text-red-400">INACTIVE</option>
                          </select>
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

      {/* 3. Description Editor Modal */}
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