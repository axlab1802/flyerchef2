import React from 'react';
import { Nutrition } from '../types';

interface NutritionBadgeProps {
  nutrition: Nutrition;
}

const NutritionBadge: React.FC<NutritionBadgeProps> = ({ nutrition }) => {
  const items = [
    { label: 'カロリー', value: `${nutrition.calories}`, unit: 'kcal', color: 'bg-orange-100 text-orange-700', bar: null },
    { label: 'タンパク質', value: `${nutrition.protein.toFixed(1)}`, unit: 'g', color: 'bg-blue-100 text-blue-700', bar: Math.min((nutrition.protein / 60) * 100, 100) },
    { label: '脂質', value: `${nutrition.fat.toFixed(1)}`, unit: 'g', color: 'bg-yellow-100 text-yellow-700', bar: Math.min((nutrition.fat / 60) * 100, 100) },
    { label: '炭水化物', value: `${nutrition.carbs.toFixed(1)}`, unit: 'g', color: 'bg-green-100 text-green-700', bar: Math.min((nutrition.carbs / 300) * 100, 100) },
    { label: '食物繊維', value: `${nutrition.fiber.toFixed(1)}`, unit: 'g', color: 'bg-purple-100 text-purple-700', bar: Math.min((nutrition.fiber / 20) * 100, 100) },
  ];

  const barColors = ['', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400'];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <h4 className="text-sm font-bold text-gray-600 mb-3">栄養バランス（1人前の目安）</h4>

      <div className="flex gap-2 flex-wrap mb-3">
        {items.map((item) => (
          <span key={item.label} className={`px-2 py-1 rounded-lg text-xs font-bold ${item.color}`}>
            {item.label} {item.value}{item.unit}
          </span>
        ))}
      </div>

      <div className="space-y-1.5">
        {items.slice(1).map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${barColors[i + 1]}`}
                style={{ width: `${item.bar}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">{item.value}{item.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionBadge;
