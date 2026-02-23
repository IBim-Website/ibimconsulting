import React from 'react';

export default function SubscaleCard({ title, score, description, icon: Icon, color }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-amber-500/30 transition-colors relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color} bg-opacity-10 mr-3`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-white text-base">{title}</h3>
        </div>
        <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br ${color}`}>
          {score}%
        </span>
      </div>
      <p className="text-xs text-zinc-400 mb-3 relative z-10">{description}</p>
      <div className="w-full bg-zinc-950 rounded-full h-1.5 border border-zinc-800 relative z-10 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}