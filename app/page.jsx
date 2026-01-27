"use client";

import React, { useState } from 'react';
import { Brain, Activity, ClipboardCheck, ArrowRight, CheckCircle2, User } from 'lucide-react';

export default function PersonalityTest() {
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);

  // Helper to update form state
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Scoring Logic ---
  const calculateResults = (e) => {
    e.preventDefault();

    // 1. MBTI Calculation
    const getPreference = (groupKeys, prefA, prefB) => {
      let countA = 0;
      groupKeys.forEach(key => {
        if (formData[key] === prefA) countA++;
      });
      // Tie-breaker or majority rule (>= 2 out of 3)
      return countA >= Math.ceil(groupKeys.length / 2) ? prefA : prefB;
    };

    const e_i = getPreference(['ei1', 'ei2', 'ei3'], 'E', 'I');
    const s_n = getPreference(['sn1', 'sn2', 'sn3'], 'S', 'N');
    const t_f = getPreference(['tf1', 'tf2', 'tf3'], 'T', 'F');
    const j_p = getPreference(['jp1', 'jp2', 'jp3'], 'J', 'P');
    
    const mbtiType = e_i + s_n + t_f + j_p;

    // 2. DISC Calculation
    let discScores = { D: 0, I: 0, S: 0, C: 0 };
    
    for (let i = 1; i <= 4; i++) {
      const most = formData[`disc_most_${i}`];
      const least = formData[`disc_least_${i}`];
      if (most) discScores[most] += 2;
      if (least) discScores[least] -= 1;
    }

    const maxScore = Math.max(...Object.values(discScores));
    const discTypes = Object.keys(discScores)
      .filter(k => discScores[k] === maxScore)
      .join('/');
    
    // 3. Generate Reports
    const mbtiContent = MBTI_REPORTS[mbtiType] || MBTI_REPORTS['DEFAULT'];
    const discContent = DISC_REPORTS[discTypes] || getBalancedDiscReport(discTypes, discScores);
    
    // Dynamic Combined Report Logic
    const combinedContent = `
      <p class="mb-4">Your MBTI type (<strong>${mbtiType}</strong>) complements your DISC style (<strong>${discTypes.replace(/\//g, ' & ')}</strong>) by adding unique depth to your approach.</p>
      <p class="mb-4">For instance, your <strong>${e_i === 'E' ? 'outgoing extraversion' : 'reflective introversion'}</strong> pairs with <strong>${discTypes.includes('D') || discTypes.includes('I') ? 'a dynamic, people-oriented drive' : 'a supportive, analytical focus'}</strong>, creating a balanced way of interacting with the world.</p>
      <p class="mb-4">This combination enhances your strengths in <strong>${t_f === 'T' ? 'logical, objective decision-making' : 'empathetic, values-based leadership'}</strong>, while offering growth opportunities in <strong>${j_p === 'J' ? 'embracing spontaneity and adaptability' : 'developing more structure and planning'}</strong>.</p>
      <p class="mb-4">Overall, you are particularly suited for environments that require <strong>${s_n === 'S' ? 'practical, hands-on execution and reliability' : 'innovative, big-picture thinking and creativity'}</strong>.</p>
      <p>In relationships and teams, this blend allows you to <strong>${discTypes.includes('S') || discTypes.includes('C') ? 'provide steady support while leveraging your MBTI insights for deeper understanding' : 'lead with energy and persuasion, informed by your MBTI\'s strategic or intuitive edge'}</strong>.</p>
    `;

    setResult({ mbtiType, discTypes, mbtiContent, discContent, combinedContent });
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex justify-center items-center gap-3">
            <Brain className="w-10 h-10 text-green-600" />
            Enhanced Personality Profile
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This improved version combines MBTI-style cognitive processing with DISC behavioral styles. 
            Choose the options that describe you best for a comprehensive self-reflection.
          </p>
        </div>

        <form onSubmit={calculateResults} className="space-y-8">
          
          {/* --- MBTI Section --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 p-6 border-b border-blue-100 flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-blue-900">MBTI Preference Section</h2>
                <p className="text-blue-700 text-sm">Select the statement that fits you best most of the time.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {MBTI_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <strong className="block text-gray-700 mb-3">{idx + 1}. {q.title}</strong>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={q.optionA.val} 
                        required 
                        className="mt-1 w-4 h-4 text-blue-600"
                        onChange={() => handleChange(q.id, q.optionA.val)}
                      />
                      <span className="text-sm text-gray-700">{q.optionA.text}</span>
                    </label>
                    <label className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={q.optionB.val} 
                        className="mt-1 w-4 h-4 text-blue-600"
                        onChange={() => handleChange(q.id, q.optionB.val)}
                      />
                      <span className="text-sm text-gray-700">{q.optionB.text}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- DISC Section --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-purple-50 p-6 border-b border-purple-100 flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-purple-900">DISC Behavioral Section</h2>
                <p className="text-purple-700 text-sm">For each set, select what is MOST like you and LEAST like you.</p>
              </div>
            </div>

            <div className="p-6 grid gap-6 md:grid-cols-2">
              {DISC_SETS.map((set, idx) => (
                <div key={set.id} className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <h3 className="font-bold text-gray-700 mb-4">Set {idx + 1}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-green-600 uppercase mb-1">Most Like Me</label>
                      <select 
                        required 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onChange={(e) => handleChange(`disc_most_${set.id}`, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select option...</option>
                        {set.options.map((opt, i) => (
                          <option key={`m-${i}`} value={opt.val}>{opt.text}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-red-500 uppercase mb-1">Least Like Me</label>
                      <select 
                        required 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        onChange={(e) => handleChange(`disc_least_${set.id}`, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select option...</option>
                        {set.options.map((opt, i) => (
                          <option key={`l-${i}`} value={opt.val}>{opt.text}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full md:w-auto mx-auto block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:-translate-y-1 flex items-center gap-2 text-lg"
          >
            <ClipboardCheck className="w-6 h-6" />
            Generate My Full Profile
          </button>

        </form>

        {/* --- Results Section --- */}
        {result && (
          <div id="results-section" className="mt-16 animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Your Personality Profile</h2>
              <p className="text-gray-500">Analysis complete</p>
            </div>

            <div className="space-y-8">
              {/* MBTI Result */}
              <div className="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-8 h-8 text-blue-500" />
                  <h3 className="text-2xl font-bold text-gray-800">MBTI Type: {result.mbtiType}</h3>
                </div>
                <div 
                  className="prose prose-blue max-w-none text-gray-700" 
                  dangerouslySetInnerHTML={{ __html: result.mbtiContent }} 
                />
              </div>

              {/* DISC Result */}
              <div className="bg-white border-l-4 border-purple-500 rounded-r-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-8 h-8 text-purple-500" />
                  <h3 className="text-2xl font-bold text-gray-800">DISC Style: {result.discTypes}</h3>
                </div>
                <div 
                  className="prose prose-purple max-w-none text-gray-700" 
                  dangerouslySetInnerHTML={{ __html: result.discContent }} 
                />
              </div>

              {/* Combined Result */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-900">Combined Synthesis</h3>
                </div>
                <div 
                  className="prose prose-green max-w-none text-gray-800" 
                  dangerouslySetInnerHTML={{ __html: result.combinedContent }} 
                />
              </div>
            </div>
            
            <p className="text-center text-gray-400 text-sm mt-8 italic">
              Note: This tool is for self-reflection and fun. It is not a substitute for official, professionally administered psychological assessments.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// --- Data Constants ---

const MBTI_QUESTIONS = [
  // E vs I
  { id: 'ei1', title: 'Energy & Social Style', optionA: { val: 'E', text: 'I feel energized by being around people and enjoy group activities.' }, optionB: { val: 'I', text: 'I recharge best alone or in small groups and need quiet time after socializing.' } },
  { id: 'ei2', title: 'Processing Thoughts', optionA: { val: 'E', text: 'I tend to talk things out to understand them better.' }, optionB: { val: 'I', text: 'I prefer to think things through privately before sharing.' } },
  { id: 'ei3', title: 'Initiating Interaction', optionA: { val: 'E', text: 'I usually start conversations and enjoy meeting new people.' }, optionB: { val: 'I', text: 'I wait for others to initiate and feel drained by too much small talk.' } },
  // S vs N
  { id: 'sn1', title: 'Information Focus', optionA: { val: 'S', text: 'I focus on concrete facts, details, and what\'s happening now.' }, optionB: { val: 'N', text: 'I look for patterns, future possibilities, and big-picture ideas.' } },
  { id: 'sn2', title: 'Approach to Methods', optionA: { val: 'S', text: 'I prefer practical, step-by-step approaches and trusted methods.' }, optionB: { val: 'N', text: 'I enjoy exploring innovative ideas even if they\'re unproven.' } },
  { id: 'sn3', title: 'Validation', optionA: { val: 'S', text: 'I trust my five senses and real-world experience over theories.' }, optionB: { val: 'N', text: 'I get excited by abstract concepts and "what if" scenarios.' } },
  // T vs F
  { id: 'tf1', title: 'Decision Making', optionA: { val: 'T', text: 'I prioritize logic, fairness, and objective analysis.' }, optionB: { val: 'F', text: 'I consider people\'s feelings, values, and harmony in decisions.' } },
  { id: 'tf2', title: 'Giving Feedback', optionA: { val: 'T', text: 'I give honest, direct feedback even if it\'s tough.' }, optionB: { val: 'F', text: 'I try to be tactful and supportive to avoid hurting feelings.' } },
  { id: 'tf3', title: 'Basis for Choice', optionA: { val: 'T', text: 'I make decisions based on principles and consistency.' }, optionB: { val: 'F', text: 'I make decisions based on empathy and personal impact.' } },
  // J vs P
  { id: 'jp1', title: 'Lifestyle & Structure', optionA: { val: 'J', text: 'I like plans, schedules, and having things decided.' }, optionB: { val: 'P', text: 'I prefer flexibility, spontaneity, and keeping options open.' } },
  { id: 'jp2', title: 'Tasks & Deadlines', optionA: { val: 'J', text: 'I feel comfortable with routines and closure on tasks.' }, optionB: { val: 'P', text: 'I enjoy adapting as things come up and dislike strict deadlines.' } },
  { id: 'jp3', title: 'Environment', optionA: { val: 'J', text: 'I keep my environment organized and prepared.' }, optionB: { val: 'P', text: 'I am okay with some mess if it means more freedom.' } },
];

const DISC_SETS = [
  { id: '1', options: [{ val: 'D', text: 'Daring' }, { val: 'I', text: 'Persuasive' }, { val: 'S', text: 'Patient' }, { val: 'C', text: 'Detail-oriented' }] },
  { id: '2', options: [{ val: 'D', text: 'Demanding' }, { val: 'I', text: 'Enthusiastic' }, { val: 'S', text: 'Relaxed' }, { val: 'C', text: 'Accurate' }] },
  { id: '3', options: [{ val: 'D', text: 'Strong-willed' }, { val: 'I', text: 'Sociable' }, { val: 'S', text: 'Kind' }, { val: 'C', text: 'Cautious' }] },
  { id: '4', options: [{ val: 'D', text: 'Pioneering' }, { val: 'I', text: 'Optimistic' }, { val: 'S', text: 'Humble' }, { val: 'C', text: 'Systematic' }] },
];

// --- Report Data ---

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

const discCategoryNames = { 'D': 'Dominant Driver', 'I': 'Inspiring Influencer', 'S': 'Steady Supporter', 'C': 'Conscientious Analyst' };

function getBalancedDiscReport(types, scores) {
  const traits = Object.keys(scores).filter(k => scores[k] > 0).map(k => discCategoryNames[k]).join(', ');
  return `<h3>Balanced Profile (${types})</h3><p>Your style blends multiple traits: ${traits}. This versatility allows you to adapt to various situations.</p><p><strong>Strengths:</strong> Adaptability and balanced perspectives.<br/><strong>Growth:</strong> Decision making in specialized tasks.</p>`;
}