import React from 'react';
import { Loader2 } from 'lucide-react';

const ProductTable = ({ 
  products, 
  isLoading, 
  dirtyRows, 
  selectedId, 
  onSelectRow, 
  onCellChange 
}) => {
  const thClass = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-400/80 whitespace-nowrap bg-[#0a0f1c] sticky top-0 z-10 border-b border-blue-500/20";
  const tdClass = "border-b border-blue-500/10 whitespace-nowrap";
  const inputClass = "w-full bg-transparent border-none text-blue-50 px-4 py-3 focus:outline-none transition-colors placeholder:text-blue-200/20";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-blue-400/50 gap-4 uppercase tracking-widest text-xs font-bold">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        Fetching Records...
      </div>
    );
  }

  return (
    <table className="w-full text-sm border-separate border-spacing-0">
      <thead>
        <tr>
          <th className={`${thClass} min-w-[350px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]`}>Product Name</th>
          <th className={thClass}>Status</th>
          {/* UPDATED: Added min-w-[250px] to make category wider */}
          <th className={`${thClass} min-w-[250px]`}>Category</th>
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
              onClick={() => onSelectRow(row.id)}
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
                    onChange={(e) => onCellChange(row.id, 'productName', e.target.value)} 
                  />
                </div>
              </td>
              
              <td className={tdClass}>
                <select 
                  className={`${inputClass} font-bold cursor-pointer transition-colors ${row.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400 opacity-80'}`}
                  value={row.status}
                  onChange={(e) => onCellChange(row.id, 'status', e.target.value)}
                >
                  <option value="ACTIVE" className="bg-[#0a0f1c] text-emerald-400">ACTIVE</option>
                  <option value="INACTIVE" className="bg-[#0a0f1c] text-red-400">INACTIVE</option>
                </select>
              </td>

              <td className={tdClass}><input className={inputClass} value={row.category} onChange={(e) => onCellChange(row.id, 'category', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.oneTimePrice} onChange={(e) => onCellChange(row.id, 'oneTimePrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.monthlyPrice} onChange={(e) => onCellChange(row.id, 'monthlyPrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.annualPrice} onChange={(e) => onCellChange(row.id, 'annualPrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.singleSystemPrice} onChange={(e) => onCellChange(row.id, 'singleSystemPrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualOneTimePrice} onChange={(e) => onCellChange(row.id, 'actualOneTimePrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualMonthlyPrice} onChange={(e) => onCellChange(row.id, 'actualMonthlyPrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} type="number" step="any" value={row.actualAnnualPrice} onChange={(e) => onCellChange(row.id, 'actualAnnualPrice', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} value={row.youtubeLink} onChange={(e) => onCellChange(row.id, 'youtubeLink', e.target.value)} /></td>
              <td className={tdClass}><input className={inputClass} value={row.downloadUrl} onChange={(e) => onCellChange(row.id, 'downloadUrl', e.target.value)} /></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
};

export default ProductTable;