import React, { useState } from 'react';
import { Plus, X, Refrigerator } from 'lucide-react';

interface FridgeInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

const FridgeInput: React.FC<FridgeInputProps> = ({ ingredients, onChange }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed]);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (item: string) => {
    onChange(ingredients.filter((i) => i !== item));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center space-x-2 text-gray-800 font-bold text-lg">
        <Refrigerator className="w-6 h-6 text-blue-500" />
        <span>冷蔵庫の残り食材</span>
        <span className="text-sm font-normal text-gray-400">（任意）</span>
      </label>
      <p className="text-xs text-gray-500">入力した食材をレシピに活用します</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例: 卵、豆腐、にんじん"
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none text-sm text-gray-800"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium"
            >
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FridgeInput;
