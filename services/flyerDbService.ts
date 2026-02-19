export interface FlyerItem {
  id?: number;
  name: string;
  price?: number;
  isDiscounted: boolean;
}

export interface FlyerRecord {
  id: number;
  store_name: string;
  flyer_date: string;
  image_urls: string[];
  created_at: string;
  items: FlyerItem[];
}

export const saveFlyer = async (
  files: File[],
  storeName: string,
  flyerDate: string,
  items: FlyerItem[]
): Promise<{ flyerId: number; imageUrls: string[] }> => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('storeName', storeName);
  formData.append('flyerDate', flyerDate);
  formData.append('items', JSON.stringify(items));

  const res = await fetch('/api/save-flyer', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'チラシの保存に失敗しました');
  }

  return res.json();
};

export const getFlyers = async (): Promise<FlyerRecord[]> => {
  const res = await fetch('/api/get-flyers');
  if (!res.ok) throw new Error('チラシ履歴の取得に失敗しました');
  const data = await res.json();
  return data.flyers;
};
