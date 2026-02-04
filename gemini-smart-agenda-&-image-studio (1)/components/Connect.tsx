
import React from 'react';
import { socials } from '../data/socialsData';

const Connect: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Connect With Me</h2>
        <p className="text-slate-500 mt-2">Find me on these platforms. I'd love to connect!</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center space-x-4 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 transition-all duration-300 ${social.color}`}
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-xl text-slate-500 group-hover:scale-110 transition-transform duration-300">
                <i className={social.icon}></i>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{social.name}</h3>
                <p className="text-xs text-slate-400 truncate">{social.url.replace('https://', '')}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connect;
