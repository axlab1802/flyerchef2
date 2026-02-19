import React, { useState } from 'react';
import { ShoppingCart, Check, Trash2, Tag } from 'lucide-react';
import { ShoppingItem } from '../types';

interface ShoppingListProps {
  items: ShoppingItem[];
  onItemsChange: (items: ShoppingItem[]) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onItemsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (id: string) => {
    onItemsChange(items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const clearChecked = () => {
    onItemsChange(items.filter((item) => !item.checked));
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const groupedByRecipe = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    if (!acc[item.recipeTitle]) acc[item.recipeTitle] = [];
    acc[item.recipeTitle].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed bottom-6 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg font-bold transition-all"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-sm">買い物リスト</span>
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {items.length - checkedCount > 0 ? items.length - checkedCount : <Check className="w-3 h-3" />}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-green-500 px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              買い物リスト
            </h3>
            <span className="text-green-100 text-sm">{checkedCount}/{items.length} 完了</span>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              レシピカードの「リストに追加」ボタンで食材を追加できます
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto">
                {Object.entries(groupedByRecipe).map(([recipeTitle, recipeItems]) => (
                  <div key={recipeTitle}>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500">{recipeTitle}</span>
                    </div>
                    {recipeItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${item.checked ? 'opacity-50' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                          {item.checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">{item.quantity}</span>
                        </div>
                        {item.isDiscounted && (
                          <Tag className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {checkedCount > 0 && (
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={clearChecked}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    チェック済みを削除
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
