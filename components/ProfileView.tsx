
import React, { useRef, useState } from 'react';
import { UserProfile } from '../types';
import { Settings, ChevronRight, LogOut, ClipboardCheck, Dumbbell, Star, Clock, Leaf, Camera, Globe, Info, X, Check, Ruler, Weight } from 'lucide-react';
import { Translations } from '../i18n';

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: (step?: number) => void;
  onLogout: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onViewHistory: () => void;
  onViewFavorites: () => void;
  translations: Translations;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onEdit, onLogout, onUpdateProfile, onViewHistory, onViewFavorites, translations: t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAbout, setShowAbout] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile({ ...profile, avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const dietLabels: Record<string, string> = {
    'Без ограничений': t.noRestrictions,
    'Диабет': t.diabetes,
    'Без глютена': t.glutenFree,
    'Без лактозы': t.lactoseFree
  };

  const activityLabels: Record<string, string> = {
    'Умственный труд': t.mentalWork,
    'Легкий физический': t.lightPhysical,
    'Спортсмен': t.athlete,
    'Тяжелый физический': t.heavyPhysical
  };

  const menuItems = [
    { 
      icon: <ClipboardCheck className="text-orange-400" size={24} />, 
      label: t.dietParams, 
      sub: profile.dietParameters.map(d => dietLabels[d] || d).join(', ') || t.noRestrictions,
      onClick: () => onEdit(3)
    },
    { 
      icon: <Dumbbell className="text-green-700" size={24} />, 
      label: t.activity, 
      sub: activityLabels[profile.activityLevel] || profile.activityLevel,
      onClick: () => onEdit(4)
    },
    {
      icon: <Globe className="text-blue-500" size={24} />,
      label: t.appLanguage,
      sub: profile.language === 'ru' ? 'Русский' : 'English',
      onClick: () => onEdit(1)
    },
    { 
      icon: <Star className="text-green-500" size={24} fill="currentColor" />, 
      label: t.favRecipes,
      onClick: onViewFavorites
    },
    { 
      icon: <Clock className="text-orange-300" size={24} />, 
      label: t.rationHistory,
      onClick: onViewHistory
    },
    {
      icon: <Info className="text-[#265c2a]" size={24} />,
      label: t.aboutApp,
      onClick: () => setShowAbout(true)
    }
  ];

  const AboutModal = () => (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1e3d1f]/60 backdrop-blur-md" onClick={() => setShowAbout(false)}></div>
      <div className="bg-[#fdfcf8] w-full max-w-lg max-h-[90vh] rounded-[40px] shadow-2xl relative z-10 overflow-y-auto overflow-x-hidden flex flex-col">
        <button 
          onClick={() => setShowAbout(false)}
          className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors z-20"
        >
          <X size={24} />
        </button>

        <div className="p-8 pt-12">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                <defs>
                  <linearGradient id="sunGradientModal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff9d2e" />
                    <stop offset="100%" stopColor="#ff6b00" />
                  </linearGradient>
                </defs>
                <g stroke="#ff9d2e" strokeWidth="2.5" strokeLinecap="round">
                  {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(deg => (
                    <line key={deg} x1="50" y1="10" x2="50" y2="22" transform={`rotate(${deg}, 50, 50)`} />
                  ))}
                </g>
                <circle cx="50" cy="50" r="30" fill="url(#sunGradientModal)" />
                <g transform="translate(42, 32)" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M0,0 V12 Q0,15 3,15 M8,0 V12 Q8,15 5,15 M16,0 V12 Q16,15 13,15 M8,0 V12" />
                  <path d="M8,15 V32" />
                </g>
                <path d="M50 82 Q20 82 10 55 Q35 50 50 82" fill="#2c5c2a" />
                <path d="M50 82 Q80 82 90 55 Q65 50 50 82" fill="#4a8f3d" />
              </svg>
            </div>
            <h2 className="text-4xl font-[900] text-[#1e3d1f] tracking-tight leading-none mb-2">Нутри-Лид</h2>
            <p className="text-[#265c2a] font-bold text-lg leading-tight px-4">{t.aboutTagline}</p>
          </div>

          <div className="space-y-10">
            <div className="bg-white/60 rounded-[32px] p-6 border border-[#f2f1eb]">
              <h3 className="text-xl font-bold text-[#3d4239] mb-4 flex items-center gap-2">
                <Check className="text-[#7ca56d]" size={20} />
                {t.aboutHelpsTitle}
              </h3>
              <ul className="space-y-2">
                {t.aboutHelpsItems.map((item, i) => (
                  <li key={i} className="text-[#8c8a7e] font-medium pl-4 relative">
                    <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-[#7ca56d]"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-2">
              <h3 className="text-xl font-bold text-[#3d4239] mb-4">{t.aboutWhyTitle}</h3>
              <p className="text-[#8c8a7e] leading-relaxed font-medium">
                {t.aboutWhyContent}
              </p>
            </div>

            <div className="bg-[#f0f2f0] rounded-[32px] p-6">
              <h3 className="text-xl font-bold text-[#1e3d1f] mb-4">{t.aboutTeamTitle}</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {t.aboutTeamMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7ca56d]"></span>
                    <span className="text-sm font-bold text-[#3d4239]">{member}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4 pb-10 border-t border-gray-100">
              <p className="text-xs text-[#a4a298] font-bold uppercase tracking-widest mb-2">Developed By</p>
              <p className="text-sm text-[#3d4239] font-bold mb-1 italic">{t.aboutUniInfo}</p>
              <p className="text-base text-[#265c2a] font-bold mb-1">{t.aboutUniName}</p>
              <p className="text-sm text-[#8c8a7e] font-bold">{t.aboutYear}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <Leaf size={250} fill="currentColor" className="text-green-800" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pt-12">
      {showAbout && <AboutModal />}
      
      <div className="flex justify-between items-center px-4 relative">
        <h1 className="text-3xl font-bold text-gray-500 mx-auto">{t.profile}</h1>
        <div className="absolute right-4 flex gap-3">
          <button 
            onClick={() => setShowAbout(true)} 
            className="text-gray-400 hover:text-[#265c2a] transition-colors"
          >
            <Info size={24} />
          </button>
          <button 
            onClick={() => onEdit(1)} 
            className="text-gray-400 hover:text-[#265c2a] transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-[40px] p-8 shadow-sm border border-[#f2f1eb] relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-10 -translate-y-10">
          <Leaf size={150} fill="currentColor" className="text-green-800" />
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        <div className="relative mb-6 cursor-pointer group" onClick={handlePhotoClick}>
          <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden">
            <img src={profile.avatarUrl || `https://picsum.photos/seed/${profile.id}/200/200`} alt={profile.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={32} /></div>
          </div>
          <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-[#265c2a]"><Camera size={18} /></div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#3d4239] mb-1">{profile.name}</h2>
          <p className="text-lg text-[#8c8a7e] font-medium">{profile.age} {t.years}, {profile.gender === 'male' ? t.male : t.female}</p>
        </div>

        <div className="flex gap-4 mb-8 w-full max-w-[280px]">
          <div className="flex-1 bg-white/80 rounded-2xl p-3 border border-[#f2f1eb] flex flex-col items-center shadow-sm">
            <Ruler size={18} className="text-[#7ca56d] mb-1" />
            <span className="text-sm font-bold text-[#3d4239]">{profile.height} {t.height}</span>
          </div>
          <div className="flex-1 bg-white/80 rounded-2xl p-3 border border-[#f2f1eb] flex flex-col items-center shadow-sm">
            <Weight size={18} className="text-[#7ca56d] mb-1" />
            <span className="text-sm font-bold text-[#3d4239]">{profile.weight} {t.weight}</span>
          </div>
        </div>

        <div className="w-full space-y-4 mb-10">
          {menuItems.map((item, i) => (
            <button key={i} onClick={item.onClick} className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-[#f2f1eb] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50">{item.icon}</div>
                <div className="text-left">
                  <span className="block font-bold text-[#3d4239] text-lg leading-tight">{item.label}</span>
                  {item.sub && <span className="text-sm text-[#8c8a7e]">{item.sub}</span>}
                </div>
              </div>
              <ChevronRight size={24} className="text-[#a4a298] group-hover:text-[#265c2a] transition-colors" />
            </button>
          ))}
        </div>

        <div className="w-full space-y-4">
          <button onClick={() => onEdit(1)} className="w-full py-5 orange-gradient text-white text-xl font-bold rounded-full shadow-lg">{t.changeData}</button>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 text-orange-600 font-bold text-lg hover:text-orange-700 transition-colors"><LogOut size={20} /> {t.logout}</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
