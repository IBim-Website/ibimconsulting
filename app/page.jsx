"use client";

import React, { useState } from 'react';
import { 
  CheckCircle, Brain, Target, Activity, Compass, Star, Zap, 
  BarChart3, Sun, Moon, Flame, Droplets, Leaf, Shield, Heart, Anchor, Cpu, ArrowRight, BookOpen, Flag
} from 'lucide-react';

const QUESTIONS = [
  "When you feel bored or uninterested in a task, you still complete it properly before stopping.",
  "If a long-term project stops being exciting, you keep working on it rather than jumping to something new.",
  "You regularly do things today that only your 'future self' will benefit from (like saving, studying, or preparing).",
  "When plans fall apart at the last minute, you quickly create a new plan instead of giving up or complaining.",
  "You notice your first emotional reaction (anger, hurt, envy) but usually choose how to respond instead of reacting on impulse.",
  "You often set time aside for important work, even when no one is watching or checking up on you.",
  "When someone criticizes your work, your first instinct is to look for anything useful in it before defending yourself.",
  "Friends or colleagues would describe you as the person who 'always follows through' on what they say they will do.",
  "When you make a mistake, your main focus is on what you can do differently next time rather than on who is to blame.",
  "You can clearly explain what you are working toward over the next few years, not just what you are doing this week.",
  "You rarely abandon a goal halfway; you either finish it or consciously decide to replace it with a better goal.",
  "On days when you do not 'feel like it,' you still do at least some of the important work you planned.",
  "You find it easy to say no to temptations (food, entertainment, distractions) when they interfere with something important.",
  "When other people are wasting time or procrastinating, you do not let that become your excuse to do the same.",
  "You deliberately seek out tasks or roles that stretch you beyond what feels comfortable or familiar.",
  "You regularly invest time or money into your own learning or skill development without being required to.",
  "When things go better than expected, you look for what you did right so you can repeat it deliberately.",
  "When things go worse than expected, you calmly review what happened rather than avoiding thinking about it.",
  "You can stick with one main life direction or theme (career, craft, mission) for years, even if side opportunities appear.",
  "People come to you when something 'absolutely has to get done' because they trust your reliability.",
  "When you feel tired or discouraged, you still protect certain non-negotiable habits (exercise, study, practice, planning).",
  "You rarely make big decisions mainly to impress others; you choose what fits your values and long-term direction.",
  "You keep track of your progress in some visible way (lists, journals, numbers, milestones) instead of just 'hoping' it works out.",
  "When you realize that your current approach is not working, you change strategy instead of repeating the same pattern.",
  "You genuinely believe that consistent effort over years matters more for your results than talent, luck, or circumstances."
];

const OPTIONS = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Almost always" }
];

const ICONS = [Brain, Target, Activity, Compass, Star, Zap, Sun, Moon, Flame, Droplets, Leaf, Shield, Heart, Anchor, Cpu];

