import { X, ArrowLeft } from 'lucide-react';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: 'clothes' | 'shoes' | 'accessories') => void;
}

export function CategorySelectModal({
  isOpen,
  onClose,
  onSelectCategory,
}: CategorySelectModalProps) {
  if (!isOpen) return null;

  const categories = [
    {
      id: 'clothes' as const,
      title: 'الملابس',
      description: 'أحدث تصاميم الملابس العصرية والأنيقة',
      color: 'bg-amber-50 text-amber-600 border-amber-200/80',
      badge: 'تشكيلة واسعة',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'shoes' as const,
      title: 'الأحذية',
      description: 'أحذية رياضية وكلاسيكية بمختلف المقاسات',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      badge: 'أكثر طلباً',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'accessories' as const,
      title: 'الإكسسوارات',
      description: 'إكسسوارات راقية تكمل أناقتك اليومية',
      color: 'bg-purple-50 text-purple-600 border-purple-200/80',
      badge: 'لمسة فريدة',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-900">اختر القسم الذي تريد تصفحه</h3>
            <p className="text-xs text-gray-500 mt-0.5">حدد التصنيف لبدء التسوق مباشرة</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onClose();
              }}
              className="w-full group text-right flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-gray-200 hover:border-gray-900 hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50/50"
            >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                        {cat.title}
                      </h4>
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {cat.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-colors shrink-0 text-gray-400">
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </button>
            )
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            يمكنك أيضاً تصفح جميع المنتجات عبر النزول لأسفل الصفحة الرئيسية
          </p>
        </div>
      </div>
    </div>
  );
}
