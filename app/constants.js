import { 
  Brain, Target, Activity, Compass, Star, Zap, 
  Sun, Moon, Flame, Droplets, Leaf, Shield, Heart, Anchor, Cpu 
} from 'lucide-react';

export const QUESTIONS = [
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

export const OPTIONS = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Almost always" }
];

export const ICONS = [Brain, Target, Activity, Compass, Star, Zap, Sun, Moon, Flame, Droplets, Leaf, Shield, Heart, Anchor, Cpu];

export const PALETTES = [
  { from: "from-white", to: "to-zinc-50", text: "text-white", selectedText: "text-zinc-900", hover: "hover:border-white/50", shadow: "shadow-white/20", iconBg: "bg-white/10" },
  { from: "from-zinc-50", to: "to-zinc-100", text: "text-zinc-50", selectedText: "text-zinc-900", hover: "hover:border-zinc-50/50", shadow: "shadow-zinc-50/20", iconBg: "bg-zinc-50/10" },
  { from: "from-zinc-100", to: "to-amber-50", text: "text-zinc-100", selectedText: "text-zinc-900", hover: "hover:border-zinc-100/50", shadow: "shadow-zinc-100/20", iconBg: "bg-zinc-100/10" },
  { from: "from-amber-50", to: "to-yellow-50", text: "text-amber-50", selectedText: "text-zinc-900", hover: "hover:border-amber-50/50", shadow: "shadow-amber-50/20", iconBg: "bg-amber-50/10" },
  { from: "from-yellow-50", to: "to-amber-100", text: "text-yellow-50", selectedText: "text-zinc-900", hover: "hover:border-yellow-50/50", shadow: "shadow-yellow-50/20", iconBg: "bg-yellow-50/10" },
  { from: "from-amber-100", to: "to-yellow-100", text: "text-amber-100", selectedText: "text-zinc-900", hover: "hover:border-amber-100/50", shadow: "shadow-amber-100/20", iconBg: "bg-amber-100/10" },
  { from: "from-yellow-100", to: "to-amber-200", text: "text-yellow-100", selectedText: "text-zinc-900", hover: "hover:border-yellow-100/50", shadow: "shadow-yellow-100/20", iconBg: "bg-yellow-100/10" },
  { from: "from-amber-200", to: "to-yellow-200", text: "text-amber-200", selectedText: "text-zinc-900", hover: "hover:border-amber-200/50", shadow: "shadow-amber-200/20", iconBg: "bg-amber-200/10" },
  { from: "from-yellow-200", to: "to-amber-300", text: "text-yellow-200", selectedText: "text-zinc-900", hover: "hover:border-yellow-200/50", shadow: "shadow-yellow-200/20", iconBg: "bg-yellow-200/10" },
  { from: "from-amber-300", to: "to-yellow-300", text: "text-amber-300", selectedText: "text-zinc-900", hover: "hover:border-amber-300/50", shadow: "shadow-amber-300/20", iconBg: "bg-amber-300/10" },
  { from: "from-yellow-300", to: "to-amber-400", text: "text-yellow-300", selectedText: "text-zinc-900", hover: "hover:border-yellow-300/50", shadow: "shadow-yellow-300/20", iconBg: "bg-yellow-300/10" },
  { from: "from-amber-400", to: "to-yellow-400", text: "text-amber-400", selectedText: "text-zinc-900", hover: "hover:border-amber-400/50", shadow: "shadow-amber-400/20", iconBg: "bg-amber-400/10" },
  { from: "from-yellow-400", to: "to-amber-500", text: "text-yellow-400", selectedText: "text-zinc-900", hover: "hover:border-yellow-400/50", shadow: "shadow-yellow-400/20", iconBg: "bg-yellow-400/10" },
  { from: "from-amber-500", to: "to-yellow-500", text: "text-amber-500", selectedText: "text-zinc-900", hover: "hover:border-amber-500/50", shadow: "shadow-amber-500/20", iconBg: "bg-amber-500/10" },
  { from: "from-yellow-500", to: "to-amber-600", text: "text-yellow-500", selectedText: "text-zinc-900", hover: "hover:border-yellow-500/50", shadow: "shadow-yellow-500/20", iconBg: "bg-yellow-500/10" },
  { from: "from-amber-600", to: "to-yellow-600", text: "text-amber-600", selectedText: "text-white", hover: "hover:border-amber-600/50", shadow: "shadow-amber-600/20", iconBg: "bg-amber-600/10" },
  { from: "from-yellow-600", to: "to-amber-700", text: "text-yellow-600", selectedText: "text-white", hover: "hover:border-yellow-600/50", shadow: "shadow-yellow-600/20", iconBg: "bg-yellow-600/10" },
  { from: "from-amber-700", to: "to-yellow-700", text: "text-amber-700", selectedText: "text-white", hover: "hover:border-amber-700/50", shadow: "shadow-amber-700/20", iconBg: "bg-amber-700/10" },
  { from: "from-yellow-700", to: "to-amber-800", text: "text-yellow-700", selectedText: "text-white", hover: "hover:border-yellow-700/50", shadow: "shadow-yellow-700/20", iconBg: "bg-yellow-700/10" },
  { from: "from-amber-800", to: "to-yellow-800", text: "text-amber-800", selectedText: "text-white", hover: "hover:border-amber-800/50", shadow: "shadow-amber-800/20", iconBg: "bg-amber-800/10" },
  { from: "from-yellow-800", to: "to-orange-800", text: "text-yellow-800", selectedText: "text-white", hover: "hover:border-yellow-800/50", shadow: "shadow-yellow-800/20", iconBg: "bg-yellow-800/10" },
  { from: "from-orange-800", to: "to-amber-900", text: "text-orange-800", selectedText: "text-white", hover: "hover:border-orange-800/50", shadow: "shadow-orange-800/20", iconBg: "bg-orange-800/10" },
  { from: "from-amber-900", to: "to-yellow-900", text: "text-amber-900", selectedText: "text-white", hover: "hover:border-amber-900/50", shadow: "shadow-amber-900/20", iconBg: "bg-amber-900/10" },
  { from: "from-yellow-900", to: "to-orange-900", text: "text-yellow-900", selectedText: "text-white", hover: "hover:border-yellow-900/50", shadow: "shadow-yellow-900/20", iconBg: "bg-yellow-900/10" },
  { from: "from-orange-900", to: "to-black", text: "text-orange-900", selectedText: "text-white", hover: "hover:border-orange-900/50", shadow: "shadow-orange-900/20", iconBg: "bg-orange-900/10" }
];