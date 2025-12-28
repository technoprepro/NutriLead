
import React from 'react';
import { DailyRation, Language } from '../types';
import { ArrowLeft, Calendar, ChevronRight, Leaf, Trash2 } from 'lucide-react';
import { Translations } from '../i18n';

interface HistoryViewProps {
  history: DailyRation[];
  onSelect: (ration: DailyRation) => void;
  onBack: () => void;
  onClear: () => void;
  translations: Translations;
  language: Language;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onBack, onClear, translations: t, language }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 pt-12 min-h-screen bg-soft-pattern px-4">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-[#265c2a] hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-[#3d4239]">{t.history}</h1>
        <button 
          onClick={() => {
            if(window.confirm(t.confirmClearHistory)) {
              onClear();
            }
          }}
          className="p-2 text-red-400 hover:text-red-500 transition-colors"
          title={t.clearHistory}
        >
          <Trash2 size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((ration, index) => (
            <button
              key={index}
              onClick={() => onSelect(ration)}
              className="w-full bg-white/80 backdrop-blur-sm p-5 rounded-[32px] border border-[#f2f1eb] shadow-sm hover:shadow-md hover:border-[#7ca56d]/30 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400">
                  <Calendar size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#3d4239] text-lg">{formatDate(ration.date)}</p>
                  <p className="text-sm text-[#8c8a7e] font-medium">
                    {ration.options?.[0]?.meals?.length || 0} {t.day} • ~{ration.options?.[0]?.totalKcal || 0} {t.kcal}
                  </p>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#a4a298] group-hover:text-[#265c2a] transition-colors" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <Leaf size={40} />
            </div>
            <div>
              <p className="text-[#3d4239] font-bold text-xl">{t.emptyHistory}</p>
              <p className="text-[#8c8a7e]">{t.historyDesc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
