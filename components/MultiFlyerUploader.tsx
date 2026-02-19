import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, FileImage, FileText, Clipboard, Plus } from 'lucide-react';

interface MultiFlyerUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const MultiFlyerUploader: React.FC<MultiFlyerUploaderProps> = ({ files, onFilesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const addFiles = (newFiles: File[]) => {
    const added: { file: File; url: string }[] = newFiles.map((f) => ({
      file: f,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
    }));
    setPreviews((prev) => [...prev, ...added]);
    onFilesChange([...files, ...newFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const removed = previews[index];
    if (removed.url) URL.revokeObjectURL(removed.url);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onFilesChange(newPreviews.map((p) => p.file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    if (dropped.length > 0) addFiles(dropped);
  };

  const handlePasteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const items = await navigator.clipboard.read();
      const imageFiles: File[] = [];
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          imageFiles.push(new File([blob], 'pasted-image.png', { type: imageType }));
        }
      }
      if (imageFiles.length > 0) addFiles(imageFiles);
      else alert('クリップボードに画像が見つかりませんでした');
    } catch {
      alert('クリップボードの画像を読み取れませんでした。\nブラウザの設定でクリップボードへのアクセスを許可してください。');
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files).filter(
          (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
        );
        if (pastedFiles.length > 0) {
          e.preventDefault();
          addFiles(pastedFiles);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [files]);

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        multiple
        className="hidden"
      />

      {files.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 h-56 group"
        >
          <div className="bg-orange-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">チラシをアップロード</p>
          <p className="text-sm text-gray-500 mt-1 text-center">
            複数のチラシをまとめて選択できます<br />
            <span className="text-xs text-gray-400">（画像またはPDFに対応）</span>
          </p>
          <div className="relative w-full max-w-xs mt-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-2 text-xs text-gray-400 group-hover:bg-orange-50 transition-colors">または</span>
            </div>
          </div>
          <button
            onClick={handlePasteClick}
            className="mt-3 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600 hover:border-orange-300 transition-colors z-10"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            クリップボードから貼り付け
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm group">
                {p.url ? (
                  <img src={p.url} alt={p.file.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center bg-red-50">
                    <FileText className="w-10 h-10 text-red-400" />
                  </div>
                )}
                <div className="px-2 py-1 flex items-center justify-between bg-white border-t border-gray-100">
                  <span className="text-xs text-gray-600 truncate flex items-center gap-1">
                    {p.url ? <FileImage className="w-3 h-3 text-orange-400 flex-shrink-0" /> : <FileText className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    {p.file.name}
                  </span>
                  <button onClick={() => handleRemove(i)} className="text-gray-400 hover:text-red-500 transition-colors ml-1 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-orange-300 rounded-xl text-orange-500 hover:bg-orange-50 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            チラシを追加する
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiFlyerUploader;
