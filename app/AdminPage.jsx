"use client";

import React, { useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { pdf } from '@react-pdf/renderer';
import AssessmentPdfReport from './AssessmentPdfReport'; // Adjust path
import { 
  Lock, LayoutDashboard, Mail, LogOut, Eye, X, 
  ClipboardList, Layout, Target, Activity, Compass, 
  Brain, RefreshCw, Download, Sparkles, CheckCircle2 
} from 'lucide-react';
import { getInterpretationBand, getProfileType } from './utils';

const PaidBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
      <CheckCircle2 size={14} strokeWidth={2.5} />
      <span className="text-xs font-bold uppercase tracking-wide">Paid</span>
    </div>
  );
};

function AdminSubscaleCard({ icon: Icon, color, title, score, description }) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-2xl flex items-start space-x-4">
      <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-black shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <span className="text-amber-500 font-mono font-bold text-sm">{score}%</span>
        </div>
        <p className="text-zinc-500 text-[11px] leading-tight">{description}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Add this right under const modalRef = useRef(null);
  const printRef = useRef(null);
  
  // Tabs: 'summary', 'data', 'ai'
  const [activeTab, setActiveTab] = useState('summary'); 
  
  // AI & Export States
  const modalRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      fetchSubmissions();
    } else {
      alert('Invalid Credentials');
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: GENERATE AI INSIGHTS ---
  const handleGenerateInsights = async () => {
    if (!selectedSubmission) return;
    setIsGenerating(true);

    const payload = {
      email: selectedSubmission.email,
      answers: selectedSubmission.answers,
      results: selectedSubmission.results,
      profileType: selectedSubmission.profileType
    };

    try {
      // 1. Fetch from API
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyData: payload }),
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // 2. Update Firestore document with new insights
      const docRef = doc(db, "submissions", selectedSubmission.id);
      await updateDoc(docRef, { aiInsights: data.insights });

      // 3. Update local state to show UI immediately
      const updatedSubmission = { ...selectedSubmission, aiInsights: data.insights };
      setSelectedSubmission(updatedSubmission);
      setSubmissions(submissions.map(sub => sub.id === selectedSubmission.id ? updatedSubmission : sub));
      
      // Force tab switch to see the results
      setActiveTab('ai');

    } catch (error) {
      console.error("Error generating insights:", error);
      alert("Failed to generate AI insights.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedSubmission) return;
    setIsExporting(true);

    try {
      // 1. Compile the React-PDF document into a Blob
      const blob = await pdf(<AssessmentPdfReport submission={selectedSubmission} />).toBlob();
      
      // 2. Create a temporary URL and trigger the browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Analysis_${selectedSubmission.email}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // 3. Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500/10 p-4 rounded-2xl">
              <Lock className="text-amber-500 w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">Admin Portal</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" placeholder="Username" 
              className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" 
              className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <LayoutDashboard className="mr-3 text-amber-500" /> Assessment Leads
            </h1>
            <p className="text-zinc-500 mt-1">Review user performance and quiz data.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchSubmissions} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-sm flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition text-sm flex items-center">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  <th className="p-4 text-zinc-400 font-bold text-sm uppercase tracking-wider">Email</th>
                  <th className="p-4 text-zinc-400 font-bold text-sm uppercase tracking-wider">Profile</th>
                  <th className="p-4 text-zinc-400 font-bold text-sm uppercase tracking-wider">Score</th>
                  <th className="p-4 text-zinc-400 font-bold text-sm uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && !loading ? (
                  <tr><td colSpan="4" className="p-10 text-center text-zinc-500">No submissions found.</td></tr>
                ) : (
                  submissions.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium">{item.email}</td>
                      <td className="p-4 text-amber-500 text-sm font-bold uppercase">{item.profileType}</td>
                      <td className="p-4 font-mono font-bold text-white text-lg">{item.results?.overall}%</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {/* Indicate if AI Report exists in the table */}
                        {item.aiInsights && <Sparkles className="w-4 h-4 text-emerald-500 mt-2 mr-2" />}
                        <button 
                          onClick={() => { setSelectedSubmission(item); setActiveTab('summary'); }}
                          className="px-4 py-2 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition shadow-md"
                        >
                          <Eye className="w-3 h-3 mr-2 inline" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- RESULT DETAILS MODAL --- */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            <button 
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* HEADER CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2 sm:mt-0">
              
              {/* TAB NAV */}
              <div className="flex space-x-1 bg-black p-1 rounded-xl w-fit border border-zinc-800 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'summary' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Layout className="w-4 h-4 mr-2" /> Summary
                </button>
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'data' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <ClipboardList className="w-4 h-4 mr-2" /> Raw Data
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'ai' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Brain className="w-4 h-4 mr-2" /> AI Report
                </button>
              </div>

              {/* ACTION BUTTONS */}
<div className="flex items-center gap-2">
  {selectedSubmission?.paid && <PaidBadge />}
  <button 
    onClick={handleGenerateInsights}
    disabled={isGenerating}
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 
      ${selectedSubmission.aiInsights 
        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700' 
        : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
  >
    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} /> 
    {isGenerating 
      ? 'Analyzing...' 
      : (selectedSubmission.aiInsights ? 'Get New Report' : 'Generate AI Insight')}
  </button>
  
  <button 
    onClick={handleExportPDF}
    disabled={isExporting || isGenerating}
    className="flex items-center px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-bold hover:bg-amber-500 hover:text-black transition disabled:opacity-50"
  >
    <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} /> 
    Export PDF
  </button>
</div>
            </div>

            {/* CONTENT TO EXPORT (Wrapped in modalRef) */}
            <div ref={modalRef} className="bg-zinc-900 p-4 -m-4 rounded-2xl">
              
              {/* TAB 1: SUMMARY */}
              {activeTab === 'summary' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-center p-8 bg-black rounded-3xl border border-zinc-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
                    <p className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-widest">{selectedSubmission.email}</p>
                    <div className="text-6xl font-black text-white mb-4">{selectedSubmission.results.overall}%</div>
                    <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold border ${getInterpretationBand(selectedSubmission.results.overall).bg} ${getInterpretationBand(selectedSubmission.results.overall).color} ${getInterpretationBand(selectedSubmission.results.overall).border}`}>
                      {getInterpretationBand(selectedSubmission.results.overall).label}
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
                    <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-1">Performance Profile</h3>
                    <h2 className="text-2xl font-black text-white mb-2">{getProfileType(selectedSubmission.results).title}</h2>
                    <p className="text-zinc-400 leading-relaxed text-sm">{getProfileType(selectedSubmission.results).desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdminSubscaleCard icon={Target} color="from-orange-500 to-amber-500" title="Follow-Through" score={selectedSubmission.results.grit} description="Ability to stick with tasks and long-term goals." />
                    <AdminSubscaleCard icon={Activity} color="from-amber-400 to-yellow-500" title="Impulse Control" score={selectedSubmission.results.selfControl} description="Ability to say no to temptations." />
                    <AdminSubscaleCard icon={Compass} color="from-cyan-400 to-blue-500" title="Direction & Structure" score={selectedSubmission.results.planning} description="Ability to plan ahead and link actions to future goals." />
                    <AdminSubscaleCard icon={Brain} color="from-emerald-400 to-teal-500" title="Adaptability & Learning" score={selectedSubmission.results.adaptability} description="Ability to handle feedback and adjust course." />
                  </div>
                </div>
              )}

              {/* TAB 2: RAW DATA */}
              {activeTab === 'data' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(selectedSubmission.results).map(([key, val]) => (
                      key !== 'overall' && (
                        <div key={key} className="bg-black p-4 rounded-xl border border-zinc-800">
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-xl font-bold text-amber-500">{val}%</p>
                        </div>
                      )
                    ))}
                  </div>

                  <div className="bg-black p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-sm font-bold mb-4 text-zinc-300 flex items-center">
                      <ClipboardList className="w-4 h-4 mr-2 text-amber-500" /> Answer Key (Q1-Q25)
                    </h3>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {selectedSubmission.answers.map((val, idx) => (
                        <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg py-2 flex flex-col items-center">
                          <span className="text-[9px] text-zinc-500">Q{idx+1}</span>
                          <span className="text-sm font-bold text-white">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI REPORT */}
{/* TAB 3: AI REPORT */}
{activeTab === 'ai' && (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
    {selectedSubmission.aiInsights ? (
      <div className="bg-zinc-950 p-8 rounded-3xl border border-emerald-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Sparkles className="w-6 h-6 text-emerald-400 mr-3" /> 
          Full Report
        </h3>
        
        {/* --- REACT MARKDOWN INTEGRATION --- */}
        <div className="relative z-10 pb-8">
          <ReactMarkdown
            components={{
              // Added h3 styling because the AI prompt was instructed to use ### for sections
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-4 border-b border-zinc-800 pb-2" {...props} />,
              // Changed text-black to text-emerald-400 to pop on the dark theme
              strong: ({node, ...props}) => <strong className="font-bold text-yellow-400" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-zinc-300 leading-relaxed text-sm sm:text-base" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-zinc-300" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-zinc-300" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              a: ({node, ...props}) => (
                <a 
                  className="text-yellow-400 underline font-semibold hover:text-yellow-300 transition-colors" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  {...props} 
                />
              ),
            }}
          >
            {selectedSubmission.aiInsights}
          </ReactMarkdown>
        </div>

        {/* Bottom Regenerate Button */}
        <div className="relative z-10 mt-4 pt-6 border-t border-emerald-500/20 flex justify-end">
           <button 
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-emerald-400 rounded-lg text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} /> 
            {isGenerating ? 'Generating New Report...' : 'Re-run AI Analysis'}
          </button>
        </div>
      </div>
    ) : (
      // ... (Empty State UI remains exactly the same)
      <div className="text-center py-16 bg-black border border-zinc-800 rounded-3xl">
        <Brain className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Report Generated</h3>
        <p className="text-zinc-500 mb-6 text-sm max-w-sm mx-auto">Click the button above to generate a highly detailed, research-backed analysis of this profile.</p>
        <button 
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition flex items-center mx-auto disabled:opacity-50"
        >
          {isGenerating ? <><RefreshCw className="animate-spin w-4 h-4 mr-2" /> Generating...</> : 'Generate Insights Now'}
        </button>
      </div>
    )}
  </div>
)}

            </div>

            <button 
              onClick={() => setSelectedSubmission(null)}
              className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition shadow-xl"
            >
              Close Detailed View
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          HIDDEN PRINT CONTAINER (FOR MULTI-PAGE PDF EXPORT ONLY)
          ========================================================= */}
      {selectedSubmission && (
        <div className="absolute top-[-20000px] left-[-20000px]">
          {/* w-[800px] matches A4 width perfectly */}
          <div ref={printRef} className="w-[800px] bg-zinc-950 text-white p-12">
            
            {/* === PAGE 1: SUMMARY & DATA === */}
            {/* The html-to-pdf pagebreak engine will read this class and force a new page after this block */}
            <div className="html2pdf__page-break flex flex-col mb-12">
              
              <div className="border-b border-zinc-800 pb-6 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black mb-1">Performance Analysis</h1>
                  <p className="text-emerald-500 font-mono text-lg">{selectedSubmission.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black">{selectedSubmission.results.overall}%</div>
                  <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Overall Score</div>
                </div>
              </div>

              <div className="bg-black p-6 rounded-xl border border-zinc-800 mb-8 break-inside-avoid">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Primary Archetype</h3>
                <h2 className="text-2xl font-black text-emerald-400 mb-2">{getProfileType(selectedSubmission.results).title}</h2>
                <p className="text-zinc-300 leading-relaxed">{getProfileType(selectedSubmission.results).desc}</p>
              </div>

              <h3 className="text-lg font-bold border-b border-zinc-800 pb-2 mb-4">Engine Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 mb-10 break-inside-avoid">
                {Object.entries(selectedSubmission.results).map(([key, val]) => {
                  if (key === 'overall') return null;
                  return (
                    <div key={key} className="border border-zinc-800 p-4 rounded-lg flex justify-between items-center bg-black">
                      <span className="font-bold text-zinc-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-mono text-xl font-bold text-emerald-400">{val}%</span>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-lg font-bold border-b border-zinc-800 pb-2 mb-4">Raw Assessment Data</h3>
              <div className="grid grid-cols-5 gap-3 break-inside-avoid">
                {selectedSubmission.answers.map((val, idx) => (
                  <div key={idx} className="border border-zinc-800 p-3 text-center rounded bg-black">
                    <div className="text-[10px] text-zinc-500 mb-1">Q{idx+1}</div>
                    <div className="font-bold text-lg text-white">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* === PAGE 2+: AI RESEARCH ANALYSIS === */}
            <div>
              <h2 className="text-3xl font-black border-b border-zinc-800 pb-4 mb-8">AI Strategy & Research Analysis</h2>
              
              {selectedSubmission.aiInsights ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      // Added break-inside-avoid so headings stick to their paragraphs
                      h3: ({node, ...props}) => <h3 className="text-2xl font-bold text-white mt-10 mb-4 border-b border-zinc-800 pb-2 break-after-avoid" {...props} />,
                      // Put the emerald green back!
                      strong: ({node, ...props}) => <strong className="font-bold text-emerald-400" {...props} />,
                      // Added break-inside-avoid so paragraphs don't get chopped in half
                      p: ({node, ...props}) => <p className="mb-6 text-zinc-300 leading-relaxed text-lg break-inside-avoid" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-zinc-300 text-lg break-inside-avoid" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3 text-zinc-300 text-lg break-inside-avoid" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-400 underline" {...props} />,
                    }}
                  >
                    {selectedSubmission.aiInsights}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-zinc-500 italic text-lg">No AI Strategy Report has been generated for this profile yet.</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}