export const calculateResults = (answers) => {
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

export const getProfileType = (results) => {
  if (results.grit >= 80 && results.selfControl >= 80 && results.planning >= 80 && results.adaptability >= 80) return { title: "The Compounding Achiever", desc: "Mindset and habits are aligned for long-term success. The question is not 'if' but 'how far' you go." }; 
  if (results.adaptability >= 80 && results.grit < 80 && results.selfControl < 80 && results.planning < 80) return { title: "The Coach's Dream", desc: "Very coachable, responds well to feedback. Can be shaped into a top performer with added structure." }; 
  if (results.grit >= 60 && results.planning < 60) return { title: "The Hard-Working Drifter", desc: "Works hard and sticks with things, but aims and priorities are unclear. Risks climbing the wrong mountain." }; 
  if (results.planning >= 60 && results.grit < 60) return { title: "The Master Planner, Soft Finisher", desc: "Great strategist with strong plans, but execution drops off across time. Needs accountability structures." }; 
  if ((results.selfControl < 60 || results.adaptability < 60) && results.overall > 40) return { title: "The Emotional Sprinter", desc: "Starts strong, performs well when feeling good, struggles when conditions aren't perfect or facing setbacks." }; 
  
  return { title: "The Coachable Operator", desc: "Already operating at a good level with clear potential for elite performance. Fast gains come from addressing your weakest area." }; 
};

export const getInterpretationBand = (score) => {
  if (score <= 39) return { label: "Raw effort, low return", color: "text-orange-500", bg: "bg-orange-500/20", border: "border-orange-500/50" };
  if (score <= 59) return { label: "Unstable performer", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/50" };
  if (score <= 79) return { label: "Strong performance engine", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/50" };
  return { label: "Elite potential", color: "text-amber-200", bg: "bg-amber-500/30", border: "border-amber-400/60" };
};

export const getSubscaleText = (subscale, score) => {
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