
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyRation, Meal } from './types';
import Onboarding from './components/Onboarding';
import ProfileView from './components/ProfileView';
import RationView from './components/RationView';
import RecipesView from './components/RecipesView';
import HistoryView from './components/HistoryView';
import FavoritesView from './components/FavoritesView';
import { Layout } from './components/Layout';
import { generateDailyRation } from './geminiService';
import { translations } from './i18n';
import { Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ration' | 'recipes' | 'profile' | 'history' | 'favorites'>('ration');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storedProfiles, setStoredProfiles] = useState<UserProfile[]>([]);
  const [currentRation, setCurrentRation] = useState<DailyRation | null>(null);
  const [rationHistory, setRationHistory] = useState<DailyRation[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [allRecipes, setAllRecipes] = useState<Meal[]>([]);
  const [customRecipeImages, setCustomRecipeImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStartStep, setOnboardingStartStep] = useState<number | undefined>(undefined);

  // Load persistence data on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('nutri_profiles');
    if (savedProfiles) setStoredProfiles(JSON.parse(savedProfiles));

    const savedCustomImages = localStorage.getItem('nutri_custom_images');
    if (savedCustomImages) setCustomRecipeImages(JSON.parse(savedCustomImages));

    const savedGlobalRecipes = localStorage.getItem('nutri_global_recipes');
    if (savedGlobalRecipes) setAllRecipes(JSON.parse(savedGlobalRecipes));
  }, []);

  // Load history and favorites when profile changes
  useEffect(() => {
    if (userProfile) {
      const savedHistory = localStorage.getItem(`nutri_history_${userProfile.id}`);
      const history: DailyRation[] = savedHistory ? JSON.parse(savedHistory) : [];
      setRationHistory(history);

      const savedFavorites = localStorage.getItem(`nutri_favorites_${userProfile.id}`);
      setFavoriteMeals(savedFavorites ? JSON.parse(savedFavorites) : []);

      // Find ration for today
      const todayStr = new Date().toDateString();
      const todayRation = history.find(r => new Date(r.date).toDateString() === todayStr);
      if (todayRation) {
        setCurrentRation(todayRation);
      } else {
        setCurrentRation(null);
      }
    }
  }, [userProfile]);

  const t = translations[userProfile?.language || 'ru'];

  const saveHistory = (history: DailyRation[]) => {
    if (userProfile) {
      setRationHistory(history);
      localStorage.setItem(`nutri_history_${userProfile.id}`, JSON.stringify(history));
    }
  };

  const saveFavorites = (favorites: Meal[]) => {
    if (userProfile) {
      setFavoriteMeals(favorites);
      localStorage.setItem(`nutri_favorites_${userProfile.id}`, JSON.stringify(favorites));
    }
  };

  const saveGlobalRecipes = (recipes: Meal[]) => {
    setAllRecipes(recipes);
    localStorage.setItem('nutri_global_recipes', JSON.stringify(recipes));
  };

  const toggleFavorite = (meal: Meal) => {
    const isFav = favoriteMeals.some(m => m.id === meal.id);
    if (isFav) {
      saveFavorites(favoriteMeals.filter(m => m.id !== meal.id));
    } else {
      saveFavorites([...favoriteMeals, meal]);
    }
  };

  const deleteRecipe = (mealId: string) => {
    const updatedGlobal = allRecipes.filter(r => r.id !== mealId);
    saveGlobalRecipes(updatedGlobal);
    const updatedFavs = favoriteMeals.filter(m => m.id !== mealId);
    saveFavorites(updatedFavs);
    if (currentRation) {
      setCurrentRation({
        ...currentRation,
        options: currentRation.options.map(opt => ({
          ...opt,
          meals: opt.meals.filter(m => m.id !== mealId)
        }))
      });
    }
  };

  const updateMealImage = (mealId: string, imageUrl: string) => {
    const newCustomImages = { ...customRecipeImages, [mealId]: imageUrl };
    setCustomRecipeImages(newCustomImages);
    localStorage.setItem('nutri_custom_images', JSON.stringify(newCustomImages));

    const updateInList = (list: Meal[]) => list.map(m => m.id === mealId ? { ...m, imageUrl } : m);

    saveGlobalRecipes(updateInList(allRecipes));
    if (currentRation) {
      setCurrentRation({ 
        ...currentRation, 
        options: currentRation.options.map(opt => ({
          ...opt,
          meals: updateInList(opt.meals)
        }))
      });
    }
    saveFavorites(updateInList(favoriteMeals));
    const updatedHistory = rationHistory.map(r => ({
      ...r,
      options: r.options.map(opt => ({
        ...opt,
        meals: updateInList(opt.meals)
      }))
    }));
    saveHistory(updatedHistory);
  };

  const injectCustomImages = (meals: Meal[]): Meal[] => {
    return meals.map(m => ({
      ...m,
      imageUrl: customRecipeImages[m.id] || m.imageUrl
    }));
  };

  const handleProfileSelect = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowOnboarding(false);
  };

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string, profileName: string, profileLanguage: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmMsg = profileLanguage === 'en' 
      ? `Delete profile "${profileName}" and all its data?` 
      : `Удалить профиль "${profileName}" и все связанные с ним данные?`;
      
    if (window.confirm(confirmMsg)) {
      setStoredProfiles(prev => {
        const updated = prev.filter(p => p.id !== profileId);
        localStorage.setItem('nutri_profiles', JSON.stringify(updated));
        return updated;
      });
      
      localStorage.removeItem(`nutri_history_${profileId}`);
      localStorage.removeItem(`nutri_favorites_${profileId}`);
      
      if (userProfile?.id === profileId) {
        setUserProfile(null);
        setCurrentRation(null);
      }
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setStoredProfiles(prev => {
      const updated = [...prev.filter(p => p.id !== profile.id), profile];
      localStorage.setItem('nutri_profiles', JSON.stringify(updated));
      return updated;
    });
    setUserProfile(profile);
    setShowOnboarding(false);
    setOnboardingStartStep(undefined);
    await refreshRation(profile, new Date());
    setActiveTab('ration');
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setStoredProfiles(prev => {
      const updated = prev.map(p => p.id === updatedProfile.id ? updatedProfile : p);
      localStorage.setItem('nutri_profiles', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshRation = async (profile: UserProfile, targetDate: Date = new Date()) => {
    setIsLoading(true);
    try {
      let ration = await generateDailyRation(profile, targetDate);
      
      // Inject custom images into both options
      ration.options = ration.options.map(opt => ({
        ...opt,
        meals: injectCustomImages(opt.meals)
      }));

      const newGlobal = [...allRecipes];
      ration.options.forEach(opt => {
        opt.meals.forEach(m => {
          if (!newGlobal.find(existing => existing.id === m.id)) {
            newGlobal.push(m);
          }
        });
      });
      saveGlobalRecipes(newGlobal);

      const dateKey = targetDate.toDateString();
      const updatedHistory = [
        ...rationHistory.filter(r => new Date(r.date).toDateString() !== dateKey),
        ration
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      saveHistory(updatedHistory);
      
      if (dateKey === new Date().toDateString()) {
        setCurrentRation(ration);
      }
    } catch (error) {
      console.error("Failed to generate ration", error);
      alert(profile.language === 'en' ? "Error generating ration. Please try again." : "Ошибка генерации рациона. Пожалуйста, попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (date: string, optionIndex: number) => {
    const updatedHistory = rationHistory.map(r => 
      r.date === date ? { ...r, selectedOptionIndex: optionIndex } : r
    );
    saveHistory(updatedHistory);
    if (currentRation && currentRation.date === date) {
      setCurrentRation({ ...currentRation, selectedOptionIndex: optionIndex });
    }
  };

  const handleAddRecipe = (newMeal: Meal) => {
    const mealWithImage = { ...newMeal, imageUrl: customRecipeImages[newMeal.id] || newMeal.imageUrl };
    saveGlobalRecipes([mealWithImage, ...allRecipes]);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setShowOnboarding(false);
    setCurrentRation(null);
    setRationHistory([]);
    setFavoriteMeals([]);
  };

  const handleEditRequest = (step?: number) => {
    setOnboardingStartStep(step);
    setShowOnboarding(true);
  };

  const handleSelectHistoryRation = (ration: DailyRation) => {
    setCurrentRation(ration);
    setActiveTab('ration');
  };

  if (showOnboarding || (storedProfiles.length === 0 && !userProfile)) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete} 
        isLoading={isLoading} 
        initialProfile={userProfile || undefined}
        startStep={onboardingStartStep}
        onCancel={storedProfiles.length > 0 ? () => {
          setShowOnboarding(false);
          setOnboardingStartStep(undefined);
        } : undefined}
      />
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-soft-pattern p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#265c2a] mt-12 mb-10 text-center">
          {translations.ru.selectProfile}
        </h1>
        <div className="w-full max-w-md space-y-4">
          {storedProfiles.map(p => (
            <div key={p.id} className="relative flex items-center">
              <button
                onClick={() => handleProfileSelect(p)}
                className="flex-1 flex items-center p-4 bg-white rounded-2xl border border-[#f2f1eb] shadow-sm hover:border-[#265c2a] transition-all text-left pr-16"
              >
                <img 
                  src={p.avatarUrl || `https://picsum.photos/seed/${p.id}/100/100`} 
                  className="w-12 h-12 rounded-full mr-4 object-cover flex-shrink-0" 
                  alt={p.name} 
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-[#3d4239] truncate">{p.name}</p>
                  <p className="text-xs text-[#8c8a7e]">
                    {p.age} {translations[p.language].years}, {p.gender === 'male' ? translations[p.language].male : translations[p.language].female}
                  </p>
                </div>
              </button>
              <button 
                onClick={(e) => handleDeleteProfile(e, p.id, p.name, p.language)}
                className="absolute right-4 p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-20"
                aria-label="Delete Profile"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setShowOnboarding(true)}
            className="w-full py-5 border-2 border-dashed border-[#e8e6df] rounded-2xl text-[#8c8a7e] font-bold hover:border-[#265c2a] hover:text-[#265c2a] transition-all bg-white/30"
          >
            + {translations.ru.addProfile}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab as any} setActiveTab={setActiveTab} translations={t}>
      <div className="w-full max-w-2xl mx-auto pb-24 px-2 sm:px-4">
        {activeTab === 'ration' && (
          <RationView 
            history={rationHistory}
            onRefresh={(date) => refreshRation(userProfile, date)} 
            onSelectOption={handleSelectOption}
            isLoading={isLoading} 
            translations={t}
            language={userProfile.language}
            onToggleFavorite={toggleFavorite}
            favoriteMeals={favoriteMeals}
            onUpdateMealImage={updateMealImage}
            onDeleteRecipe={deleteRecipe}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesView 
            allRecipes={injectCustomImages(allRecipes)} 
            userProfile={userProfile} 
            onAddRecipe={handleAddRecipe}
            onToggleFavorite={toggleFavorite}
            favoriteMeals={favoriteMeals}
            translations={t}
            onUpdateMealImage={updateMealImage}
            onDeleteRecipe={deleteRecipe}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            profile={userProfile} 
            onEdit={handleEditRequest}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onViewHistory={() => setActiveTab('history')}
            onViewFavorites={() => setActiveTab('favorites')}
            translations={t}
          />
        )}
        {activeTab === 'history' && (
          <HistoryView 
            history={rationHistory}
            onSelect={handleSelectHistoryRation}
            onBack={() => setActiveTab('profile')}
            onClear={() => saveHistory([])}
            translations={t}
            language={userProfile.language}
          />
        )}
        {activeTab === 'favorites' && (
          <FavoritesView 
            favorites={injectCustomImages(favoriteMeals)}
            onBack={() => setActiveTab('profile')}
            onToggleFavorite={toggleFavorite}
            translations={t}
            onUpdateMealImage={updateMealImage}
            onDeleteRecipe={deleteRecipe}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
