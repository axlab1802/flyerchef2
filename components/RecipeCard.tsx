import React, { useState } from 'react';
import { Recipe, ShoppingItem } from '../types';
import { Clock, TrendingDown, ChevronDown, ChevronUp, ShoppingBag, Bookmark, BookmarkCheck, ShoppingCart } from 'lucide-react';
import NutritionBadge from './NutritionBadge';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onSave?: (recipe: Recipe) => void;
  onAddToShoppingList?: (items: ShoppingItem[]) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved, onSave, onAddToShoppingList }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedToList, setAddedToList] = useState(false);

  const handleAddToShoppingList = () => {
    if (!onAddToShoppingList) return;
    const items: ShoppingItem[] = recipe.ingredients.map((ing, i) => ({
      id: `${recipe.id}-ing-${i}`,
      name: ing.name,
      quantity: ing.quantity,
      isDiscounted: ing.isDiscounted,
      checked: false,
      recipeTitle: recipe.title,
    }));
    onAddToShoppingList(items);
    setAddedToList(true);
    setTimeout(() => setAddedToList(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 leading-tight">{recipe.title}</h3>
          <span className="flex-shrink-0 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
            ¥{recipe.estimatedCost}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-gray-400" />
            {recipe.cookingTimeMinutes}分
          </div>
          <div className="flex items-center text-green-600 font-medium">
            <TrendingDown className="w-4 h-4 mr-1" />
            特売活用
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
          <p className="text-xs text-green-800">
            <span className="font-bold">💡 ポイント:</span> {recipe.savingsNote}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.ingredients.filter(i => i.isDiscounted).slice(0, 3).map((ing, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
              <ShoppingBag className="w-3 h-3 mr-1" />
              {ing.name}
            </span>
          ))}
          {recipe.ingredients.filter(i => i.isDiscounted).length > 3 && (
            <span className="text-xs text-gray-400 self-center">+他</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-2">
          {onSave && (
            <button
              onClick={() => onSave(recipe)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isSaved
                  ? 'bg-orange-50 text-orange-600 border-orange-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isSaved ? '保存済み' : 'レシピを保存'}
            </button>
          )}
          {onAddToShoppingList && (
            <button
              onClick={handleAddToShoppingList}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                addedToList
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {addedToList ? '追加しました！' : 'リストに追加'}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-orange-500 transition-colors border-t border-gray-100 mt-2"
        >
          {isExpanded ? (
            <>閉じる <ChevronUp className="w-4 h-4 ml-1" /></>
          ) : (
            <>レシピを見る <ChevronDown className="w-4 h-4 ml-1" /></>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">材料</h4>
            <ul className="space-y-2 text-sm">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex justify-between items-center border-b border-gray-200 border-dashed pb-1 last:border-0">
                  <span className={`flex items-center ${ing.isDiscounted ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {ing.isDiscounted && <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>}
                    {ing.name}
                  </span>
                  <span className="text-gray-500">{ing.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">作り方</h4>
            <ol className="space-y-4">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex text-sm text-gray-600 leading-relaxed">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-500 mr-3">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.nutrition && <NutritionBadge nutrition={recipe.nutrition} />}
        </div>
      )}
    </div>
  );
};

export default RecipeCard;