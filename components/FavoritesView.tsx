
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { ArrowLeft, Heart, Flame, Clock, Leaf, Star, Camera, Utensils, Trash2 } from 'lucide-react';
import { Translations } from '../i18n';

interface FavoritesViewProps {
  favorites: Meal[];
  onBack: () => void;
  onToggleFavorite: (meal: Meal) => void;
  translations: Translations;
  onUpdateMealImage: (mealId: string, imageUrl: string) => void;
  onDeleteRecipe: (mealId: string) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onBack, onToggleFavorite, translations: t, onUpdateMealImage, onDeleteRecipe }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mealTypeLabels: Record<string, string> = {
    'Breakfast': t.breakfast,
    'Lunch': t.lunch,
    'Dinner': t.dinner,
    'Snack': t.snack,
    'Drink': t.drink
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMeal && window.confirm(t.confirmDeleteRecipe)) {
      onDeleteRecipe(selectedMeal.id);
      setSelectedMeal(null);
    }
  };

  if (selectedMeal) {
    const isFav = favorites.some(m => m.id === selectedMeal.id);
    return (
      <div className="fixed inset-0 bg-[#fdfcf8] z-[200] overflow-y-auto pb-32">
        <div className="absolute top-[60%] -right-12 opacity-10 pointer-events-none rotate-12 scale-150">
          <Leaf size={180} fill="#265c2a" className="text-[#265c2a]" />
        </div>
        <div className="absolute top-[85%] -left-12 opacity-10 pointer-events-none -rotate-12 scale-150">
          <Leaf size={160} fill="#265c2a" className="text-[#265c2a]" />
        </div>

        <div className="relative pt-12 px-6 max-w-md mx-auto">
          <div className="flex justify-between items-center absolute top-12 left-6 right-6 z-30">
            <button 
              onClick={() => setSelectedMeal(null)} 
              className="bg-gray-100/80 backdrop-blur-md p-2 rounded-full shadow-sm text-[#265c2a] hover:bg-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={handleDelete}
              className="bg-red-50/80 backdrop-blur-md p-2 rounded-full shadow-sm text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
              title={t.deleteRecipeBtn}
            >
              <Trash2 size={20} />
            </button>
          </div>

          <h1 className="text-[28px] font-bold text-[#3d4239] text-center mb-8 px-12 leading-tight">
            {selectedMeal.name}
          </h1>

          <div className="relative group w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white mb-8">
            <img src={selectedMeal.imageUrl} alt={selectedMeal.name} className="w-full h-full object-cover" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg text-[#265c2a] opacity-80 hover:opacity-100 transition-opacity"
            >
              <Camera size={24} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          <div className="bg-white/80 border border-[#f2f1eb] rounded-3xl p-4 flex items-center justify-around mb-8 text-[#3d4239] font-medium text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#a4a298]" />
              <span>{t.time} {selectedMeal.time} {t.min}</span>
            </div>
            <div className="w-px h-6 bg-[#e8e6df]"></div>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <span>{selectedMeal.kcal} {t.kcal}</span>
            </div>
            <div className="w-px h-6 bg-[#e8e6df]"></div>
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-[#a4a298]" />
              <span>{mealTypeLabels[selectedMeal.type] || selectedMeal.type}</span>
            </div>
          </div>

          <button 
            onClick={() => onToggleFavorite(selectedMeal)} 
            className={`w-full ${isFav ? 'bg-[#ff6b00]' : 'orange-gradient'} py-4 rounded-[28px] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all mb-10`}
          >
            <Heart size={24} className={isFav ? "fill-white" : "fill-transparent"} />
            {isFav ? t.inFavorites : t.addToFavorites}
          </button>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#3d4239] mb-6">{t.ingredients}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedMeal.ingredients.map((ing, i) => (
                <div key={i} className="bg-[#f2f4f1] rounded-[32px] p-3 flex items-center gap-4 border border-transparent shadow-sm relative hover:bg-white hover:border-[#7ca56d]/30 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex-shrink-0 border-2 border-white shadow-sm">
                    <img 
                      src={ing.imageUrl || `https://loremflickr.com/200/200/food,${encodeURIComponent(ing.name)}/all?lock=${i + 1000}`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://loremflickr.com/200/200/food,dish/all?lock=${i + 1100}`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[14px] font-bold text-[#3d4239] leading-tight mb-0.5">{ing.amount}</p>
                    <p className="text-[12px] text-[#8c8a7e] leading-tight font-medium line-clamp-2 capitalize">{ing.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#3d4239] mb-6">{t.instructions}</h2>
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

  return (
    <div className="space-y-6 pt-12 min-h-screen bg-soft-pattern px-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-[#265c2a] hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-[#3d4239]">{t.favorites}</h1>
      </div>

      <div className="space-y-4">
        {favorites.length > 0 ? (
          favorites.map((meal) => (
            <div key={meal.id} className="relative group">
              <button 
                onClick={() => setSelectedMeal(meal)}
                className="w-full flex items-center gap-4 p-2 bg-white rounded-[28px] border border-[#f2f1eb] shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden flex-shrink-0 border-4 border-[#f9f9f6] ml-1">
                  <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-1 min-w-0 pr-10">
                  <h3 className="font-bold text-lg text-[#3d4239] truncate leading-tight mb-1">{meal.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-[#a4a298]">
                    <div className="flex items-center gap-1.5"><Flame size={14} className="text-orange-400" /><span>{meal.kcal} {t.kcal}</span></div>
                    <div className="w-px h-3 bg-[#e8e6df]"></div>
                    <div className="flex items-center gap-1.5"><Clock size={14} /><span>{meal.time} {t.min}</span></div>
                  </div>
                </div>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(meal);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#fcfbf4] hover:bg-orange-50 transition-colors z-10"
              >
                <Heart size={22} className="fill-[#ff6b00] text-[#ff6b00]" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
              <Star size={40} />
            </div>
            <div>
              <p className="text-[#3d4239] font-bold text-xl">{t.noFavorites}</p>
              <p className="text-[#8c8a7e]">{t.favoritesDesc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
