
import React, { useState, useEffect } from 'react';
import { UserProfile, ActivityLevel, DietParameter, RationDuration, Language } from '../types';
import { X, Leaf, ArrowLeft, User, UserRound, Flame, Lightbulb, Dumbbell, Construction, Calendar, Utensils, Check, Ruler, Weight } from 'lucide-react';
import { translations } from '../i18n';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isLoading: boolean;
  initialProfile?: UserProfile;
  onCancel?: () => void;
  startStep?: number;
}

const DISH_IMAGES = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517093157656-b9421fc41146?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop"
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading, initialProfile, onCancel, startStep }) => {
  const [step, setStep] = useState(startStep !== undefined ? startStep : (initialProfile ? 1 : 0));
  const [name, setName] = useState(initialProfile?.name || '');
  const [age, setAge] = useState(initialProfile?.age || 35);
  // Fix: Added missing height and weight state to satisfy UserProfile type
  const [height, setHeight] = useState(initialProfile?.height || 170);
  const [weight, setWeight] = useState(initialProfile?.weight || 70);
  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');
  const [activity, setActivity] = useState<ActivityLevel>(initialProfile?.activityLevel || ActivityLevel.ATHLETE);
  const [diets, setDiets] = useState<DietParameter[]>(initialProfile?.dietParameters || [DietParameter.NONE]);
  const [duration, setDuration] = useState<RationDuration>(initialProfile?.duration || 7);
  const [language, setLanguage] = useState<Language>(initialProfile?.language || 'ru');
  const [randomDish, setRandomDish] = useState(DISH_IMAGES[0]);

  const t = translations[language];

  useEffect(() => {
    if (step === 0) {
      const randomIndex = Math.floor(Math.random() * DISH_IMAGES.length);
      setRandomDish(DISH_IMAGES[randomIndex]);
    }
  }, [step]);

  const handleToggleDiet = (diet: DietParameter) => {
    if (diet === DietParameter.NONE) {
      setDiets([DietParameter.NONE]);
      return;
    }
    setDiets(prev => {
      const filtered = prev.filter(d => d !== DietParameter.NONE);
      if (filtered.includes(diet)) {
        const next = filtered.filter(d => d !== diet);
        return next.length === 0 ? [DietParameter.NONE] : next;
      }
      return [...filtered, diet];
    });
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <button 
          onClick={onCancel} 
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors z-[110]"
        >
          <X size={28} strokeWidth={1.5} />
        </button>

        <div className="absolute top-[15%] left-[5%] opacity-[0.05] pointer-events-none -rotate-12">
          <Leaf size={120} className="text-[#265c2a]" fill="currentColor" />
        </div>
        <div className="absolute bottom-[20%] right-[5%] opacity-[0.05] pointer-events-none rotate-45 scale-x-[-1]">
          <Leaf size={140} className="text-[#265c2a]" fill="currentColor" />
        </div>
        <div className="absolute bottom-[5%] left-[8%] opacity-[0.08] pointer-events-none rotate-[20deg]">
          <Leaf size={80} className="text-[#265c2a]" fill="currentColor" />
        </div>

        <div className="w-full max-w-sm flex flex-col items-center z-10">
          <div className="mb-14">
            <h2 className="text-[34px] font-bold text-[#445b41] leading-[1.15] tracking-tight">
              Рассчитываем<br />ваш рацион...
            </h2>
          </div>

          <div className="relative mb-16 w-full flex justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 bg-white rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex items-center justify-center border-[6px] border-white">
                <img 
                  src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=600&fit=crop" 
                  className="w-full h-full object-cover rounded-full"
                  alt="Healthy Bowl"
                />
              </div>
            </div>
          </div>

          <div className="w-full px-4 space-y-6">
            <div className="w-full bg-[#f2f1eb] h-3.5 rounded-full overflow-hidden shadow-inner">
              <div className="h-full orange-gradient rounded-full w-[10%] animate-[nutri_progress_5s_ease-out_infinite]"></div>
            </div>
            <p className="text-[#8c8a7e] text-[18px] font-medium tracking-wide">
              Подбираем рецепты...
            </p>
          </div>
        </div>
        
        <style>{`
          @keyframes nutri_progress {
            0% { width: 5%; }
            40% { width: 60%; }
            100% { width: 98%; }
          }
        `}</style>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-between pt-16 pb-14 px-6 text-center overflow-hidden relative">
        <div className="absolute top-[35%] -left-12 opacity-[0.07] pointer-events-none rotate-[25deg] scale-150">
          <Leaf size={140} className="text-[#265c2a]" fill="currentColor" />
        </div>
        <div className="absolute bottom-[4%] -right-12 opacity-[0.07] pointer-events-none -rotate-[15deg] scale-150">
          <Leaf size={160} className="text-[#265c2a]" fill="currentColor" />
        </div>
        
        <div className="flex flex-col items-center w-full z-10">
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="sunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff9d2e" />
                  <stop offset="100%" stopColor="#ff6b00" />
                </linearGradient>
              </defs>
              <g stroke="#ff9d2e" strokeWidth="2.5" strokeLinecap="round">
                {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(deg => (
                  <line key={deg} x1="50" y1="10" x2="50" y2="22" transform={`rotate(${deg}, 50, 50)`} />
                ))}
              </g>
              <circle cx="50" cy="50" r="30" fill="url(#sunGradient)" />
              <g transform="translate(42, 32)" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0,0 V12 Q0,15 3,15 M8,0 V12 Q8,15 5,15 M16,0 V12 Q16,15 13,15 M8,0 V12" />
                <path d="M8,15 V32" />
              </g>
              <path d="M50 82 Q20 82 10 55 Q35 50 50 82" fill="#2c5c2a" className="drop-shadow-sm" />
              <path d="M50 82 Q80 82 90 55 Q65 50 50 82" fill="#4a8f3d" className="drop-shadow-sm" />
            </svg>
          </div>
          
          <h1 className="text-[54px] font-[900] text-[#1e3d1f] tracking-tight leading-none mb-4 -mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Нутри-Лид
          </h1>
          <div className="w-12 h-[1px] bg-gray-200 mb-6"></div>
          <p className="text-[#8c8a7e] text-xl font-medium max-w-[280px] leading-snug">
            {t.appSubtitle}
          </p>
        </div>

        <div className="flex items-center justify-center w-full max-w-md mb-8 mt-2 overflow-visible px-4">
          <div className="w-[30%] aspect-square rounded-full border-[6px] border-white shadow-xl overflow-hidden translate-x-3 z-0">
            <img 
              src={randomDish} 
              className="w-full h-full object-cover transition-opacity duration-500" 
              alt="Random Dish" 
            />
          </div>
          <div className="w-[43%] aspect-square rounded-full border-[6px] border-white shadow-2xl overflow-hidden z-20 scale-110">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop" className="w-full h-full object-cover" alt="Salad" />
          </div>
          <div className="w-[30%] aspect-square rounded-full border-[6px] border-white shadow-xl overflow-hidden -translate-x-3 z-0">
            <img src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop" className="w-full h-full object-cover" alt="Salmon" />
          </div>
        </div>

        <div className="w-full max-sm z-30">
          <button 
            onClick={() => setStep(1)}
            className="w-full py-5 orange-gradient text-white text-[32px] font-bold rounded-[34px] transition-all duration-300 shadow-[0_10px_25px_rgba(255,107,0,0.35)]"
          >
            {t.start}
          </button>
        </div>
      </div>
    );
  }

  const Header = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="mb-8 text-center">
      <div className="flex items-center mb-6">
        <button onClick={onCancel || prevStep} className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft size={24} />
        </button>
      </div>
      <h2 className="text-4xl font-bold text-[#265c2a] mb-2">{title}</h2>
      <p className="text-[#8c8a7e] text-lg font-medium">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-soft-pattern p-6 flex flex-col relative overflow-hidden">
      <div className="absolute top-[10%] -left-16 opacity-5 rotate-45 pointer-events-none">
        <Leaf size={200} fill="currentColor" />
      </div>
      <div className="absolute bottom-[5%] -right-16 opacity-5 -rotate-12 pointer-events-none">
        <Leaf size={250} fill="currentColor" />
      </div>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col z-10">
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <Header title={t.setupProfile} subtitle={t.basicData} />
            <div className="space-y-6 mb-8">
              <div className="space-y-3">
                <label className="text-lg font-bold text-[#3d4239]">{t.nameLabel}</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-3xl bg-white shadow-sm border border-[#f2f1eb] focus:ring-2 focus:ring-[#265c2a] outline-none transition-all text-xl text-[#3d4239]"
                  placeholder="Ваше имя"
                />
              </div>

              <div className="space-y-3">
                <label className="text-lg font-bold text-[#3d4239]">{t.langLabel}</label>
                <div className="flex gap-4">
                  <button onClick={() => setLanguage('ru')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border-2 transition-all ${language === 'ru' ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-lg' : 'bg-white border-transparent text-[#8c8a7e] shadow-sm'}`}>
                    <span className="text-lg font-bold">Русский</span>
                  </button>
                  <button onClick={() => setLanguage('en')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border-2 transition-all ${language === 'en' ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-lg' : 'bg-white border-transparent text-[#8c8a7e] shadow-sm'}`}>
                    <span className="text-lg font-bold">English</span>
                  </button>
                </div>
              </div>
            </div>
            <button disabled={!name} onClick={nextStep} className="mt-auto w-full py-5 orange-gradient text-white text-xl font-bold rounded-full transition-all disabled:opacity-50">{t.next}</button>
          </div>
        )}

        {/* Updated step 2 for biometrics collection including height and weight */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <Header title={t.setupProfile} subtitle={t.biometrics} />
            <div className="space-y-6 mb-8">
              <div className="space-y-3">
                <label className="text-lg font-bold text-[#3d4239]">{t.ageLabel}</label>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#f2f1eb] relative flex flex-col items-center">
                  <div className="flex items-end justify-center gap-5 py-2 w-full">
                    {[age - 2, age - 1, age, age + 1, age + 2].map((val) => (
                      <span key={val} className={`transition-all duration-300 ${val === age ? 'text-3xl font-bold text-white bg-[#7ca56d] px-5 py-1.5 rounded-2xl scale-110' : 'text-xl text-gray-300'}`}>
                        {val}
                      </span>
                    ))}
                  </div>
                  <input type="range" min="10" max="99" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full mt-4 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#7ca56d]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-lg font-bold text-[#3d4239] flex items-center gap-2"><Ruler size={18} /> {t.heightLabel}</label>
                  <input 
                    type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full px-6 py-4 rounded-3xl bg-white shadow-sm border border-[#f2f1eb] focus:ring-2 focus:ring-[#265c2a] outline-none transition-all text-xl text-[#3d4239]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-lg font-bold text-[#3d4239] flex items-center gap-2"><Weight size={18} /> {t.weightLabel}</label>
                  <input 
                    type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value))}
                    className="w-full px-6 py-4 rounded-3xl bg-white shadow-sm border border-[#f2f1eb] focus:ring-2 focus:ring-[#265c2a] outline-none transition-all text-xl text-[#3d4239]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-lg font-bold text-[#3d4239]">{t.genderLabel}</label>
                <div className="flex gap-4">
                  <button onClick={() => setGender('male')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border-2 transition-all ${gender === 'male' ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-lg' : 'bg-white border-transparent text-[#8c8a7e] shadow-sm'}`}>
                    <User size={22} /> <span className="text-lg font-bold">{t.male}</span>
                  </button>
                  <button onClick={() => setGender('female')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl border-2 transition-all ${gender === 'female' ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-lg' : 'bg-white border-transparent text-[#8c8a7e] shadow-sm'}`}>
                    <UserRound size={22} /> <span className="text-lg font-bold">{t.female}</span>
                  </button>
                </div>
              </div>
            </div>
            <button onClick={nextStep} className="mt-auto w-full py-5 orange-gradient text-white text-xl font-bold rounded-full transition-all">{t.next}</button>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <Header title={t.setupProfile} subtitle={t.dietRestrictions} />
            <div className="space-y-4 mb-12">
              {[
                { type: DietParameter.NONE, label: t.noRestrictions, icon: <div className="w-8 h-8 rounded-full border-2 border-gray-200" /> },
                { type: DietParameter.DIABETES, label: t.diabetes, icon: <Flame className="text-orange-500" />, sub: t.lowGI },
                { type: DietParameter.GLUTEN_FREE, label: t.glutenFree, icon: <Leaf className="text-green-500" /> },
                { type: DietParameter.LACTOSE_FREE, label: t.lactoseFree, icon: <Utensils size={24} className="text-blue-400" /> }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleToggleDiet(item.type)}
                  className={`flex items-center gap-4 p-5 bg-white rounded-3xl border-2 transition-all ${diets.includes(item.type) ? 'border-[#7ca56d] shadow-md bg-white' : 'border-transparent shadow-sm'}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl">
                    {item.icon}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-[#3d4239] text-lg">{item.label}</p>
                    {item.sub && <p className="text-sm text-[#8c8a7e]">{item.sub}</p>}
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${diets.includes(item.type) ? 'bg-[#7ca56d] border-[#7ca56d] text-white' : 'border-[#f2f1eb]'}`}>
                    {diets.includes(item.type) && <Check size={20} strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="mt-auto w-full py-5 orange-gradient text-white text-xl font-bold rounded-full transition-all">{t.next}</button>
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <Header title={t.setupProfile} subtitle={t.activityCategory} />
            <div className="space-y-4 mb-12">
              {[
                { type: ActivityLevel.MENTAL, label: t.mentalWork, sub: t.officeWork, icon: <Lightbulb className="text-orange-400" /> },
                { type: ActivityLevel.LIGHT, label: t.lightPhysical, sub: t.lightWork, icon: <User size={24} className="text-green-500" /> },
                { type: ActivityLevel.ATHLETE, label: t.athlete, sub: t.regularSport, icon: <Dumbbell className="text-green-700" /> },
                { type: ActivityLevel.HEAVY, label: t.heavyPhysical, sub: t.heavyWork, icon: <Construction size={24} className="text-orange-700" /> }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setActivity(item.type)}
                  className={`flex items-center gap-4 p-5 bg-white rounded-3xl border-2 transition-all ${activity === item.type ? 'border-[#7ca56d] shadow-md bg-white' : 'border-transparent shadow-sm'}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl">
                    {item.icon}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-[#3d4239] text-lg">{item.label}</p>
                    <p className="text-sm text-[#8c8a7e]">{item.sub}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${activity === item.type ? 'bg-[#7ca56d] border-[#7ca56d] text-white' : 'border-[#f2f1eb]'}`}>
                    {activity === item.type && <Check size={20} strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="mt-auto w-full py-5 orange-gradient text-white text-xl font-bold rounded-full transition-all">{t.next}</button>
          </div>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="mb-12 flex flex-wrap justify-center gap-4">
              {[1, 7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d as RationDuration)}
                  className={`flex flex-col items-center justify-center w-28 h-32 rounded-3xl border-2 transition-all gap-2 ${duration === d ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-xl' : 'bg-white border-transparent text-[#8c8a7e] shadow-sm'}`}
                >
                  <Calendar size={32} />
                  <span className="text-lg font-bold">{d} {d === 1 ? 'день' : d === 7 ? 'дней' : 'дней'}</span>
                </button>
              ))}
            </div>
            {/* Added missing height and weight to satisfy UserProfile type requirements in onComplete */}
            <button 
              onClick={() => onComplete({
                id: initialProfile?.id || Math.random().toString(36).substr(2, 9),
                name, age, height, weight, gender, activityLevel: activity, dietParameters: diets, duration, language
              })}
              className="w-full py-5 orange-gradient text-white text-xl font-bold rounded-full transition-all"
            >
              Рассчитать рацион
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
