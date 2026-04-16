"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, ChevronLeft, ChevronRight, Trash2, FileEdit, X, Bold, Italic, Strikethrough, List, ListOrdered, Layers, Check } from 'lucide-react';
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
        ? 'bg-emerald-500/20 text-emerald-400' 
        : 'text-blue-400/50 hover:bg-emerald-500/10 hover:text-emerald-200'
    }`;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-blue-500/20 bg-[#0a0f1c]">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      
      <div className="w-[1px] h-6 bg-blue-500/20 mx-2" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
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
export default function PackageBulkEdit() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const originalPackagesRef = useRef([]);
  
  // Selection & Action States
  const [selectedId, setSelectedId] = useState(null);
  const [dirtyRows, setDirtyRows] = useState(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Description Modal States
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  // Products Modal States
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [tempProducts, setTempProducts] = useState([]); // Stores product_codes array
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Backend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false); 
  const itemsPerPage = 10000;

  // Fetch Packages
  useEffect(() => {
    fetchPackages(currentPage);
  }, [currentPage]);

  // Fetch Products for the multi-select modal
  useEffect(() => {
    const fetchProductsList = async () => {
      try {
        const res = await fetch('/api/products?limit=100&status=ACTIVE');
        const data = await res.json();
        
        if (data.success && data.records) {
          const fetchedProducts = data.records.map(record => {
            return {
              id: record.product_uuid || record.product_code, // Ensures unique key
              name: record.product_name || "Unnamed Product", // For UI display
              code: record.product_code                       // Backend code mapping
            };
          }).filter(Boolean); 
          
          setAvailableProducts(fetchedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProductsList();
  }, []);

  const fetchPackages = async (pageToFetch) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/packages?page=${pageToFetch}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (data.success) {
        const flattenedData = data.records.map(record => {
          // GHL extra data is now spread directly onto the record
          const pricing = record.pricing || {};

          return {
            id: record.id, // Backoffice ID
            _ghlRecordId: record._ghlRecordId || '', // GHL ID for updates/deletes
            package_uuid: record.package_uuid || '',
            
            packageName: record.package_name || record.packageName || '',
            packageCode: record.package_code || '',
            status: record.status || 'AVAILABLE',
            exclusivePackage: record.exclusive_package || 'YES',
            productCodes: Array.isArray(record.product_codes) ? record.product_codes : [],
            description: record.description || '', 

            // Nested Pricing Data
            monthlyPrice: pricing.monthlyPrice || '',
            annualPrice: pricing.annualPrice || record.packagePrice || '',
            oneTimePrice: pricing.oneTimePrice || '',
            floatingPrice: pricing.floatingPrice || '',
            
            groupType: record.groupType || '', // Retained as data
            youtubeLink: record.youtubeLink || '',
            downloadUrl: record.downloadUrl || '',
            packageInfo: Array.isArray(record.packageInfo) ? record.packageInfo.join(', ') : '',
          };
        });
        
        setPackages(flattenedData);
        originalPackagesRef.current = JSON.parse(JSON.stringify(flattenedData));
        setHasMore(data.hasMore); 
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to load packages.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellChange = (id, field, value) => {
    const updatedPackages = packages.map(pkg => 
      pkg.id === id ? { ...pkg, [field]: value } : pkg
    );
    setPackages(updatedPackages);

    const currentPackage = updatedPackages.find(p => p.id === id);
    const originalPackage = originalPackagesRef.current.find(p => p.id === id);

    if (!currentPackage || !originalPackage) return;

    const normalize = (val) => {
      if (val === null || val === undefined) return '';
      if (Array.isArray(val)) return [...val].sort().join(','); // Handle array comparisons properly
      const num = parseFloat(val);
      if (typeof val === 'string' && isNaN(Number(val))) return val.trim();
      return isNaN(num) ? String(val).trim() : num;
    };

    const isDifferent = Object.keys(currentPackage).some(key => {
      if (key === 'id') return false; 
      const currentVal = normalize(currentPackage[key]);
      const originalVal = normalize(originalPackage[key]);
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
    const packageToDelete = packages.find(p => p.id === selectedId);
    if (!packageToDelete) return;

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${packageToDelete.packageName || 'this package'}"?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // The backend expects the GHL record ID for deletion
      const response = await fetch(`/api/packages?id=${packageToDelete._ghlRecordId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');

      setPackages(prev => prev.filter(p => p.id !== selectedId));
      setDirtyRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedId);
        return newSet;
      });
      setSelectedId(null);
      setStatus({ type: 'success', message: 'Package deleted.' });
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

    const rowsToSave = packages.filter(p => dirtyRows.has(p.id));
    let successCount = 0;

    for (const rowData of rowsToSave) {
      try {
        const payload = {
          // Primary Backoffice Fields
          id: rowData.package_uuid,
          package_name: rowData.packageName,
          package_code: rowData.packageCode,
          product_codes: rowData.productCodes,
          status: rowData.status,
          exclusive_package: rowData.exclusivePackage,
          
          // GHL Extra Fields
          pricing: {
            monthlyPrice: rowData.monthlyPrice,
            annualPrice: rowData.annualPrice,
            oneTimePrice: rowData.oneTimePrice,
            floatingPrice: rowData.floatingPrice,
          },
          description: rowData.description, 
          packageInfo: typeof rowData.packageInfo === 'string' ? rowData.packageInfo.split(',').map(s => s.trim()).filter(Boolean) : rowData.packageInfo,
          groupType: rowData.groupType, // Still submitting groupType data
          youtubeLink: rowData.youtubeLink, 
          downloadUrl: rowData.downloadUrl
        };

        const formData = new FormData();
        formData.append('recordId', rowData._ghlRecordId || ''); // Pass GHL ID to trigger CRM update
        formData.append('packagePayload', JSON.stringify(payload));

        const response = await fetch('/api/packages', { method: 'PATCH', body: formData });
        if (response.ok) successCount++;
      } catch (error) {
        console.error("Save error:", error);
      }
    }

    setIsSavingAll(false);
    setDirtyRows(new Set());
    originalPackagesRef.current = JSON.parse(JSON.stringify(packages));
    
    setStatus({ type: 'success', message: `Successfully updated ${successCount} packages!` });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handlePageChange = (direction) => {
    if (dirtyRows.size > 0 && !window.confirm("Leave without saving? Changes will be lost.")) return;
    
    setDirtyRows(new Set());
    setSelectedId(null);
    if (direction === 'next' && hasMore) setCurrentPage(prev => prev + 1);
    else if (direction === 'prev' && currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // --- Modal Handlers ---
  const openDescriptionModal = () => {
    const pkg = packages.find(p => p.id === selectedId);
    if (pkg) {
      setTempDescription(pkg.description || '');
      setIsDescModalOpen(true);
    }
  };

  const saveDescription = () => {
    handleCellChange(selectedId, 'description', tempDescription);
    setIsDescModalOpen(false);
  };

  const openProductsModal = () => {
    const pkg = packages.find(p => p.id === selectedId);
    if (pkg) {
      setTempProducts([...pkg.productCodes]); // Load the codes array
      setIsProductsModalOpen(true);
    }
  };

  const toggleProductSelection = (productCode) => {
    setTempProducts(prev => {
      if (prev.includes(productCode)) {
        return prev.filter(code => code !== productCode);
      } else {
        return [...prev, productCode];
      }
    });
  };

  const saveProducts = () => {
    handleCellChange(selectedId, 'productCodes', tempProducts);
    setIsProductsModalOpen(false);
  };

  const thClass = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-emerald-400/80 whitespace-nowrap bg-[#0a0f1c] sticky top-0 z-10 border-b border-blue-500/20";
  const tdClass = "border-b border-blue-500/10 whitespace-nowrap";
  const inputClass = "w-full bg-transparent border-none text-blue-50 px-4 py-3 focus:outline-none transition-colors placeholder:text-blue-200/20";

  return (
    <>
      <div className="relative z-10 mx-auto w-full px-6 pt-10 pb-20">
        <div className="bg-[#0a0f1c]/90 border border-emerald-500/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.05)] flex flex-col h-[85vh]">
          
          <div className="p-6 md:p-8 border-b border-blue-500/10 flex flex-wrap gap-4 items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-8 w-2 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></div>
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                PACKAGE <span className="text-emerald-400 font-light">EDITOR</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              {status.message && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${status.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  {status.message}
                </div>
              )}

              {/* Action Buttons for Selected Row */}
              {selectedId && (
                <div className="flex gap-2 animate-in zoom-in-95">
                  <button
                    onClick={openProductsModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-500/10 text-teal-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                  >
                    <Layers size={18} />
                    Update Products
                  </button>
                  <button
                    onClick={openDescriptionModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-500/10 text-emerald-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5' 
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
                <Loader2 className="animate-spin text-emerald-400" size={32} />
                Fetching Packages...
              </div>
            ) : (
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className={`${thClass} min-w-[300px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]`}>Package Name</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Monthly Price</th>
                    <th className={thClass}>Annual Price</th>
                    <th className={thClass}>One Time Price</th>
                    <th className={thClass}>Floating Price</th>
                    <th className={thClass}>Package Info</th>
                    <th className={thClass}>Youtube</th>
                    <th className={thClass}>Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10 text-blue-100">
                  {packages.map((row) => {
                    const isDirty = dirtyRows.has(row.id);
                    const isSelected = selectedId === row.id;
                    
                    return (
                      <tr 
                        key={row.id} 
                        onClick={() => setSelectedId(row.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? 'bg-emerald-500/10' : 'hover:bg-blue-950/20'
                        }`}
                      >
                        <td className={`${tdClass} sticky left-0 z-10 ${isSelected ? 'bg-[#12262a]' : 'bg-[#0a0f1c]'} group-hover:bg-[#0c1a28] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] min-w-[300px]`}>
                          <div className="flex items-center relative pl-4">
                            {isDirty && <div className="absolute left-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]"></div>}
                            <input 
                              className={`${inputClass} font-medium ${isDirty ? 'text-emerald-300' : ''}`} 
                              value={row.packageName} 
                              onChange={(e) => handleCellChange(row.id, 'packageName', e.target.value)} 
                            />
                          </div>
                        </td>
                        <td className={tdClass}>
                          <select 
                            className={`${inputClass} cursor-pointer hover:bg-white/5 transition-colors ${
                              row.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                            value={row.status} 
                            onChange={(e) => handleCellChange(row.id, 'status', e.target.value)}
                          >
                            <option value="AVAILABLE" className="bg-[#0a0f1c] text-emerald-400">AVAILABLE</option>
                            <option value="NOT_AVAILABLE" className="bg-[#0a0f1c] text-amber-400">NOT AVAILABLE</option>
                          </select>
                        </td>
                        <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.monthlyPrice} onChange={(e) => handleCellChange(row.id, 'monthlyPrice', e.target.value)} /></td>
                        <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.annualPrice} onChange={(e) => handleCellChange(row.id, 'annualPrice', e.target.value)} /></td>
                        <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.oneTimePrice} onChange={(e) => handleCellChange(row.id, 'oneTimePrice', e.target.value)} /></td>
                        <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.floatingPrice} onChange={(e) => handleCellChange(row.id, 'floatingPrice', e.target.value)} /></td>
                        <td className={tdClass}><input className={inputClass} value={row.packageInfo} placeholder="Comma separated features" onChange={(e) => handleCellChange(row.id, 'packageInfo', e.target.value)} /></td>
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
              Page <span className="text-emerald-400">{currentPage}</span>
              {dirtyRows.size > 0 && (
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                  {dirtyRows.size} unsaved rows
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1 || isLoading} className="p-2 rounded-lg border border-blue-500/20 hover:text-emerald-400 disabled:opacity-30">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => handlePageChange('next')} disabled={!hasMore || isLoading} className="p-2 rounded-lg border border-blue-500/20 hover:text-emerald-400 disabled:opacity-30">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Products Selector Modal */}
      {isProductsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0c1328] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-blue-500/20 flex justify-between items-center bg-[#0a0f1c]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="text-emerald-400" size={20} />
                Manage Included Products
              </h3>
              <button 
                onClick={() => setIsProductsModalOpen(false)} 
                className="text-blue-400/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body (Multi-Select List) */}
            <div className="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar bg-[#0a0f1c]/50">
              {isLoadingProducts ? (
                <div className="flex justify-center items-center py-10 text-blue-200/50 text-sm animate-pulse">
                  Loading available products...
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="text-center py-10 text-blue-200/50 text-sm">
                  No products found in database.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableProducts.map(product => {
                    const isSelected = tempProducts.includes(product.code);
                    return (
                      <div 
                        key={product.id}
                        onClick={() => toggleProductSelection(product.code)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-blue-950/20 border-blue-500/10 hover:bg-blue-900/40 hover:border-blue-500/30'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-[#0A1025]' : 'border-blue-500/50'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-emerald-300 font-medium' : 'text-blue-100'}`}>
                          {product.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-blue-500/20 flex justify-end gap-3 bg-[#0a0f1c]">
              <button 
                onClick={() => setIsProductsModalOpen(false)} 
                className="px-5 py-2 rounded-xl font-bold text-sm text-blue-300 hover:bg-blue-900/30 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveProducts} 
                className="px-5 py-2 rounded-xl font-bold text-sm bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
              >
                Apply to Row
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Description Editor Modal */}
      {isDescModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0c1328] border border-emerald-500/30 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            <div className="px-6 py-4 border-b border-blue-500/20 flex justify-between items-center bg-[#0a0f1c]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileEdit className="text-emerald-400" size={20} />
                Update Package Description
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
                className="px-5 py-2 rounded-xl font-bold text-sm bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
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