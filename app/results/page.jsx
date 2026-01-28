"use client";

import React, { useState } from 'react';
import { Brain, Activity, BookOpen, Check, Sparkles } from 'lucide-react';

export default function PersonalityExplorer() {
  const [activeTab, setActiveTab] = useState('MBTI'); // 'MBTI' or 'DISC'
  const [selectedType, setSelectedType] = useState('ESTJ');

  // --- Constants access helpers ---
  const currentKeys = activeTab === 'MBTI' ? Object.keys(MBTI_REPORTS) : Object.keys(DISC_REPORTS);
  
  // FIX: Ensure the selected type actually exists in the current tab's data.
  // If we just switched tabs (e.g., activeTab is DISC but selectedType is still ESTJ), 
  // this forces a fallback to the first item of the new list immediately.
  const safeSelectedType = currentKeys.includes(selectedType) ? selectedType : currentKeys[0];

  const currentContent = activeTab === 'MBTI' ? MBTI_REPORTS[safeSelectedType] : DISC_REPORTS[safeSelectedType];

  // Helper to extract the Title from the HTML string
  const getTitleFromHtml = (htmlContent) => {
    if (!htmlContent) return 'Loading...'; // Safety check to prevent crash
    const match = htmlContent.match(/<h3>(.*?)<\/h3>/);
    return match ? match[1] : 'Unknown Type';
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 font-sans text-slate-300 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header --- */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-full mb-4 border border-slate-800 shadow-xl shadow-emerald-900/10">
            <BookOpen className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Personality <span className="text-emerald-500">Explorer</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Browse the complete catalog of personality archetypes and behavioral styles.
          </p>
        </div>

        {/* --- Tab Switcher --- */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => { setActiveTab('MBTI'); setSelectedType('ESTJ'); }}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all border ${
              activeTab === 'MBTI' 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Brain className="w-5 h-5" /> MBTI Types
          </button>
          <button
            onClick={() => { setActiveTab('DISC'); setSelectedType('D'); }}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all border ${
              activeTab === 'DISC' 
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Activity className="w-5 h-5" /> DISC Profiles
          </button>
        </div>

        {/* --- Main Content Split View --- */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Selection Grid */}
          <div className="lg:col-span-4 h-fit">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
              <h3 className="text-white font-bold mb-4 px-2 uppercase text-xs tracking-wider text-slate-500">
                Select a {activeTab} Profile
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {currentKeys.map((key) => {
                  if (key === 'DEFAULT') return null; // Skip default error handler
                  
                  // Use safeSelectedType for comparison
                  const isActive = safeSelectedType === key; 
                  const reportHtml = activeTab === 'MBTI' ? MBTI_REPORTS[key] : DISC_REPORTS[key];
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`
                        text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden
                        ${isActive 
                          ? 'bg-emerald-600/10 border-emerald-500/50' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800'}
                      `}
                    >
                      <div className="relative z-10">
                        <span className={`block font-black text-lg ${isActive ? 'text-emerald-400' : 'text-white'}`}>
                          {key}
                        </span>
                        <span className="text-xs text-slate-400 truncate block mt-1">
                          {getTitleFromHtml(reportHtml)}
                        </span>
                      </div>
                      
                      {isActive && (
                        <div className="absolute right-2 top-2">
                           <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Detail View */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] relative">
              
              {/* Decorative background glow */}
              <div className={`absolute top-0 right-0 p-40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-20 
                ${activeTab === 'MBTI' ? 'bg-blue-500' : 'bg-purple-500'}`}>
              </div>

              {/* Card Header */}
              <div className="border-b border-slate-800 p-8 relative z-10 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${activeTab === 'MBTI' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                    {activeTab === 'MBTI' 
                      ? <Brain className={`w-8 h-8 ${activeTab === 'MBTI' ? 'text-blue-400' : 'text-purple-400'}`} />
                      : <Activity className={`w-8 h-8 ${activeTab === 'MBTI' ? 'text-blue-400' : 'text-purple-400'}`} />
                    }
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{safeSelectedType}</h2>
                    <p className={`font-medium ${activeTab === 'MBTI' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {getTitleFromHtml(currentContent)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <div 
                  className={`
                    prose prose-invert max-w-none 
                    prose-headings:text-slate-200 prose-headings:font-bold prose-headings:text-xl prose-headings:mb-4
                    prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg
                    prose-strong:text-emerald-400
                    [&>h3]:hidden  /* Hide the h3 inside the content since we displayed it in the header */
                  `}
                  dangerouslySetInnerHTML={{ __html: currentContent }} 
                />
                
                <div className="mt-8 pt-8 border-t border-slate-800 flex items-center gap-3 text-slate-500 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>This is a standardized profile overview.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// =========================================================================
// DATA CONSTANTS 
// =========================================================================

const MBTI_REPORTS = {
  'ESTJ': '<h3>The Executive</h3><p>Practical, organized, and assertive. You excel at managing people and processes, ensuring efficiency. You value tradition and rules.</p><p><strong>Strengths:</strong> Leadership, reliability, decisiveness.<br/><strong>Growth:</strong> Empathy and flexibility.</p>',
  'ESFJ': '<h3>The Consul</h3><p>Warm, sociable, and committed to helping others. You create harmony and are great at organizing events.</p><p><strong>Strengths:</strong> Empathy, organization, loyalty.<br/><strong>Growth:</strong> Setting boundaries and handling criticism.</p>',
  'ENTJ': '<h3>The Commander</h3><p>Strategic and ambitious with a drive to lead. You excel in planning and motivating teams.</p><p><strong>Strengths:</strong> Strategy, confidence, efficiency.<br/><strong>Growth:</strong> Patience and emotional awareness.</p>',
  'ENFJ': '<h3>The Protagonist</h3><p>Charismatic and empathetic. You guide others toward growth and build supportive communities.</p><p><strong>Strengths:</strong> Inspiration, leadership, empathy.<br/><strong>Growth:</strong> Avoiding overextension.</p>',
  'ESTP': '<h3>The Entrepreneur</h3><p>Energetic and adaptable. You thrive on action and troubleshooting in the moment.</p><p><strong>Strengths:</strong> Quick thinking, risk-taking, practicality.<br/><strong>Growth:</strong> Long-term planning.</p>',
  'ESFP': '<h3>The Entertainer</h3><p>Lively and spontaneous. You bring joy to others and live in the present.</p><p><strong>Strengths:</strong> Charisma, adaptability, aesthetics.<br/><strong>Growth:</strong> Discipline and conflict resolution.</p>',
  'ENTP': '<h3>The Debater</h3><p>Innovative and quick-witted. You love exploring ideas and challenging the status quo.</p><p><strong>Strengths:</strong> Creativity, strategy, curiosity.<br/><strong>Growth:</strong> Follow-through and sensitivity.</p>',
  'ENFP': '<h3>The Campaigner</h3><p>Enthusiastic and creative. You are driven by ideals and inspire others with your vision.</p><p><strong>Strengths:</strong> Innovation, empathy, sociability.<br/><strong>Growth:</strong> Organization and routine.</p>',
  'ISTJ': '<h3>The Logistician</h3><p>Reliable and logical. You are committed to duty and excel in structured tasks.</p><p><strong>Strengths:</strong> Integrity, thoroughness, dependability.<br/><strong>Growth:</strong> Adaptability to change.</p>',
  'ISFJ': '<h3>The Defender</h3><p>Kind and loyal. You are dedicated to protecting and supporting loved ones.</p><p><strong>Strengths:</strong> Reliability, nurturing, detail-oriented.<br/><strong>Growth:</strong> Assertiveness.</p>',
  'INTJ': '<h3>The Architect</h3><p>Strategic and independent. You design complex systems for long-term success.</p><p><strong>Strengths:</strong> Intelligence, foresight, determination.<br/><strong>Growth:</strong> Interpersonal warmth.</p>',
  'INFJ': '<h3>The Advocate</h3><p>Insightful and principled. You are committed to meaningful causes and understanding people.</p><p><strong>Strengths:</strong> Intuition, creativity, dedication.<br/><strong>Growth:</strong> Practicality and burnout prevention.</p>',
  'ISTP': '<h3>The Virtuoso</h3><p>Practical and analytical. You excel in hands-on problem solving and exploration.</p><p><strong>Strengths:</strong> Adaptability, technical skills, calmness.<br/><strong>Growth:</strong> Emotional expression.</p>',
  'ISFP': '<h3>The Adventurer</h3><p>Gentle and artistic. You live in the moment with strong values and aesthetics.</p><p><strong>Strengths:</strong> Creativity, empathy, flexibility.<br/><strong>Growth:</strong> Planning and assertiveness.</p>',
  'INTP': '<h3>The Logician</h3><p>Innovative and curious. You delve deeply into theories and abstract ideas.</p><p><strong>Strengths:</strong> Analysis, objectivity, originality.<br/><strong>Growth:</strong> Social engagement and practicality.</p>',
  'INFP': '<h3>The Mediator</h3><p>Empathetic and idealistic. You seek authenticity and help others find their path.</p><p><strong>Strengths:</strong> Compassion, imagination, integrity.<br/><strong>Growth:</strong> Decisiveness and handling criticism.</p>',
  'DEFAULT': '<h3>Type Uncertain</h3><p>Please ensure you answered all questions consistently.</p>'
};

const DISC_REPORTS = {
  'D': '<h3>Dominant Driver</h3><p>Assertive, results-oriented, and unafraid of challenges. You thrive on taking charge.</p><p><strong>Strengths:</strong> Boldness, leadership, focus on outcomes.<br/><strong>Growth:</strong> Patience and active listening.</p>',
  'I': '<h3>Inspiring Influencer</h3><p>Outgoing, persuasive, and enthusiastic. You build relationships easily.</p><p><strong>Strengths:</strong> Charisma, communication, optimism.<br/><strong>Growth:</strong> Attention to detail and follow-through.</p>',
  'S': '<h3>Steady Supporter</h3><p>Patient, reliable, and committed to harmony. You are a stabilizer in teams.</p><p><strong>Strengths:</strong> Empathy, dependability, listening.<br/><strong>Growth:</strong> Assertiveness and adapting to change.</p>',
  'C': '<h3>Conscientious Analyst</h3><p>Precise, analytical, and standards-focused. You ensure quality and accuracy.</p><p><strong>Strengths:</strong> Problem-solving, planning, high standards.<br/><strong>Growth:</strong> Flexibility and decision speed.</p>',
  'D/I': '<h3>Driver / Influencer</h3><p>Dynamic leader who drives results while motivating teams.</p>',
  'D/S': '<h3>Driver / Supporter</h3><p>Combines drive with reliability and loyalty.</p>',
  'D/C': '<h3>Driver / Analyst</h3><p>Mixes boldness with precision for efficient execution.</p>',
  'I/S': '<h3>Influencer / Supporter</h3><p>Sociable and supportive, creating collaborative environments.</p>',
  'I/C': '<h3>Influencer / Analyst</h3><p>Blends creativity with detail-orientation.</p>',
  'S/C': '<h3>Supporter / Analyst</h3><p>Reliable and meticulous, focusing on accurate, team-oriented work.</p>'
};