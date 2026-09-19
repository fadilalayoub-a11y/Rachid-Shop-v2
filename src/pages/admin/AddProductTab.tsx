import { FormEvent, Dispatch, SetStateAction } from 'react';
import { Plus, Image as ImageIcon, CheckCircle, ShieldAlert, Trash2, Package } from 'lucide-react';

interface AddProductTabProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  originalPrice: string;
  setOriginalPrice: (v: string) => void;
  inventory: { size: string; stock: string }[];
  setInventory: Dispatch<SetStateAction<{ size: string; stock: string }[]>>;
  category: 'clothes' | 'shoes' | 'accessories';
  setCategory: (v: 'clothes' | 'shoes' | 'accessories') => void;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  isSubmitting: boolean;
  formMessage: { type: string; text: string };
  setFormMessage: (msg: { type: string; text: string }) => void;
  productsCount: number;
  onGoToInventory: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

export function AddProductTab({
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  originalPrice,
  setOriginalPrice,
  inventory,
  setInventory,
  category,
  setCategory,
  imageFile,
  setImageFile,
  isSubmitting,
  formMessage,
  setFormMessage,
  productsCount,
  onGoToInventory,
  onSubmit,
}: AddProductTabProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              إضافة منتج جديد
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              أدخل بيانات المنتج وحدد الكميات المتوفرة لكل مقاس في المخزون
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToInventory}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-bold bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Package className="w-4 h-4" />
            عرض المخزون ({productsCount})
          </button>
        </div>

        {formMessage.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              formMessage.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {formMessage.type === 'error' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span>{formMessage.text}</span>
              </div>
              {formMessage.type !== 'error' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onGoToInventory();
                      setFormMessage({ type: '', text: '' });
                    }}
                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    الانتقال إلى المخزون
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMessage({ type: '', text: '' })}
                    className="px-3.5 py-1.5 bg-white border border-green-300 hover:bg-green-100 text-green-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    إضافة منتج آخر
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم المنتج</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قميص كتان صيفي"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">القسم</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'clothes' | 'shoes' | 'accessories')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm cursor-pointer bg-white"
              >
                <option value="clothes">ملابس</option>
                <option value="shoes">أحذية</option>
                <option value="accessories">إكسسوارات</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">السعر الحالي (درهم)</label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="مثال: 199"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">السعر الأصلي القديم (درهم) - اختياري</label>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="لإظهار شارة تخفيض (مثال: 299)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">وصف المنتج ومميزاته</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً مفصلاً للمنتج (الخامة، الملمس، إرشادات الغسيل...)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>

          {/* Inventory & Sizes configuration */}
          <div className="bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="block text-sm font-bold text-gray-800">المقاسات والكميات المتوفرة بالمخزون</label>
                <p className="text-xs text-gray-500">حدد المقاس وعدد القطع المتاحة لكل مقاس</p>
              </div>

              {/* Quick presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setInventory([
                      { size: 'S', stock: '5' },
                      { size: 'M', stock: '10' },
                      { size: 'L', stock: '10' },
                      { size: 'XL', stock: '5' },
                      { size: 'XXL', stock: '3' },
                    ]);
                  }}
                  className="text-[11px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  + مقاسات ملابس (S إلى XXL)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInventory([
                      { size: '40', stock: '4' },
                      { size: '41', stock: '6' },
                      { size: '42', stock: '8' },
                      { size: '43', stock: '6' },
                      { size: '44', stock: '4' },
                    ]);
                  }}
                  className="text-[11px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  + مقاسات أحذية (40 إلى 44)
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {inventory.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={item.size}
                      onChange={(e) => {
                        const newInventory = [...inventory];
                        newInventory[index].size = e.target.value;
                        setInventory(newInventory);
                      }}
                      placeholder="المقاس (مثال: M أو 42 أو قياس موحد)"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      dir="ltr"
                    />
                  </div>
                  <div className="w-1/2">
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) => {
                        const newInventory = [...inventory];
                        newInventory[index].stock = e.target.value;
                        setInventory(newInventory);
                      }}
                      placeholder="الكمية / عدد القطع"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  {inventory.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setInventory(inventory.filter((_, i) => i !== index))}
                      className="p-2 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                      title="حذف هذا المقاس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setInventory([...inventory, { size: '', stock: '' }])}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 mt-3 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مقاس آخر
            </button>
          </div>

          {/* Product Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">صورة المنتج</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl relative hover:bg-gray-50 transition-colors">
              <div className="space-y-2 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold transition-colors">
                    <span>اختر صورة المنتج</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {imageFile ? (
                    <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      تم اختيار: {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                    </span>
                  ) : (
                    'يدعم ملفات JPG, PNG, WEBP عالية الجودة'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>جاري إضافة المنتج للمتجر...</>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  إضافة المنتج وحفظه في المخزون
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
