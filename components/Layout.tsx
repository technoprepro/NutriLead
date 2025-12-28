
import React from 'react';
import { User, BookOpen, ClipboardList } from 'lucide-react';
import { Translations } from '../i18n';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'ration' | 'recipes' | 'profile';
  setActiveTab: (tab: 'ration' | 'recipes' | 'profile') => void;
  translations: Translations;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, translations: t }) => {
  return (
    <div className="min-h-screen bg-soft-pattern text-[#3d4239]">
      <main className="p-4 md:p-8">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e8e6df] px-10 py-4 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.03)] safe-bottom z-[100]">
        <button 
          onClick={() => setActiveTab('ration')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'ration' ? 'text-[#7ca56d]' : 'text-[#a4a298]'}`}
        >
          <div className={`p-1 transition-transform ${activeTab === 'ration' ? 'scale-110' : ''}`}>
            <ClipboardList size={26} strokeWidth={activeTab === 'ration' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold ${activeTab === 'ration' ? 'text-[#3d4239]' : 'text-[#a4a298]'}`}>
            {t.ration}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('recipes')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'recipes' ? 'text-[#7ca56d]' : 'text-[#a4a298]'}`}
        >
          <div className={`p-1 transition-transform ${activeTab === 'recipes' ? 'scale-110' : ''}`}>
            <BookOpen size={26} strokeWidth={activeTab === 'recipes' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold ${activeTab === 'recipes' ? 'text-[#3d4239]' : 'text-[#a4a298]'}`}>
            {t.recipes}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'profile' ? 'text-[#7ca56d]' : 'text-[#a4a298]'}`}
        >
          <div className={`p-1 transition-transform ${activeTab === 'profile' ? 'scale-110' : ''}`}>
            <User size={26} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold ${activeTab === 'profile' ? 'text-[#3d4239]' : 'text-[#a4a298]'}`}>
            {t.profile}
          </span>
        </button>
      </nav>
    </div>
  );
};
