import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowRight, RotateCcw, Info, Smile, History, Trash2, Clock, Database, Store, Calendar } from 'lucide-react';
import MultiFlyerUploader from './components/MultiFlyerUploader';
import PreferencesForm from './components/PreferencesForm';
import FridgeInput from './components/FridgeInput';
import RecipeCard from './components/RecipeCard';
import LoadingOverlay from './components/LoadingOverlay';
import ShoppingList from './components/ShoppingList';
import FlyerHistory from './components/FlyerHistory';
import { CuisineType, UserPreferences, AnalysisResult, SavedRecipe, ShoppingItem, Recipe } from './types';
import { analyzeFlyerAndSuggestRecipes } from './services/geminiService';
import { saveFlyer } from './services/flyerDbService';

const STORAGE_KEY = 'flyerchef_saved_recipes';

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 3>(1);
  const [flyerFiles, setFlyerFiles] = useState<File[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: 1000,
    cuisine: CuisineType.JAPANESE,
    fridgeIngredients: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDbHistory, setShowDbHistory] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [flyerDate, setFlyerDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedRecipes(JSON.parse(stored));
    } catch {}
  }, []);

  const persistSaved = (recipes: SavedRecipe[]) => {
    setSavedRecipes(recipes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const alreadySaved = savedRecipes.some((r) => r.id === recipe.id);
    if (alreadySaved) return;
    const saved: SavedRecipe = {
      ...recipe,
      savedAt: Date.now(),
      flyerDeals: result?.detectedDeals || [],
    };
    persistSaved([saved, ...savedRecipes]);
  };

  const handleDeleteSaved = (id: string) => {
    persistSaved(savedRecipes.filter((r) => r.id !== id));
  };

  const handleAddToShoppingList = (items: ShoppingItem[]) => {
    setShoppingItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const newItems = items.filter((i) => !existingIds.has(i.id));
      return [...prev, ...newItems];
    });
  };

  const handleSaveToDb = async (analysisResult: AnalysisResult) => {
    if (flyerFiles.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const items = analysisResult.detectedDeals.map((name) => ({ name, isDiscounted: true }));
      await saveFlyer(flyerFiles, storeName || '不明な店舗', flyerDate, items);
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (flyerFiles.length === 0) {
      setError('チラシファイルをアップロードしてください');
      return;
    }
    if (preferences.budget <= 0) {
      setError('予算を正しく入力してください');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzeFlyerAndSuggestRecipes(flyerFiles, preferences);
      setResult(analysisResult);
      setStep(3);
      if (analysisResult.isFlyer) {
        handleSaveToDb(analysisResult);
      }
    } catch (e: any) {
      setError(e.message || '解析に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setStep(1);
    setFlyerFiles([]);
    setResult(null);
    setError(null);
    setShowHistory(false);
    setShowDbHistory(false);
    setSaveError(null);
    setPreferences({ budget: 1000, cuisine: CuisineType.JAPANESE, fridgeIngredients: [] });
  };

  const isSaved = (id: string) => savedRecipes.some((r) => r.id === id);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {isLoading && <LoadingOverlay />}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Flyer Chef AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowDbHistory(!showDbHistory); setShowHistory(false); setStep(1); setResult(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showDbHistory ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-indigo-500 hover:bg-indigo-50'}`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">チラシDB</span>
            </button>
            <button
              onClick={() => { setShowHistory(!showHistory); setShowDbHistory(false); setStep(1); setResult(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showHistory ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'}`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">保存済み</span>
              {savedRecipes.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{savedRecipes.length}</span>
              )}
            </button>
            {step === 3 && (
              <button onClick={resetApp} className="text-sm font-medium text-gray-500 hover:text-orange-500 flex items-center">
                <RotateCcw className="w-4 h-4 mr-1" />
                最初から
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* DB History View */}
        {showDbHistory && <FlyerHistory />}

        {/* Recipe History View */}
        {showHistory && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">保存済みレシピ</h2>
            {savedRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
                <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>まだ保存されたレシピはありません</p>
              </div>
            ) : (
              savedRecipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(recipe.savedAt).toLocaleDateString('ja-JP')}
                    </span>
                    <button
                      onClick={() => handleDeleteSaved(recipe.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <RecipeCard
                    recipe={recipe}
                    isSaved={true}
                    onAddToShoppingList={handleAddToShoppingList}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* Step 1: Input */}
        {!showHistory && step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">

            <section>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm mr-3">1</span>
                <h2 className="text-lg font-bold text-gray-800">チラシを読み込む</h2>
                <span className="ml-2 text-xs text-gray-400">複数枚OK</span>
              </div>
              <MultiFlyerUploader files={flyerFiles} onFilesChange={setFlyerFiles} />

              {flyerFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1.5">
                      <Store className="w-3.5 h-3.5 text-orange-500" />
                      店舗名
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="例: イオン、西友"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      チラシの日付
                    </label>
                    <input
                      type="date"
                      value={flyerDate}
                      onChange={(e) => setFlyerDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-gray-800"
                    />
                  </div>
                </div>
              )}
            </section>

            <section className={flyerFiles.length === 0 ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm mr-3">2</span>
                <h2 className="text-lg font-bold text-gray-800">希望を入力</h2>
              </div>
              <PreferencesForm
                preferences={preferences}
                onPreferencesChange={setPreferences}
                disabled={flyerFiles.length === 0}
              />
            </section>

            <section className={flyerFiles.length === 0 ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mr-3">3</span>
                <h2 className="text-lg font-bold text-gray-800">冷蔵庫の食材</h2>
              </div>
              <FridgeInput
                ingredients={preferences.fridgeIngredients || []}
                onChange={(items) => setPreferences({ ...preferences, fridgeIngredients: items })}
              />
            </section>

            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                disabled={flyerFiles.length === 0}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center text-lg"
              >
                レシピを提案してもらう
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {!showHistory && step === 3 && result && (
          <div className="space-y-6">
            {result.isFlyer ? (
              <>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <h2 className="font-bold text-lg mb-2 opacity-90">
                    見つかった特売品
                    {flyerFiles.length > 1 && <span className="ml-2 text-sm font-normal opacity-75">({flyerFiles.length}枚のチラシから)</span>}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedDeals.map((deal, idx) => (
                      <span key={idx} className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                        {deal}
                      </span>
                    ))}
                  </div>
                  {preferences.fridgeIngredients && preferences.fridgeIngredients.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs opacity-75 mb-1">冷蔵庫の食材も活用</p>
                      <div className="flex flex-wrap gap-1">
                        {preferences.fridgeIngredients.map((item, i) => (
                          <span key={i} className="bg-blue-400/30 px-2 py-0.5 rounded-full text-xs border border-blue-300/30">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isSaving && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-600 flex items-center gap-2">
                    <Database className="w-4 h-4 animate-pulse" />
                    チラシデータをDBに保存中...
                  </div>
                )}
                {saveError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    DB保存エラー: {saveError}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">おすすめレシピ 3選</h2>
                  <span className="text-sm text-gray-500">
                    予算: {preferences.budget}円 / {preferences.cuisine === CuisineType.OTHER ? preferences.customCuisine : preferences.cuisine}
                  </span>
                </div>

                <div className="grid gap-6">
                  {result.recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      isSaved={isSaved(recipe.id)}
                      onSave={handleSaveRecipe}
                      onAddToShoppingList={handleAddToShoppingList}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-8 text-center max-w-lg mx-auto">
                <div className="inline-block bg-orange-100 p-6 rounded-full mb-6">
                  <Smile className="w-16 h-16 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">これはチラシちゃいますやん！</h2>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8 relative">
                  <div className="text-4xl absolute -top-4 -left-2">❝</div>
                  <p className="text-xl text-gray-700 font-medium leading-relaxed italic">{result.joke}</p>
                  <div className="text-4xl absolute -bottom-8 -right-2 text-gray-300">❞</div>
                </div>
                <button
                  onClick={resetApp}
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-all"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  別の画像で試す
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <ShoppingList items={shoppingItems} onItemsChange={setShoppingItems} />
    </div>
  );
};

export default App;