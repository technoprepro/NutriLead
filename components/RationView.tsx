
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DailyRation, Meal, Language, AttachedDrink } from '../types';
import { ChevronLeft, ChevronRight, Leaf, ArrowLeft, Clock, Flame, Utensils, Heart, Camera, Trash2, CheckCircle2, Zap, Download, FileText, Coffee, Droplets, PieChart } from 'lucide-react';
import { Translations } from '../i18n';
import { exportShoppingListPDF, exportRecipesPDF } from '../pdfService';

interface RationViewProps {
  history: DailyRation[];
  onRefresh: (date: Date) => void;
  onSelectOption: (date: string, optionIndex: number) => void;
  isLoading: boolean;
  translations: Translations;
  language: Language;
  onToggleFavorite: (meal: Meal) => void;
  favoriteMeals: Meal[];
  onUpdateMealImage: (mealId: string, imageUrl: string) => void;
  onDeleteRecipe: (mealId: string) => void;
}

const RationView: React.FC<RationViewProps> = ({ history, onRefresh, onSelectOption, isLoading, translations: t, language, onToggleFavorite, favoriteMeals, onUpdateMealImage, onDeleteRecipe }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  // selectedMeal can be a regular Meal OR an AttachedDrink (casted to Meal)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [viewOptionIndex, setViewOptionIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [selectedDate]);

  const selectedDateStr = selectedDate.toDateString();
  const rationForSelectedDate = history.find(r => new Date(r.date).toDateString() === selectedDateStr);

  // Sync viewOptionIndex with the selected index from history when the ration changes
  useEffect(() => {
    if (rationForSelectedDate && rationForSelectedDate.selectedOptionIndex !== undefined) {
      setViewOptionIndex(rationForSelectedDate.selectedOptionIndex);
    } else {
      setViewOptionIndex(0);
    }
  }, [rationForSelectedDate]);

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' });
  };

  const formatFullDate = (date: Date) => {
    const formatted = date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long' 
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const handleDateSelect = (date: Date) => {
    if (!isSameDay(date, selectedDate)) {
      setSelectedDate(date);
    }
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedMeal) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateMealImage(selectedMeal.id, base64String);
        setSelectedMeal({ ...selectedMeal, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const isMealFavorite = (meal: Meal) => favoriteMeals.some(m => m.id === meal.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMeal && window.confirm(t.confirmDeleteRecipe)) {
      onDeleteRecipe(selectedMeal.id);
      setSelectedMeal(null);
    }
  };

  const mealTypeLabels: Record<string, string> = {
    'Breakfast': t.breakfast,
    'Lunch': t.lunch,
    'Dinner': t.dinner,
    'Snack': t.snack,
    'Drink': t.drink
  };

  const handleDrinkClick = (e: React.MouseEvent, drink: AttachedDrink) => {
    e.stopPropagation();
    // Cast AttachedDrink to Meal for reuse of detail view
    setSelectedMeal(drink as unknown as Meal);
  };

  if (selectedMeal) {
    const isFav = isMealFavorite(selectedMeal);
    return (
      <div className="fixed inset-0 bg-[#fdfcf8] z-[200] overflow-y-auto pb-32">
        <div className="absolute top-[60%] -right-12 opacity-10 pointer-events-none rotate-12 scale-150">
          <Leaf size={180} fill="#265c2a" className="text-[#265c2a]" />
        </div>

        <div className="relative pt-12 px-6 max-w-md mx-auto">
          <div className="flex justify-between items-start mb-6">
            <button 
              onClick={() => setSelectedMeal(null)} 
              className="bg-gray-100 p-2 rounded-full text-[#265c2a] hover:bg-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 px-4">
              <h1 className="text-2xl font-bold text-[#3d4239] text-center leading-tight">
                {selectedMeal.name}
              </h1>
            </div>
            <button 
              onClick={handleDelete}
              className="p-2 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-all"
            >
              <Trash2 size={24} />
            </button>
          </div>

          <div className="relative group w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-xl border-4 border-white mb-6">
            <img src={selectedMeal.imageUrl} alt={selectedMeal.name} className="w-full h-full object-cover" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg text-[#265c2a]"
            >
              <Camera size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          <div className="bg-white/80 border border-[#f2f1eb] rounded-3xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-[#3d4239] font-medium text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#a4a298]" />
              <span>{selectedMeal.time} {t.min}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <span>{selectedMeal.kcal} {t.kcal}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-400" />
              <span>{selectedMeal.protein}{t.gramAbbr} {t.proteinAbbr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-yellow-600" />
              <span>{selectedMeal.fat}{t.gramAbbr} {t.fatAbbr}</span>
            </div>
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-purple-400" />
              <span>{selectedMeal.carbs}{t.gramAbbr} {t.carbsAbbr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-[#a4a298]" />
              <span>{mealTypeLabels[selectedMeal.type] || selectedMeal.type}</span>
            </div>
          </div>

          <button 
            onClick={() => onToggleFavorite(selectedMeal)} 
            className={`w-full ${isFav ? 'bg-[#ff6b00]' : 'orange-gradient'} py-4 rounded-[28px] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all mb-8`}
          >
            <Heart size={24} className={isFav ? "fill-white" : "fill-transparent"} />
            {isFav ? t.inFavorites : t.addToFavorites}
          </button>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#3d4239] mb-4">{t.ingredients}</h2>
            <div className="space-y-3">
              {selectedMeal.ingredients.map((ing, i) => (
                <div key={i} className="bg-[#f0f2f0] rounded-full p-2 flex items-center gap-4 transition-colors">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex-shrink-0 border-2 border-white shadow-sm">
                    <img 
                      src={ing.imageUrl || `https://loremflickr.com/160/160/food,${encodeURIComponent(ing.name)}/all?lock=${i}`} 
                      alt={ing.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://loremflickr.com/160/160/food/all?lock=0' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold text-[#3d4239]">{ing.amount}</p>
                    <p className="text-xs text-[#8c8a7e] font-medium capitalize truncate">{ing.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#3d4239] mb-4">{t.instructions}</h2>
            <div className="space-y-6">
              {selectedMeal.instructions.map((step) => (
                <div key={step.stepNumber} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#7ca56d] text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm">{step.stepNumber}</div>
                  <p className="text-[#3d4239] leading-relaxed text-sm pt-1">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentOption = rationForSelectedDate?.options?.[viewOptionIndex];
  const mealsForDate = currentOption?.meals || [];
  const isSelectedPlan = rationForSelectedDate?.selectedOptionIndex === viewOptionIndex;

  return (
    <div className="space-y-8 pb-20 relative overflow-hidden bg-soft-pattern min-h-screen">
      <div className="absolute top-20 -left-12 opacity-10 pointer-events-none -rotate-12">
        <Leaf size={160} fill="currentColor" className="text-[#265c2a]" />
      </div>

      <div className="text-center pt-8">
        <h1 className="text-4xl font-bold text-[#265c2a] mb-8">{t.ration}</h1>
        <div className="space-y-4 px-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <button onClick={() => navigateWeek(-1)} className="p-2 text-gray-300 hover:text-gray-500 transition-colors z-20">
              <ChevronLeft size={28} />
            </button>
            <div className="flex-1 flex justify-between px-2 items-center relative h-12">
              {weekDates.map((date, i) => {
                const active = isSameDay(date, selectedDate);
                return (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[32px] cursor-pointer" onClick={() => handleDateSelect(date)}>
                    <span className={`text-sm font-bold transition-opacity ${active ? 'opacity-0' : 'text-gray-300'}`}>
                      {formatDateLabel(date)}
                    </span>
                    {active && (
                       <div className="bg-[#7ca56d] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-[#7ca56d]/30 whitespace-nowrap absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center min-h-[40px]">
                          {formatFullDate(date)}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigateWeek(1)} className="p-2 text-gray-300 hover:text-gray-500 transition-colors z-20">
              <ChevronRight size={28} />
            </button>
          </div>
          <div className="flex justify-between px-10">
            {weekDates.map((date, i) => {
              const active = isSameDay(date, selectedDate);
              return (
                <button key={i} onClick={() => handleDateSelect(date)} className={`text-xl font-bold transition-all outline-none ${active ? 'text-[#3d4239] scale-110' : 'text-gray-300 hover:text-gray-400'}`}>{date.getDate()}</button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 max-w-md mx-auto relative z-10">
        {!isLoading && rationForSelectedDate && (
          <div className="flex bg-[#f2f1eb] p-1.5 rounded-[24px] border border-[#e8e6df] mb-4 relative">
            <button 
              onClick={() => setViewOptionIndex(0)}
              className={`flex-1 py-3 px-4 rounded-[18px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewOptionIndex === 0 ? 'bg-white text-[#265c2a] shadow-sm' : 'text-[#8c8a7e]'}`}
            >
              Вариант 1
              {rationForSelectedDate.selectedOptionIndex === 0 && <CheckCircle2 size={16} className="text-[#7ca56d]" />}
            </button>
            <button 
              onClick={() => setViewOptionIndex(1)}
              className={`flex-1 py-3 px-4 rounded-[18px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewOptionIndex === 1 ? 'bg-white text-[#265c2a] shadow-sm' : 'text-[#8c8a7e]'}`}
            >
              Вариант 2
              {rationForSelectedDate.selectedOptionIndex === 1 && <CheckCircle2 size={16} className="text-[#7ca56d]" />}
            </button>
          </div>
        )}

        {!isLoading && currentOption ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              {/* PFC Summary Header */}
              <div className="w-full">
                <p className="text-[10px] font-extrabold text-[#a4a298] uppercase tracking-[0.15em] text-center mb-3">
                  {t.recommendedDailyIntake}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="group relative flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-2xl border border-[#f2f1eb] shadow-sm cursor-help hover:border-orange-200 transition-colors">
                    <Flame size={14} className="text-orange-400" />
                    <span className="text-sm font-bold text-[#3d4239]">{currentOption.totalKcal} {t.kcal}</span>
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#3d4239] text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl pointer-events-none">
                      {t.kcalHint}
                    </div>
                  </div>
                  <div className="group relative flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-2xl border border-[#f2f1eb] shadow-sm cursor-help hover:border-blue-200 transition-colors">
                    <Zap size={14} className="text-blue-400" />
                    <span className="text-sm font-bold text-[#3d4239]">{currentOption.totalProtein}{t.gramAbbr} {t.proteinAbbr}</span>
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#3d4239] text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl pointer-events-none">
                      {t.proteinHint}
                    </div>
                  </div>
                  <div className="group relative flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-2xl border border-[#f2f1eb] shadow-sm cursor-help hover:border-yellow-200 transition-colors">
                    <Droplets size={14} className="text-yellow-600" />
                    <span className="text-sm font-bold text-[#3d4239]">{currentOption.totalFat}{t.gramAbbr} {t.fatAbbr}</span>
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#3d4239] text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl pointer-events-none">
                      {t.fatHint}
                    </div>
                  </div>
                  <div className="group relative flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-2xl border border-[#f2f1eb] shadow-sm cursor-help hover:border-purple-200 transition-colors">
                    <PieChart size={14} className="text-purple-400" />
                    <span className="text-sm font-bold text-[#3d4239]">{currentOption.totalCarbs}{t.gramAbbr} {t.carbsAbbr}</span>
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#3d4239] text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl pointer-events-none">
                      {t.carbsHint}
                    </div>
                  </div>
                </div>
              </div>
              
              {!isSelectedPlan ? (
                <button 
                  onClick={() => onSelectOption(rationForSelectedDate!.date, viewOptionIndex)}
                  className="px-6 py-2 bg-white border border-[#7ca56d] text-[#7ca56d] text-sm font-bold rounded-full hover:bg-[#7ca56d] hover:text-white transition-all shadow-sm active:scale-95"
                >
                  Выбрать этот план
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="flex items-center gap-2 text-[#7ca56d] bg-[#7ca56d]/5 px-6 py-2 rounded-full border border-[#7ca56d]/30">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">План выбран</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <button 
                      onClick={() => exportShoppingListPDF(currentOption, rationForSelectedDate!.date, t, language)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-2xl border border-[#f2f1eb] text-[#3d4239] font-bold text-[11px] shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <Download size={14} className="text-[#7ca56d]" />
                      {t.downloadShoppingList}
                    </button>
                    <button 
                      onClick={() => exportRecipesPDF(currentOption, rationForSelectedDate!.date, t, language)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-white rounded-2xl border border-[#f2f1eb] text-[#3d4239] font-bold text-[11px] shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <FileText size={14} className="text-orange-400" />
                      {t.downloadRecipes}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-12">
              {mealsForDate.map((meal) => (
                <div key={meal.id} className="space-y-4">
                  <h2 className="text-xl font-bold text-[#265c2a] tracking-tight pl-2 mb-2">{mealTypeLabels[meal.type] || meal.type}</h2>
                  <div className="grid gap-4">
                    <div 
                      onClick={() => setSelectedMeal(meal)}
                      className="bg-white rounded-[32px] p-3 flex flex-col shadow-sm border border-[#f2f1eb] hover:shadow-md transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-24 flex-shrink-0 rounded-[24px] overflow-hidden shadow-sm">
                          <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-base font-bold text-[#3d4239] mb-1 leading-tight">{meal.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
                            <span className="text-[10px] font-bold text-orange-400">{meal.kcal} {t.kcal}</span>
                            <span className="text-[10px] font-bold text-blue-400">{meal.protein}{t.gramAbbr} {t.proteinAbbr}</span>
                            <span className="text-[10px] font-bold text-yellow-600">{meal.fat}{t.gramAbbr} {t.fatAbbr}</span>
                            <span className="text-[10px] font-bold text-purple-400">{meal.carbs}{t.gramAbbr} {t.carbsAbbr}</span>
                          </div>
                          <div className="text-xs text-[#8c8a7e] line-clamp-1 leading-relaxed font-medium">
                            {meal.ingredients.map(i => i.name).join(', ')}
                          </div>
                        </div>
                      </div>

                      {meal.drink && (
                        <div 
                          onClick={(e) => handleDrinkClick(e, meal.drink!)}
                          className="mt-3 p-3 bg-[#f7f9fc] rounded-[24px] border border-[#e8eef6] flex items-center gap-3 hover:bg-[#e8eff6] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm border border-white flex-shrink-0">
                            <img src={meal.drink.imageUrl} className="w-full h-full object-cover" alt={meal.drink.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">{t.drink}</p>
                            <p className="text-xs font-bold text-[#3d4239] truncate leading-none">{meal.drink.name}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 ml-2">
                             <span className="text-[8px] font-bold text-orange-400">{meal.drink.kcal} {t.kcal}</span>
                             <span className="text-[8px] font-bold text-blue-400">{meal.drink.protein}{t.gramAbbr} {t.proteinAbbr}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !isLoading && (
          <div className="text-center py-20 bg-white/40 rounded-[40px] border-2 border-dashed border-gray-200">
             <button 
               onClick={() => onRefresh(selectedDate)}
               className="text-[#7ca56d] font-bold text-lg px-8 py-3 bg-white rounded-full shadow-md hover:bg-white/90 active:scale-95 transition-all"
             >
               Рассчитать на этот день
             </button>
             <p className="mt-4 text-gray-400 font-medium">Нет рациона на выбранную дату</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-[2px] z-[300] flex items-center justify-center">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6">
             <div className="w-12 h-12 border-4 border-[#7ca56d] border-t-transparent rounded-full animate-spin"></div>
             <p className="text-[#265c2a] font-bold text-xl">Подбираем рацион...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RationView;
