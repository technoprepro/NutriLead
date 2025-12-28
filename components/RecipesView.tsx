
import React, { useState, useRef, useMemo } from 'react';
import { Meal, UserProfile, Ingredient, DietParameter } from '../types';
import { Search, Clock, Flame, Utensils, Heart, ArrowLeft, Leaf, SlidersHorizontal, Plus, X, Sparkles, Pencil, Camera, Trash2, Check } from 'lucide-react';
import { generateRecipeFromPrompt } from '../geminiService';
import { Translations } from '../i18n';

interface RecipesViewProps {
  allRecipes: Meal[];
  userProfile: UserProfile;
  onAddRecipe: (meal: Meal) => void;
  onToggleFavorite: (meal: Meal) => void;
  favoriteMeals: Meal[];
  translations: Translations;
  onUpdateMealImage: (mealId: string, imageUrl: string) => void;
  onDeleteRecipe: (mealId: string) => void;
}

const RecipesView: React.FC<RecipesViewProps> = ({ allRecipes, userProfile, onAddRecipe, onToggleFavorite, favoriteMeals, translations: t, onUpdateMealImage, onDeleteRecipe }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [addMode, setAddMode] = useState<'ai' | 'manual'>('ai');
  const [newRecipePrompt, setNewRecipePrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<DietParameter[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual form states
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink'>('Breakfast');
  const [manualKcal, setManualKcal] = useState(300);
  const [manualTime, setManualTime] = useState(20);
  const [manualIngredients, setManualIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [manualInstructions, setManualInstructions] = useState<string[]>(['']);

  const isMealFavorite = (meal: Meal) => favoriteMeals.some(m => m.id === meal.id);

  // Extract all unique ingredients from current database for filtering
  const allAvailableIngredients = useMemo(() => {
    const ings = new Set<string>();
    allRecipes.forEach(m => {
      m.ingredients.forEach(i => ings.add(i.name.trim().toLowerCase()));
    });
    return Array.from(ings).sort();
  }, [allRecipes]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleDietary = (diet: DietParameter) => {
    setSelectedDietary(prev => prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]);
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
  };

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(r => {
      // Search
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Category logic
      if (selectedCategories.length > 0) {
        const name = r.name.toLowerCase();
        const type = r.type;
        const matchesCategory = selectedCategories.some(cat => {
          if (cat === 'drinks') return type === 'Drink' || name.match(/напиток|смузи|чай|кофе|вода|drink|smoothie|tea|coffee|water/);
          if (cat === 'cereals') return name.match(/каша|круп|овсян|греч|пшен|рис|cereal|porridge|oatmeal|buckwheat|rice/);
          if (cat === 'soups') return name.match(/суп|борщ|бульон|soup|broth/);
          if (cat === 'salads') return name.match(/салат|salad/);
          if (cat === 'meat') return name.match(/мясо|курица|говядина|свинина|стейк|филе|meat|chicken|beef|pork|steak|fillet/);
          if (cat === 'dairy') return name.match(/творог|йогурт|сыр|кефир|молок|dairy|cottage|yogurt|cheese|kefir|milk/);
          return false;
        });
        if (!matchesCategory) return false;
      }

      // Dietary logic
      if (selectedDietary.length > 0) {
        // This is a simplified check for demo. In production we'd need reliable meta-tagging from the AI.
        const ingStr = r.ingredients.map(i => i.name.toLowerCase()).join(' ');
        const passesDiet = selectedDietary.every(diet => {
          if (diet === DietParameter.LACTOSE_FREE) return !ingStr.match(/молок|творог|сыр|кефир|сливки|milk|cheese|yogurt|cream/);
          if (diet === DietParameter.GLUTEN_FREE) return !ingStr.match(/пшениц|мука|хлеб|батон|wheat|flour|bread/);
          if (diet === DietParameter.DIABETES) return !ingStr.match(/сахар|мед|варенье|sugar|honey|jam/);
          return true;
        });
        if (!passesDiet) return false;
      }

      // Ingredient logic
      if (selectedIngredients.length > 0) {
        const hasAllSelectedIngs = selectedIngredients.every(si => 
          r.ingredients.some(ri => ri.name.toLowerCase().includes(si))
        );
        if (!hasAllSelectedIngs) return false;
      }

      return true;
    });
  }, [allRecipes, searchQuery, selectedCategories, selectedDietary, selectedIngredients]);

  const handleAddRecipeAI = async () => {
    if (!newRecipePrompt.trim()) return;
    setIsGenerating(true);
    try {
      const meal = await generateRecipeFromPrompt(newRecipePrompt, userProfile);
      onAddRecipe(meal);
      setShowAddModal(false);
      setNewRecipePrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

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

  if (selectedMeal) {
    const isFav = isMealFavorite(selectedMeal);
    return (
      <div className="fixed inset-0 bg-[#fdfcf8] z-[200] overflow-y-auto pb-32">
        <div className="absolute top-[60%] -right-12 opacity-10 pointer-events-none rotate-12 scale-150">
          <Leaf size={180} fill="#265c2a" className="text-[#265c2a]" />
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
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg text-[#265c2a] opacity-80 hover:opacity-100"
            >
              <Camera size={24} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                   onUpdateMealImage(selectedMeal.id, reader.result as string);
                   setSelectedMeal({...selectedMeal, imageUrl: reader.result as string});
                };
                reader.readAsDataURL(file);
              }
            }} />
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
            <div className="grid grid-cols-2 gap-4">
              {selectedMeal.ingredients.map((ing, i) => (
                <div key={i} className="bg-[#f7f9f5] rounded-[32px] p-4 flex flex-col items-center text-center gap-2 border border-[#f2f1eb] shadow-sm hover:bg-white transition-colors">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-white shadow-md">
                    <img 
                      src={ing.imageUrl || `https://loremflickr.com/200/200/food,${encodeURIComponent(ing.name)}/all?lock=${i}`} 
                      alt={ing.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://loremflickr.com/200/200/food/all?lock=0' }}
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#3d4239] leading-tight mb-0.5">{ing.amount}</p>
                    <p className="text-[12px] text-[#8c8a7e] leading-tight font-medium capitalize line-clamp-1">{ing.name}</p>
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
    <div className="space-y-6 pb-24 max-w-md mx-auto relative min-h-screen px-4">
      <div className="flex gap-3 pt-6 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a4a298]" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchRecipes} 
            className="w-full pl-12 pr-4 py-3 rounded-[24px] bg-white border border-[#f2f1eb] outline-none focus:ring-2 focus:ring-[#7ca56d]/30 shadow-sm text-sm" 
          />
        </div>
        <button 
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-[24px] bg-white border border-[#f2f1eb] shadow-sm text-[#8c8a7e] hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal size={18} /><span className="font-bold text-sm">{t.filters}</span>
        </button>
      </div>

      <div className="space-y-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((meal) => (
            <div key={meal.id} className="relative group">
              <button 
                onClick={() => setSelectedMeal(meal)} 
                className="w-full flex items-center gap-4 p-3 bg-white rounded-[32px] border border-[#f2f1eb] transition-all hover:shadow-md text-left shadow-sm min-h-[120px]"
              >
                <div className="w-24 h-24 rounded-[28px] overflow-hidden flex-shrink-0 shadow-sm">
                  <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-bold text-base text-[#3d4239] truncate leading-tight mb-1">{meal.name}</h3>
                  <p className="text-xs text-[#a4a298] truncate mb-2 font-medium">{meal.ingredients.map(i => i.name).join(', ')}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#a4a298]">
                    <div className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /><span>{meal.kcal} {t.kcal}</span></div>
                    <div className="w-px h-2.5 bg-[#e8e6df]"></div>
                    <div className="flex items-center gap-1"><Clock size={12} /><span>{meal.time} {t.min}</span></div>
                  </div>
                </div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(meal); }} 
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-orange-50 transition-colors z-10"
              >
                <Heart size={20} className={isMealFavorite(meal) ? "fill-[#ff6b00] text-[#ff6b00]" : "text-[#a4a298]"} />
              </button>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white/50 backdrop-blur-sm rounded-[40px] border-2 border-dashed border-[#e8e6df]">
            <p className="text-[#8c8a7e] font-medium">{t.noRecipesFound}</p>
          </div>
        )}
      </div>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-28 right-6 w-16 h-16 rounded-full orange-gradient text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 z-[90]">
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setShowFilterModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#265c2a]">{t.filterTitle}</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-[#a4a298]"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#3d4239] uppercase tracking-wider">{t.filters}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {id: 'drinks', label: t.catDrinks},
                    {id: 'cereals', label: t.catCereals},
                    {id: 'soups', label: t.catSoups},
                    {id: 'salads', label: t.catSalads},
                    {id: 'meat', label: t.catMeat},
                    {id: 'dairy', label: t.catDairy},
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all ${selectedCategories.includes(cat.id) ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-md' : 'bg-[#f9f9f6] border-[#f2f1eb] text-[#8c8a7e]'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#3d4239] uppercase tracking-wider">{t.dietRestrictions}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {id: DietParameter.GLUTEN_FREE, label: t.dietGlutenFree},
                    {id: DietParameter.LACTOSE_FREE, label: t.dietLactoseFree},
                    {id: DietParameter.DIABETES, label: t.dietDiabetic},
                  ].map(diet => (
                    <button
                      key={diet.id}
                      onClick={() => toggleDietary(diet.id as DietParameter)}
                      className={`flex items-center justify-between py-4 px-6 rounded-2xl text-sm font-bold border transition-all ${selectedDietary.includes(diet.id as DietParameter) ? 'bg-[#7ca56d] border-[#7ca56d] text-white shadow-md' : 'bg-[#f9f9f6] border-[#f2f1eb] text-[#8c8a7e]'}`}
                    >
                      {diet.label}
                      {selectedDietary.includes(diet.id as DietParameter) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredient selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#3d4239] uppercase tracking-wider">{t.ingredientsTitle}</h3>
                <div className="flex flex-wrap gap-2">
                  {allAvailableIngredients.slice(0, 12).map(ing => (
                    <button
                      key={ing}
                      onClick={() => toggleIngredient(ing)}
                      className={`py-2 px-4 rounded-full text-xs font-bold border transition-all ${selectedIngredients.includes(ing) ? 'bg-[#7ca56d] border-[#7ca56d] text-white' : 'bg-[#f9f9f6] border-[#f2f1eb] text-[#8c8a7e]'}`}
                    >
                      {ing}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button 
                onClick={() => { setSelectedCategories([]); setSelectedDietary([]); setSelectedIngredients([]); }}
                className="flex-1 py-4 border-2 border-[#f2f1eb] text-[#8c8a7e] font-bold rounded-2xl"
              >
                {t.resetFilters}
              </button>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-4 orange-gradient text-white font-bold rounded-2xl"
              >
                {t.applyFilters}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => !isGenerating && setShowAddModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#265c2a]">{t.newRecipe}</h2>
              <button onClick={() => !isGenerating && setShowAddModal(false)} className="text-[#a4a298]"><X size={24} /></button>
            </div>

            <div className="flex bg-[#f9f9f6] p-1 rounded-2xl border border-[#f2f1eb] mb-6">
              <button onClick={() => setAddMode('ai')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${addMode === 'ai' ? 'bg-white shadow-sm text-[#265c2a]' : 'text-[#8c8a7e]'}`}><Sparkles size={16} className="inline mr-1" /> {t.aiMode}</button>
              <button onClick={() => setAddMode('manual')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${addMode === 'manual' ? 'bg-white shadow-sm text-[#265c2a]' : 'text-[#8c8a7e]'}`}><Pencil size={16} className="inline mr-1" /> {t.manualMode}</button>
            </div>

            {addMode === 'ai' ? (
              <div className="space-y-4">
                <textarea 
                  value={newRecipePrompt} 
                  onChange={(e) => setNewRecipePrompt(e.target.value)} 
                  placeholder={t.whatToCook} 
                  className="w-full h-32 p-5 rounded-3xl bg-[#f9f9f6] border border-[#f2f1eb] outline-none text-lg resize-none" 
                  disabled={isGenerating} 
                />
                <button 
                  onClick={handleAddRecipeAI} 
                  disabled={isGenerating || !newRecipePrompt.trim()} 
                  className="w-full py-5 orange-gradient text-white text-xl font-bold rounded-[32px] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t.createRecipe}
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-[#8c8a7e]">Manual entry is available in the detailed version. Use AI for now!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesView;