const PALETTES = [
  { from: "from-white", to: "to-zinc-100", text: "text-white", selectedText: "text-zinc-900", hover: "hover:border-white/50", shadow: "shadow-white/20", iconBg: "bg-white/10" },
  { from: "from-zinc-100", to: "to-zinc-200", text: "text-zinc-100", selectedText: "text-zinc-900", hover: "hover:border-zinc-100/50", shadow: "shadow-zinc-100/20", iconBg: "bg-zinc-100/10" },
  { from: "from-amber-100", to: "to-amber-200", text: "text-amber-100", selectedText: "text-zinc-900", hover: "hover:border-amber-100/50", shadow: "shadow-amber-100/20", iconBg: "bg-amber-100/10" },
  { from: "from-amber-200", to: "to-yellow-300", text: "text-amber-200", selectedText: "text-zinc-900", hover: "hover:border-amber-200/50", shadow: "shadow-amber-200/20", iconBg: "bg-amber-200/10" },
  { from: "from-yellow-300", to: "to-yellow-400", text: "text-yellow-300", selectedText: "text-zinc-900", hover: "hover:border-yellow-300/50", shadow: "shadow-yellow-300/20", iconBg: "bg-yellow-300/10" },
  { from: "from-lime-300", to: "to-lime-400", text: "text-lime-300", selectedText: "text-zinc-900", hover: "hover:border-lime-300/50", shadow: "shadow-lime-300/20", iconBg: "bg-lime-300/10" },
  { from: "from-lime-400", to: "to-green-400", text: "text-lime-400", selectedText: "text-zinc-900", hover: "hover:border-lime-400/50", shadow: "shadow-lime-400/20", iconBg: "bg-lime-400/10" },
  { from: "from-green-400", to: "to-emerald-400", text: "text-green-400", selectedText: "text-zinc-900", hover: "hover:border-green-400/50", shadow: "shadow-green-400/20", iconBg: "bg-green-400/10" },
  { from: "from-emerald-400", to: "to-emerald-500", text: "text-emerald-400", selectedText: "text-white", hover: "hover:border-emerald-400/50", shadow: "shadow-emerald-400/20", iconBg: "bg-emerald-400/10" },
  { from: "from-emerald-500", to: "to-teal-500", text: "text-emerald-500", selectedText: "text-white", hover: "hover:border-emerald-500/50", shadow: "shadow-emerald-500/20", iconBg: "bg-emerald-500/10" },
  { from: "from-teal-500", to: "to-teal-600", text: "text-teal-400", selectedText: "text-white", hover: "hover:border-teal-500/50", shadow: "shadow-teal-500/20", iconBg: "bg-teal-500/10" },
  { from: "from-teal-600", to: "to-cyan-600", text: "text-teal-500", selectedText: "text-white", hover: "hover:border-teal-600/50", shadow: "shadow-teal-600/20", iconBg: "bg-teal-600/10" },
  { from: "from-cyan-600", to: "to-cyan-700", text: "text-cyan-500", selectedText: "text-white", hover: "hover:border-cyan-600/50", shadow: "shadow-cyan-600/20", iconBg: "bg-cyan-600/10" },
  { from: "from-cyan-700", to: "to-sky-700", text: "text-cyan-600", selectedText: "text-white", hover: "hover:border-cyan-700/50", shadow: "shadow-cyan-700/20", iconBg: "bg-cyan-700/10" },
  { from: "from-sky-700", to: "to-blue-700", text: "text-sky-600", selectedText: "text-white", hover: "hover:border-sky-700/50", shadow: "shadow-sky-700/20", iconBg: "bg-sky-700/10" },
  { from: "from-blue-700", to: "to-blue-800", text: "text-blue-500", selectedText: "text-white", hover: "hover:border-blue-700/50", shadow: "shadow-blue-700/20", iconBg: "bg-blue-700/10" },
  { from: "from-blue-800", to: "to-indigo-800", text: "text-blue-600", selectedText: "text-white", hover: "hover:border-blue-800/50", shadow: "shadow-blue-800/20", iconBg: "bg-blue-800/10" },
  { from: "from-indigo-800", to: "to-indigo-900", text: "text-indigo-500", selectedText: "text-white", hover: "hover:border-indigo-800/50", shadow: "shadow-indigo-800/20", iconBg: "bg-indigo-800/10" },
  { from: "from-indigo-900", to: "to-violet-900", text: "text-indigo-600", selectedText: "text-white", hover: "hover:border-indigo-900/50", shadow: "shadow-indigo-900/20", iconBg: "bg-indigo-900/10" },
  { from: "from-violet-900", to: "to-slate-800", text: "text-violet-600", selectedText: "text-white", hover: "hover:border-violet-900/50", shadow: "shadow-violet-900/20", iconBg: "bg-violet-900/10" },
  { from: "from-slate-700", to: "to-slate-800", text: "text-slate-400", selectedText: "text-white", hover: "hover:border-slate-700/50", shadow: "shadow-slate-700/20", iconBg: "bg-slate-700/10" },
  { from: "from-slate-800", to: "to-zinc-800", text: "text-slate-500", selectedText: "text-white", hover: "hover:border-slate-800/50", shadow: "shadow-slate-800/20", iconBg: "bg-slate-800/10" },
  { from: "from-zinc-800", to: "to-zinc-900", text: "text-zinc-500", selectedText: "text-white", hover: "hover:border-zinc-800/50", shadow: "shadow-zinc-800/20", iconBg: "bg-zinc-800/10" },
  { from: "from-zinc-900", to: "to-neutral-900", text: "text-zinc-600", selectedText: "text-white", hover: "hover:border-zinc-900/50", shadow: "shadow-zinc-900/20", iconBg: "bg-zinc-900/10" },
  { from: "from-neutral-900", to: "to-black", text: "text-neutral-600", selectedText: "text-white", hover: "hover:border-neutral-900/50", shadow: "shadow-neutral-900/20", iconBg: "bg-neutral-900/10" }
];

