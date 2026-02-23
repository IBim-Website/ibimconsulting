"use client";

import React, { useState } from 'react';
import { 
  CheckCircle, Brain, Target, Activity, Compass, Star, 
  BarChart3, ArrowRight, BookOpen, Flag
} from 'lucide-react';
import { QUESTIONS, OPTIONS, ICONS, PALETTES } from './constants';
import { calculateResults, getProfileType, getInterpretationBand, getSubscaleText } from './utils';
import SubscaleCard from './SubscaleCard';

export default function SuccessPotentialAssessment() {
  const [answers, setAnswers] = useState(Array(25).fill(0));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultPage, setResultPage] = useState(0); 
  const [animatingIndex, setAnimatingIndex] = useState(null);

  const handleSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    // Trigger the subtle glow overlay
    setAnimatingIndex(index);
    setTimeout(() => {
      setAnimatingIndex(null);
    }, 400); // Fades out smoothly

    // Snappy auto-scroll delay
    setTimeout(() => {
      if (index < 24) {
        const nextElement = document.getElementById(`question-${index + 1}`);
        if (nextElement) nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const submitElement = document.getElementById('submit-section');
        if (submitElement) submitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400); 
  };

  const handleSubmit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsSubmitted(true);
      setResultPage(0);
    }, 2500);
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-black to-black z-0"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-32 h-32 mb-10">
            <div className="absolute inset-0 border-t-4 border-b-4 border-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-l-4 border-r-4 border-yellow-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <Brain className="w-10 h-10 text-amber-200 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-500 mb-3 text-center">
            Analyzing Potential...
          </h2>
          <p className="text-amber-500/60 text-center animate-pulse">Mapping your performance engines and psychological predictors.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const results = calculateResults(answers);
    const band = getInterpretationBand(results.overall);
    const profile = getProfileType(results);

    const pages = [
      { id: 'grit', title: "Follow-Through Power", score: results.grit, icon: Target, color: "from-orange-500 to-amber-500", textCol: "text-amber-400" },
      { id: 'selfControl', title: "Impulse Control & Discipline", score: results.selfControl, icon: Activity, color: "from-amber-400 to-yellow-500", textCol: "text-yellow-400" },
      { id: 'planning', title: "Direction & Structure", score: results.planning, icon: Compass, color: "from-cyan-400 to-blue-500", textCol: "text-cyan-400" },
      { id: 'adaptability', title: "Adaptability & Learning", score: results.adaptability, icon: Brain, color: "from-emerald-400 to-teal-500", textCol: "text-emerald-400" }
    ];

    return (
      <div className="min-h-screen bg-black text-white p-4 font-sans flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black z-0"></div>

        <div className="max-w-4xl w-full space-y-6 relative z-10">
          
          <div className="flex justify-between items-center px-2 mb-4 mt-4">
            {[0, 1, 2, 3, 4].map(step => (
              <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${resultPage >= step ? 'bg-amber-400 w-full mx-1 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-zinc-800 w-1/4 mx-1'}`} />
            ))}
          </div>

          {resultPage < 4 ? (
            <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${pages[resultPage].color} opacity-15 rounded-full blur-3xl`}></div>
               
               {(() => {
                 const CurrentIcon = pages[resultPage].icon;
                 return <CurrentIcon className="w-10 h-10 text-amber-500/50 mb-4" />;
               })()}

               <h2 className="text-sm text-amber-500/70 font-bold mb-1 uppercase tracking-wider">Engine {resultPage + 1} of 4</h2>
               <h1 className="text-2xl sm:text-3xl font-black mb-6 text-white">{pages[resultPage].title}</h1>
               
               <div className="flex items-end space-x-3 mb-6">
                 <span className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${pages[resultPage].color}`}>{pages[resultPage].score}%</span>
               </div>
               
               <div className="space-y-4 mb-8 relative z-10">
                 <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl relative">
                   <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b ${pages[resultPage].color}`}></div>
                   <h3 className="text-xl font-bold text-white mb-1 ml-2">{getSubscaleText(pages[resultPage].id, pages[resultPage].score).level}</h3>
                   <p className="text-zinc-400 text-sm leading-relaxed ml-2">{getSubscaleText(pages[resultPage].id, pages[resultPage].score).desc}</p>
                 </div>

                 <div className="flex items-start p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                    <BookOpen className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${pages[resultPage].textCol}`} />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">Why It Matters</h4>
                      <p className="text-zinc-400 text-xs leading-relaxed">{getSubscaleText(pages[resultPage].id, pages[resultPage].score).research}</p>
                    </div>
                 </div>

                 <div className="flex items-start p-4 bg-zinc-800/50 border border-amber-500/20 rounded-2xl shadow-[inset_0_0_15px_rgba(251,191,36,0.05)]">
                    <Flag className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1">
                        {getSubscaleText(pages[resultPage].id, pages[resultPage].score).actionTitle}
                      </h4>
                      <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                        {getSubscaleText(pages[resultPage].id, pages[resultPage].score).action}
                      </p>
                    </div>
                 </div>
               </div>

               <button onClick={() => setResultPage(resultPage + 1)} className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-base rounded-full flex justify-center items-center hover:from-amber-300 hover:to-yellow-400 transition shadow-[0_0_15px_rgba(251,191,36,0.3)] relative z-10">
                 {resultPage === 3 ? "Reveal Final Summary" : "Next Engine"} <ArrowRight className="ml-2 w-4 h-4" />
               </button>
            </div>
          ) : (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-700 relative z-10 w-full max-w-4xl mx-auto mt-2">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-500">Your Overall Success Potential</h1>
              
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-[0_0_40px_rgba(251,191,36,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
                <div className="text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] mb-3 relative z-10">{results.overall}%</div>
                <div className={`px-6 py-2 rounded-full text-sm font-bold border backdrop-blur-sm relative z-10 ${band.bg} ${band.color} ${band.border}`}>
                  {band.label}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-3xl text-left mt-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-1 relative z-10">Performance Profile Type</h3>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-2 relative z-10">{profile.title}</h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed relative z-10">{profile.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
                <SubscaleCard icon={Target} color="from-orange-500 to-amber-500" title="Follow-Through" score={results.grit} description="Ability to stick with tasks and long-term goals." />
                <SubscaleCard icon={Activity} color="from-amber-400 to-yellow-500" title="Impulse Control" score={results.selfControl} description="Ability to say no to temptations and maintain daily standards." />
                <SubscaleCard icon={Compass} color="from-cyan-400 to-blue-500" title="Direction & Structure" score={results.planning} description="Ability to plan ahead and link today's actions to future goals." />
                <SubscaleCard icon={Brain} color="from-emerald-400 to-teal-500" title="Adaptability & Learning" score={results.adaptability} description="Ability to handle feedback and adjust course." />
              </div>

              <div className="pt-4 pb-8">
                <button 
                  onClick={() => { setIsSubmitted(false); setResultPage(0); setAnswers(Array(25).fill(0)); }} 
                  className="text-amber-500/70 hover:text-amber-400 transition text-sm font-medium"
                >
                  Retake Assessment
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  const answeredCount = answers.filter(a => a > 0).length;
  const progressPercentage = (answeredCount / 25) * 100;

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      
      {/* Ambient Gold Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-black to-black z-0"></div>

      {/* FIXED HEADER PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md pb-4 pt-6 px-4 sm:px-8 border-b border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-amber-500" /> Success Potential
            </h1>
            <span className="text-amber-500/70 text-sm font-medium">{answeredCount} of 25 completed</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden relative">
            <div 
              className="h-full bg-amber-400 transition-all duration-500 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 0 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-200 rounded-full blur-[4px] shadow-[0_0_15px_4px_rgba(251,191,36,0.9)]"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-3xl mx-auto space-y-8 relative z-10 pt-32 px-4 sm:px-8 pb-8">
        {QUESTIONS.map((question, index) => {
          const isAnswered = answers[index] > 0;
          const QuestionIcon = ICONS[index % ICONS.length];
          const palette = PALETTES[index]; 
          
          return (
            <div 
              id={`question-${index}`} 
              key={index} 
              className={`relative bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 rounded-2xl transition-all duration-700 ease-in-out
                ${isAnswered ? 'opacity-50 scale-95 hover:opacity-100 hover:scale-100' : 'opacity-100 shadow-xl shadow-amber-900/5'}`}
            >
              {/* SUBTLE GLOW OVERLAY */}
              <div 
                className={`absolute inset-0 z-20 pointer-events-none rounded-2xl transition-all duration-300 ease-out
                  ${animatingIndex === index 
                    ? 'opacity-100 bg-amber-500/5 border border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]' 
                    : 'opacity-0'}`}
              ></div>

              <div className="flex items-start mb-8 relative z-10">
                <div className={`mt-1 mr-4 p-2 rounded-lg ${palette.iconBg} ${palette.text}`}>
                  <QuestionIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-zinc-100 leading-relaxed">
                  <span className={`mr-2 text-sm font-bold ${palette.text}`}>Q{index + 1}.</span>
                  {question}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                {OPTIONS.map((opt) => {
                  const isSelected = answers[index] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(index, opt.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300
                        ${isSelected 
                          ? `bg-gradient-to-br ${palette.from} ${palette.to} border-transparent ${palette.selectedText} shadow-lg ${palette.shadow} scale-105` 
                          : `bg-zinc-950 border-zinc-800 text-zinc-400 ${palette.hover} hover:bg-zinc-900`}`}
                    >
                      <span className={`text-xl font-bold mb-1 ${isSelected ? palette.selectedText : 'text-zinc-300'}`}>
                        {opt.value}
                      </span>
                      <span className="text-xs text-center font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div id="submit-section" className="pt-10 pb-20 flex flex-col items-center justify-center border-t border-zinc-800 mt-12">
          {answeredCount < 25 ? (
            <p className="text-amber-500/60 mb-4 flex items-center">
               <Star className="w-5 h-5 mr-2" /> Answer all questions to unlock your profile.
            </p>
          ) : null}
          <button
            disabled={answeredCount < 25}
            onClick={handleSubmit}
            className={`flex items-center px-10 py-4 rounded-full font-bold text-lg transition-all duration-300
              ${answeredCount === 25 
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'}`}
          >
            Calculate Results <CheckCircle className="w-6 h-6 ml-3" />
          </button>
        </div>
      </div>
    </div>
  );
}