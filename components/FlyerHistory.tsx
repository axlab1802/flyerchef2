import React, { useEffect, useState } from 'react';
import { Database, Store, Calendar, Tag, ChevronDown, ChevronUp, ImageIcon, RefreshCw } from 'lucide-react';
import { getFlyers, FlyerRecord } from '../services/flyerDbService';

const FlyerHistory: React.FC = () => {
  const [flyers, setFlyers] = useState<FlyerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlyers();
      setFlyers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
        <p className="font-bold mb-1">取得エラー</p>
        <p>{error}</p>
        <button onClick={load} className="mt-2 text-xs underline">再試行</button>
      </div>
    );
  }

  if (flyers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
        <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>まだチラシが保存されていません</p>
        <p className="text-xs mt-1">チラシを解析すると自動的に保存されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500" />
          チラシ履歴
        </h2>
        <button onClick={load} className="text-gray-400 hover:text-indigo-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {flyers.map((flyer) => {
        const isExpanded = expandedId === flyer.id;
        const imageUrls: string[] = Array.isArray(flyer.image_urls) ? flyer.image_urls : JSON.parse(flyer.image_urls as any || '[]');
        const discountedItems = flyer.items.filter((i) => i.isDiscounted);
        const regularItems = flyer.items.filter((i) => !i.isDiscounted);

        return (
          <div key={flyer.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : flyer.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="font-bold text-gray-800 truncate">{flyer.store_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {flyer.flyer_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-red-400" />
                      特売 {discountedItems.length}品
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {imageUrls.length}枚
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(flyer.created_at).toLocaleDateString('ja-JP')}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Thumbnail strip */}
              {imageUrls.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imageUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`チラシ ${i + 1}`}
                      className="h-16 w-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-4">
                {discountedItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> 特売品
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {discountedItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                          {item.price != null && (
                            <span className="text-sm font-bold text-red-600 ml-2 flex-shrink-0">¥{item.price}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {regularItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 mb-2">その他の食材</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {regularItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-700 truncate">{item.name}</span>
                          {item.price != null && (
                            <span className="text-sm text-gray-500 ml-2 flex-shrink-0">¥{item.price}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {flyer.items.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">食材データなし</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FlyerHistory;