export default function SuccessPotentialAssessment() {
  const [answers, setAnswers] = useState(Array(25).fill(0));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultPage, setResultPage] = useState(0); 

  const handleSelect = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (index < 24) {
        const nextElement = document.getElementById(`question-${index + 1}`);
        if (nextElement) nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const submitElement = document.getElementById('submit-section');
        if (submitElement) submitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
  };

  const handleSubmit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsSubmitted(true);
      setResultPage(0);
    }, 2500);
  };

  const calculateResults = () => {
    const getSum = (indices) => indices.reduce((sum, idx) => sum + answers[idx], 0);
    const totalScore = getSum([...Array(25).keys()]);
    
    const gritIndices = [1, 7, 10, 11, 18, 20, 24]; 
    const selfControlIndices = [0, 4, 12, 13, 19]; 
    const planningIndices = [2, 5, 9, 15, 22, 23]; 
    const adaptabilityIndices = [3, 6, 8, 14, 16, 17, 21]; 

    return {
      overall: Math.round(((totalScore - 25) / 100) * 100),
      grit: Math.round(((getSum(gritIndices) - 7) / 28) * 100),
      selfControl: Math.round(((getSum(selfControlIndices) - 5) / 20) * 100),
      planning: Math.round(((getSum(planningIndices) - 6) / 24) * 100),
      adaptability: Math.round(((getSum(adaptabilityIndices) - 7) / 28) * 100)
    };
  };

  const getProfileType = (results) => {
    if (results.grit >= 80 && results.selfControl >= 80 && results.planning >= 80 && results.adaptability >= 80) return { title: "The Compounding Achiever", desc: "Mindset and habits are aligned for long-term success. The question is not 'if' but 'how far' you go." };
    if (results.adaptability >= 80 && results.grit < 80 && results.selfControl < 80 && results.planning < 80) return { title: "The Coach's Dream", desc: "Very coachable, responds well to feedback. Can be shaped into a top performer with added structure." };
    if (results.grit >= 60 && results.planning < 60) return { title: "The Hard-Working Drifter", desc: "Works hard and sticks with things, but aims and priorities are unclear. Risks climbing the wrong mountain." };
    if (results.planning >= 60 && results.grit < 60) return { title: "The Master Planner, Soft Finisher", desc: "Great strategist with strong plans, but execution drops off across time. Needs accountability structures." };
    if ((results.selfControl < 60 || results.adaptability < 60) && results.overall > 40) return { title: "The Emotional Sprinter", desc: "Starts strong, performs well when feeling good, struggles when conditions aren't perfect or facing setbacks." };
    
    return { title: "The Coachable Operator", desc: "Already operating at a good level with clear potential for elite performance. Fast gains come from addressing your weakest area." };
  };

  const getInterpretationBand = (score) => {
    if (score <= 39) return { label: "Raw effort, low return", color: "text-orange-500", bg: "bg-orange-500/20", border: "border-orange-500/50" };
    if (score <= 59) return { label: "Unstable performer", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/50" };
    if (score <= 79) return { label: "Strong performance engine", color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/50" };
    return { label: "Elite potential", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
  };

  const getSubscaleText = (subscale, score) => {
    let level = "", desc = "";
    if (subscale === 'grit') {
      if (score <= 39) { level = "Stop-Start Momentum"; desc = "You generate ideas and enthusiasm but struggle to stay locked in when things get boring, slow, or tough. Projects often stall before they compound."; }
      else if (score <= 59) { level = "Patchy Execution"; desc = "You finish some things well, but others get left half-done. When your energy drops, your consistency drops with it."; }
      else if (score <= 79) { level = "Dependable Finisher"; desc = "When you commit to a project or goal, you usually see it through, even when the work gets boring or difficult. People rely on you to deliver."; }
      else { level = "Relentless Closer"; desc = "You stay on the field long after others mentally tap out. You are built for long campaigns, not just quick sprints."; }
      
      return {
        level, desc,
        research: "Grit (perseverance and passion for long-term goals) strongly predicts high achievement across domains including education, business, and athletics.",
        actionTitle: "30-Day Focus Goal",
        action: "Choose one project that matters most for your future results. Move it forward every weekday, even if only for 20-30 minutes. Protect this as a non-negotiable."
      };
    }
    
    if (subscale === 'selfControl') {
      if (score <= 39) { level = "Easy to Knock Off Track"; desc = "Mood, other people, or short-term temptations easily hijack your plan. Training, work, or key actions get skipped when you are tired or triggered."; }
      else if (score <= 59) { level = "Situational Discipline"; desc = "You are solid when motivated or supervised, but consistency drops under stress or fatigue, and bad habits tend to creep in."; }
      else if (score <= 79) { level = "Self-Driven Professional"; desc = "You usually stick to the plan even when you are not feeling motivated. You can be trusted to do the work without supervision."; }
      else { level = "Unshakeable Standards"; desc = "Your daily standards are non-negotiable. Emotion, temptation, and the environment rarely pull you away from what matters most."; }
      
      return {
        level, desc,
        research: "High self-control consistently predicts better grades, stronger mental health, better interpersonal relationships, and advanced career success.",
        actionTitle: "30-Day Discipline",
        action: "Pick one daily discipline that directly supports your main goal. Do it at the exact same time each day, no matter how you feel."
      };
    }
    
    if (subscale === 'planning') {
      if (score <= 39) { level = "Busy but Directionless"; desc = "You are working hard, but the link between today's actions and your long-term goals is blurry. Progress feels like luck rather than design."; }
      else if (score <= 59) { level = "Basic Game Plan"; desc = "You have a general sense of direction, but your planning, tracking, and adjusting are inconsistent. Some effort lands, but some is wasted."; }
      else if (score <= 79) { level = "Strategic Operator"; desc = "You know where you are going and align your calendar and decisions with that direction. You track your progress and adjust intelligently."; }
      else { level = "Architect of Your Future"; desc = "You think and behave like a long-term investor. Your days, weeks, and seasons are precisely designed to compound toward a clear vision."; }
      
      return {
        level, desc,
        research: "Structured future-orientation ensures that daily micro-actions actually link up to long-term compounding results, separating motion from true progress.",
        actionTitle: "Weekly 15-Minute Review",
        action: "Once a week, ask: What moved me closer to my main goal? What was wasted motion? Adjust next week's schedule to focus more time on high-impact actions."
      };
    }
    
    if (subscale === 'adaptability') {
      if (score <= 39) { level = "Emotion-Led Performer"; desc = "Setbacks, criticism, or pressure hit you hard and can derail progress. Instead of learning, you may withdraw, blame, or repeat the same errors."; }
      else if (score <= 59) { level = "Reactive Learner"; desc = "You sometimes bounce back and learn from mistakes, but sometimes your emotions or ego slow down the learning process."; }
      else if (score <= 79) { level = "Coachable Competitor"; desc = "You handle feedback well, review performance calmly, and adjust. You are able to turn bad days into data, rather than drama."; }
      else { level = "Adaptive High-Performer"; desc = "You actively seek feedback, pressure, and challenges to refine performance. Failures become fuel and information, not identity."; }
      
      return {
        level, desc,
        research: "Emotional regulation makes you highly coachable and prevents you from getting stuck in old patterns, allowing you to turn negative outcomes into active adjustments.",
        actionTitle: "Turn Outcomes into Data",
        action: "After any 'win' or 'loss', ask two questions: 'What exactly did I do that worked?' and 'What exactly will I change next time?' Write one sentence for each."
      };
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="relative flex items-center justify-center w-32 h-32 mb-10">
          <div className="absolute inset-0 border-t-4 border-b-4 border-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-l-4 border-r-4 border-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <Brain className="w-10 h-10 text-zinc-300 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 mb-3 text-center">
          Analyzing Potential...
        </h2>
        <p className="text-zinc-500 text-center animate-pulse">Mapping your performance engines and psychological predictors.</p>
      </div>
    );
  }

  if (isSubmitted) {
    const results = calculateResults();
    const band = getInterpretationBand(results.overall);
    const profile = getProfileType(results);

    const pages = [
      { id: 'grit', title: "Follow-Through Power", score: results.grit, icon: Target, color: "from-orange-500 to-amber-500", textCol: "text-amber-400" },
      { id: 'selfControl', title: "Impulse Control & Discipline", score: results.selfControl, icon: Activity, color: "from-amber-400 to-yellow-500", textCol: "text-yellow-400" },
      { id: 'planning', title: "Direction & Structure", score: results.planning, icon: Compass, color: "from-cyan-400 to-blue-500", textCol: "text-cyan-400" },
      { id: 'adaptability', title: "Adaptability & Learning", score: results.adaptability, icon: Brain, color: "from-emerald-400 to-teal-500", textCol: "text-emerald-400" }
    ];

    return (
      <div className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          
          <div className="flex justify-between items-center px-4 mb-8">
            {[0, 1, 2, 3, 4].map(step => (
              <div key={step} className={`h-2 rounded-full transition-all duration-500 ${resultPage >= step ? 'bg-white w-full mx-1' : 'bg-zinc-800 w-1/4 mx-1'}`} />
            ))}
          </div>

          {resultPage < 4 ? (
            <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${pages[resultPage].color} opacity-10 rounded-full blur-3xl`}></div>
               
               {(() => {
                 const CurrentIcon = pages[resultPage].icon;
                 return <CurrentIcon className="w-16 h-16 text-zinc-400 mb-6" />;
               })()}

               <h2 className="text-xl text-zinc-500 font-bold mb-2">Engine {resultPage + 1} of 4</h2>
               <h1 className="text-4xl sm:text-5xl font-black mb-8">{pages[resultPage].title}</h1>
               
               <div className="flex items-end space-x-4 mb-8">
                 <span className={`text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r ${pages[resultPage].color}`}>{pages[resultPage].score}%</span>
               </div>
               
               <div className="space-y-6 mb-10">
                 {/* Main Interpretation Block */}
                 <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl relative">
                   <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b ${pages[resultPage].color}`}></div>
                   <h3 className="text-2xl font-bold text-white mb-2 ml-2">{getSubscaleText(pages[resultPage].id, pages[resultPage].score).level}</h3>
                   <p className="text-zinc-400 text-lg leading-relaxed ml-2">{getSubscaleText(pages[resultPage].id, pages[resultPage].score).desc}</p>
                 </div>

                 {/* Research/Impact Block */}
                 <div className="flex items-start p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                    <BookOpen className={`w-6 h-6 mr-4 mt-1 flex-shrink-0 ${pages[resultPage].textCol}`} />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-1">Why It Matters</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">{getSubscaleText(pages[resultPage].id, pages[resultPage].score).research}</p>
                    </div>
                 </div>

                 {/* Action Plan Block */}
                 <div className="flex items-start p-5 bg-zinc-800/50 border border-zinc-700 rounded-2xl">
                    <Flag className={`w-6 h-6 mr-4 mt-1 flex-shrink-0 ${pages[resultPage].textCol}`} />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-1">
                        {getSubscaleText(pages[resultPage].id, pages[resultPage].score).actionTitle}
                      </h4>
                      <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                        {getSubscaleText(pages[resultPage].id, pages[resultPage].score).action}
                      </p>
                    </div>
                 </div>
               </div>

               <button onClick={() => setResultPage(resultPage + 1)} className="w-full py-4 bg-white text-black font-bold text-lg rounded-full flex justify-center items-center hover:bg-zinc-200 transition shadow-xl">
                 {resultPage === 3 ? "Reveal Final Summary" : "Next Engine"} <ArrowRight className="ml-2 w-5 h-5" />
               </button>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <h1 className="text-3xl font-bold text-zinc-500">Your Overall Success Potential</h1>
              
              <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
                <div className="text-8xl font-black text-white drop-shadow-lg mb-6">{results.overall}%</div>
                <div className={`px-8 py-3 rounded-full text-lg font-bold border backdrop-blur-sm ${band.bg} ${band.color} ${band.border}`}>
                  {band.label}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-left mt-8">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Performance Profile Type</h3>
                <h2 className="text-3xl font-black text-white mb-4">{profile.title}</h2>
                <p className="text-zinc-400 text-lg leading-relaxed">{profile.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                <SubscaleCard icon={Target} color="from-orange-500 to-amber-500" title="Follow-Through Power" score={results.grit} description="Ability to stick with tasks and long-term goals." />
                <SubscaleCard icon={Activity} color="from-amber-400 to-yellow-500" title="Impulse Control & Discipline" score={results.selfControl} description="Ability to say no to temptations and maintain daily standards." />
                <SubscaleCard icon={Compass} color="from-cyan-400 to-blue-500" title="Direction & Structure" score={results.planning} description="Ability to plan ahead and link today's actions to future goals." />
                <SubscaleCard icon={Brain} color="from-emerald-400 to-teal-500" title="Adaptability & Learning" score={results.adaptability} description="Ability to handle feedback and adjust course." />
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => { setIsSubmitted(false); setResultPage(0); setAnswers(Array(25).fill(0)); }} 
                  className="text-zinc-500 hover:text-white transition font-medium"
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
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans">
      
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md pb-4 pt-2 border-b border-zinc-800 mb-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-zinc-400" /> Success Potential
            </h1>
            <span className="text-zinc-400 text-sm font-medium">{answeredCount} of 25 completed</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden relative">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 0 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[4px] shadow-[0_0_12px_3px_rgba(255,255,255,0.9)]"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {QUESTIONS.map((question, index) => {
          const isAnswered = answers[index] > 0;
          const QuestionIcon = ICONS[index % ICONS.length];
          const palette = PALETTES[index]; 
          
          return (
            <div 
              id={`question-${index}`} 
              key={index} 
              className={`bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 rounded-2xl transition-all duration-700 ease-in-out
                ${isAnswered ? 'opacity-50 scale-95 hover:opacity-100 hover:scale-100' : 'opacity-100 shadow-xl'}`}
            >
              <div className="flex items-start mb-8">
                <div className={`mt-1 mr-4 p-2 rounded-lg ${palette.iconBg} ${palette.text}`}>
                  <QuestionIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-zinc-100 leading-relaxed">
                  <span className={`mr-2 text-sm font-bold ${palette.text}`}>Q{index + 1}.</span>
                  {question}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            <p className="text-zinc-500 mb-4 flex items-center">
               <Star className="w-5 h-5 mr-2" /> Answer all questions to unlock your profile.
            </p>
          ) : null}
          <button
            disabled={answeredCount < 25}
            onClick={handleSubmit}
            className={`flex items-center px-10 py-4 rounded-full font-bold text-lg transition-all duration-300
              ${answeredCount === 25 
                ? 'bg-white text-black hover:scale-105 shadow-xl shadow-white/10' 
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'}`}
          >
            Calculate Results <CheckCircle className="w-6 h-6 ml-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscaleCard({ title, score, description, icon: Icon, color }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 mr-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
        <span className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br ${color}`}>
          {score}%
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-6 relative z-10">{description}</p>
      <div className="w-full bg-zinc-950 rounded-full h-3 border border-zinc-800 relative z-10 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}