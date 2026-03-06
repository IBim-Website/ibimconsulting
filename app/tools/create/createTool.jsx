"use client";

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Folder, Layers, Box, ImageIcon, DollarSign, 
  Youtube, Link as LinkIcon, FileCode2, ChevronRight, 
  ChevronLeft, CheckCircle2, List, ListOrdered, Bold, 
  Italic, Strikethrough, X, Check 
} from 'lucide-react';
import { categoriesList, packagesList } from '../constants';

// --- TIPTAP EDITOR COMPONENT ---
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
        class: 'prose prose-invert max-w-none min-h-[150px] p-4 focus:outline-none text-blue-50',
      },
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, icon: Icon }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
          : 'text-blue-200/50 hover:bg-blue-800/30 hover:text-cyan-300 border border-transparent'
      }`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl overflow-hidden focus-within:border-cyan-400/50 focus-within:ring-1 focus-within:ring-cyan-400/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap gap-1 p-2 border-b border-blue-500/20 bg-blue-950/40">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} />
        <div className="w-px h-6 bg-blue-500/20 mx-1 self-center" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

// --- MAIN WIZARD COMPONENT ---
export default function ProductUploadWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Custom Dropdown State
  const [openDropdown, setOpenDropdown] = useState(null); 

  const [formData, setFormData] = useState({
    category: [],     // Updated to Array for multi-select
    subCategory: [],  // Updated to Array for multi-select
    productName: '', annualPrice: '', oneTimePrice: '',
    monthlyPrice: '', singleSystemPrice: '', actualAnnualPrice: '', actualOneTimePrice: '',
    actualMonthlyPrice: '', actualSingleSystemPrice: '', youtubeLink: '', productCode: '',
    downloadUrl: '', description: '',
  });
  
  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // New function to handle Multi-Select toggling
  const toggleSelection = (field, item) => {
    setFormData(prev => {
      const list = prev[field] || []; // Added the || [] fallback here
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleDescriptionChange = (html) => {
    setFormData(prev => ({ ...prev, description: html }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setStatus({ type: 'error', message: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' });
        setImageFile(null);
        e.target.value = ''; 
        return;
      }
      setStatus({ type: '', message: '' });
      setImageFile(file);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const submitData = new FormData();
      submitData.append('productCode', formData.productCode);
      if (imageFile) submitData.append('image', imageFile);

      const productPayload = {
        productName: formData.productName,
        category: formData.category,       // Array of strings
        subCategory: formData.subCategory, // Array of strings
        pricing: {
          annualPrice: formData.annualPrice, oneTimePrice: formData.oneTimePrice,
          monthlyPrice: formData.monthlyPrice, singleSystemPrice: formData.singleSystemPrice,
          actualAnnualPrice: formData.actualAnnualPrice, actualOneTimePrice: formData.actualOneTimePrice,
          actualMonthlyPrice: formData.actualMonthlyPrice, actualSingleSystemPrice: formData.actualSingleSystemPrice,
        },
        links: { youtubeLink: formData.youtubeLink, downloadUrl: formData.downloadUrl },
        description: formData.description
      };
      
      submitData.append('productPayload', JSON.stringify(productPayload));

      const response = await fetch('/api/products', { method: 'POST', body: submitData });
      const result = await response.json();

      if (!response.ok) {
        const isDuplicate = result.details?.errors?.some(err => err.errorCode === 'primary_property_conflict');
        if (isDuplicate) {
          throw new Error(`The Product Code "${formData.productCode}" already exists. Please use a unique code.`);
        }
        throw new Error(result.details?.message || result.error || 'Failed to upload product');
      }

      setStatus({ type: 'success', message: 'Product successfully added to the database!' });
      
      setTimeout(() => {
        setStep(1);
        setStatus({ type: '', message: '' });
        setFormData({
          category: [], subCategory: [], productName: '', annualPrice: '', oneTimePrice: '',
          monthlyPrice: '', singleSystemPrice: '', actualAnnualPrice: '', actualOneTimePrice: '',
          actualMonthlyPrice: '', actualSingleSystemPrice: '', youtubeLink: '', productCode: '', downloadUrl: '', description: ''
        });
        setImageFile(null);
      }, 3000); 
      
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputWrapper = "relative group";
  const inputClass = "w-full bg-blue-950/20 border border-blue-500/20 rounded-xl pl-11 pr-4 py-3 text-blue-50 placeholder:text-blue-200/20 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]";
  const iconClass = "absolute left-4 top-3.5 text-blue-400/50 group-focus-within:text-cyan-400 transition-colors z-10";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-cyan-400/80 mb-2 ml-1";

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-6 pt-10 pb-20">
      
      <style>{`
        .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose p { margin-bottom: 0.5rem; }
        .prose p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); float: left; color: rgba(191, 219, 254, 0.2); pointer-events: none; height: 0;
        }
      `}</style>

      <div className="bg-[#0a0f1c]/80 border border-blue-500/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-[0_0_80px_rgba(34,211,238,0.05)] relative z-10">
        
        <div className="mb-10 border-b border-blue-500/10 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
              ADD <span className="text-cyan-400 font-light">PRODUCT</span>
            </h2>
          </div>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-blue-950/50 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${step >= num ? 'bg-[#0a0f1c] border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-[#0a0f1c] border-blue-900/50 text-blue-500/50'}`}>
                {step > num ? <CheckCircle2 size={20} className="text-cyan-400" /> : <span className="font-bold">{num}</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-blue-300/50 mt-3 uppercase tracking-wider px-1">
            <span className={step >= 1 ? 'text-cyan-400' : ''}>Basics</span>
            <span className={step >= 2 ? 'text-cyan-400' : ''}>Pricing</span>
            <span className={step >= 3 ? 'text-cyan-400' : ''}>Details</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px] flex flex-col justify-between">
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative z-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Custom Category Multi-Select */}
                <div className={`relative ${openDropdown === 'category' ? 'z-50' : 'z-10'}`}>
                  {/* LOCAL BACKDROP */}
                  {openDropdown === 'category' && (
                    <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                  )}

                  <label className={labelClass}>Category</label>
                  <div 
                    className={`${inputWrapper} relative z-50`}
                    onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                  >
                    <Folder className={iconClass} size={20} />
                    <div className={`${inputClass} flex items-center flex-wrap gap-2 min-h-[48px] cursor-pointer cursor-text`}>
                      {formData.category.length === 0 ? (
                        <span className="text-blue-200/20">Select Categories</span>
                      ) : (
                        formData.category.map(c => (
                          <span key={c} className="bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-md text-xs border border-cyan-500/20 flex items-center gap-1.5 backdrop-blur-md">
                            {c}
                            <X size={12} className="hover:text-cyan-100 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection('category', c); }} />
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Category Dropdown Menu */}
                  {openDropdown === 'category' && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0A1025] border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {categoriesList.filter(cat => cat !== "All").map(cat => (
                        <div 
                          key={cat} 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-900/40 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection('category', cat);
                          }}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.category.includes(cat) ? 'bg-cyan-500 border-cyan-500 text-[#0A1025]' : 'border-blue-500/50'}`}>
                            {formData.category.includes(cat) && <Check size={14} strokeWidth={3} />}
                          </div>
                          <span className="text-blue-50 text-sm">{cat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Sub Category Multi-Select */}
                <div className={`relative ${openDropdown === 'subCategory' ? 'z-50' : 'z-10'}`}>
                  {/* LOCAL BACKDROP */}
                  {openDropdown === 'subCategory' && (
                    <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                  )}

                  <label className={labelClass}>Sub Category (Package)</label>
                  <div 
                    className={`${inputWrapper} relative z-50`}
                    onClick={() => setOpenDropdown(openDropdown === 'subCategory' ? null : 'subCategory')}
                  >
                    <Layers className={iconClass} size={20} />
                    <div className={`${inputClass} flex items-center flex-wrap gap-2 min-h-[48px] cursor-pointer cursor-text`}>
                      {formData.subCategory.length === 0 ? (
                        <span className="text-blue-200/20">Select Sub-Categories</span>
                      ) : (
                        formData.subCategory.map(pkg => (
                          <span key={pkg} className="bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-md text-xs border border-amber-500/20 flex items-center gap-1.5 backdrop-blur-md">
                            {pkg}
                            <X size={12} className="hover:text-amber-100 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelection('subCategory', pkg); }} />
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sub Category Dropdown Menu */}
                  {openDropdown === 'subCategory' && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0A1025] border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {packagesList.filter(pkg => pkg !== "All").map(pkg => (
                        <div 
                          key={pkg} 
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-900/40 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection('subCategory', pkg);
                          }}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.subCategory.includes(pkg) ? 'bg-amber-500 border-amber-500 text-[#0A1025]' : 'border-blue-500/50'}`}>
                            {formData.subCategory.includes(pkg) && <Check size={14} strokeWidth={3} />}
                          </div>
                          <span className="text-blue-50 text-sm">{pkg}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <label className={labelClass}>Product Name</label>
                  <div className={inputWrapper}>
                    <Box className={iconClass} size={20} />
                    <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} placeholder="e.g. Dynamic Concrete Beam" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Product Image</label>
                  <div className="relative group w-full h-[46px] bg-blue-950/20 border-2 border-dashed border-blue-500/30 rounded-xl hover:border-cyan-400/50 hover:bg-cyan-900/10 transition-all flex items-center px-4 overflow-hidden">
                    <input id="image-upload" type="file" accept=".jpg,.jpeg,.png,.gif" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex items-center gap-3 text-sm text-blue-200/50 group-hover:text-cyan-300 transition-colors pl-7">
                      <ImageIcon className={iconClass} size={20} />
                      {imageFile ? <span className="text-cyan-400 font-medium truncate max-w-[200px]">{imageFile.name}</span> : <span>Upload Cover Image</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRICING */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Annual Price', name: 'annualPrice' },
                  { label: 'One Time Price', name: 'oneTimePrice' },
                  { label: 'Monthly Price', name: 'monthlyPrice' },
                  { label: 'Single System Price', name: 'singleSystemPrice' },
                  { label: 'Actual Annual', name: 'actualAnnualPrice' },
                  { label: 'Actual One Time', name: 'actualOneTimePrice' },
                  { label: 'Actual Monthly', name: 'actualMonthlyPrice' },
                  { label: 'Actual Single Sys', name: 'actualSingleSystemPrice' }
                ].map((field) => (
                  <div key={field.name}>
                    <label className={labelClass}>{field.label}</label>
                    <div className={inputWrapper}>
                      <DollarSign className={iconClass} size={20} />
                      <input type="number" step="any" name={field.name} value={formData[field.name]} onChange={handleInputChange} placeholder="0.00" className={inputClass} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Product Code</label>
                  <div className={inputWrapper}>
                    <FileCode2 className={iconClass} size={20} />
                    <input type="text" name="productCode" required value={formData.productCode} onChange={handleInputChange} placeholder="UNIQUE_CODE" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Youtube Link</label>
                  <div className={inputWrapper}>
                    <Youtube className={iconClass} size={20} />
                    <input type="url" name="youtubeLink" value={formData.youtubeLink} onChange={handleInputChange} placeholder="https://youtube.com/..." className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Download URL</label>
                  <div className={inputWrapper}>
                    <LinkIcon className={iconClass} size={20} />
                    <input type="url" name="downloadUrl" value={formData.downloadUrl} onChange={handleInputChange} placeholder="https://..." className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <RichTextEditor description={formData.description} onChange={handleDescriptionChange} />
              </div>

              {/* Alerts */}
              {status.message && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${status.type === 'error' ? 'bg-red-950/30 text-red-400 border border-red-500/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'}`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${status.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  {status.message}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-blue-500/10 flex items-center justify-between mt-8 relative z-10">
            <button 
              type="button" 
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold tracking-wide transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-blue-300 hover:text-cyan-400 hover:bg-blue-900/30'}`}
            >
              <ChevronLeft size={20} /> Back
            </button>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-white font-bold tracking-wide transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    {step === 3 ? 'Publish Product' : 'Next Step'} 
                    {step !== 3 && <ChevronRight size={20} />}
                  </>
                )}
              </span>
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}