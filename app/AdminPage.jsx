"use client";

import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { 
  Lock, LayoutDashboard, Mail, LogOut, Eye, X, 
  ClipboardList, Layout, Target, Activity, Compass, Brain, RefreshCw
} from 'lucide-react';
import { getInterpretationBand, getProfileType } from './utils';

// Helper Component for the 4 Categories in the Modal
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
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'data'

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
                  <th className="p-4 text-zinc-400 font-bold text-sm uppercase tracking-wider">Date</th>
                  <th className="p-4 text-zinc-400 font-bold text-sm uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && !loading ? (
                  <tr><td colSpan="5" className="p-10 text-center text-zinc-500">No submissions found.</td></tr>
                ) : (
                  submissions.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium">{item.email}</td>
                      <td className="p-4 text-amber-500 text-sm font-bold uppercase">{item.profileType}</td>
                      <td className="p-4 font-mono font-bold text-white text-lg">{item.results?.overall}%</td>
                      <td className="p-4 text-zinc-400 text-sm">
                        {item.submittedAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => { setSelectedSubmission(item); setActiveTab('summary'); }}
                          className="px-4 py-2 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400 transition shadow-md"
                        >
                          <Eye className="w-3 h-3 mr-2 inline" /> Show Result
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
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            <button 
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* TAB NAV */}
            <div className="flex space-x-1 bg-black p-1 rounded-xl w-fit mb-8 border border-zinc-800">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'summary' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Layout className="w-4 h-4 mr-2" /> User View
              </button>
              <button 
                onClick={() => setActiveTab('data')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'data' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <ClipboardList className="w-4 h-4 mr-2" /> Raw Data
              </button>
            </div>

            {activeTab === 'summary' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Score Header */}
                <div className="text-center p-8 bg-black rounded-3xl border border-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
                  <p className="text-zinc-500 text-xs font-mono mb-2 uppercase tracking-widest">{selectedSubmission.email}</p>
                  <div className="text-6xl font-black text-white mb-4">{selectedSubmission.results.overall}%</div>
                  <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold border ${getInterpretationBand(selectedSubmission.results.overall).bg} ${getInterpretationBand(selectedSubmission.results.overall).color} ${getInterpretationBand(selectedSubmission.results.overall).border}`}>
                    {getInterpretationBand(selectedSubmission.results.overall).label}
                  </div>
                </div>

                {/* Profile Card */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                  <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-1">Performance Profile</h3>
                  <h2 className="text-2xl font-black text-white mb-2">{getProfileType(selectedSubmission.results).title}</h2>
                  <p className="text-zinc-400 leading-relaxed text-sm">{getProfileType(selectedSubmission.results).desc}</p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminSubscaleCard icon={Target} color="from-orange-500 to-amber-500" title="Follow-Through" score={selectedSubmission.results.grit} description="Ability to stick with tasks and long-term goals." />
                  <AdminSubscaleCard icon={Activity} color="from-amber-400 to-yellow-500" title="Impulse Control" score={selectedSubmission.results.selfControl} description="Ability to say no to temptations and maintain standards." />
                  <AdminSubscaleCard icon={Compass} color="from-cyan-400 to-blue-500" title="Direction & Structure" score={selectedSubmission.results.planning} description="Ability to plan ahead and link actions to future goals." />
                  <AdminSubscaleCard icon={Brain} color="from-emerald-400 to-teal-500" title="Adaptability & Learning" score={selectedSubmission.results.adaptability} description="Ability to handle feedback and adjust course." />
                </div>
              </div>
            ) : (
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

            <button 
              onClick={() => setSelectedSubmission(null)}
              className="w-full mt-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition shadow-xl"
            >
              Close Detailed View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}