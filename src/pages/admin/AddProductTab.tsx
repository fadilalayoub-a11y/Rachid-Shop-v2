import { FormEvent, Dispatch, SetStateAction, useState, useRef } from 'react';
import { Plus, Image as ImageIcon, CheckCircle, Trash2, UploadCloud, Star, Package, ShieldAlert, Layers } from 'lucide-react';
import { STORE_SUBCATEGORIES, getSubcategoriesForCategory } from '../../constants/categories';

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
  subcategory: string;
  setSubcategory: (v: string) => void;
  collections: string[];
  setCollections: Dispatch<SetStateAction<string[]>>;
  imageFiles: File[];
  setImageFiles: Dispatch<SetStateAction<File[]>>;
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
  subcategory,
  setSubcategory,
  collections,
  setCollections,
  imageFiles,
  setImageFiles,
  isSubmitting,
  formMessage,
  setFormMessage,
  productsCount,
  onGoToInventory,
  onSubmit,
}: AddProductTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const setAsPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImageFiles(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(indexToPrimary, 1);
      return [selected, ...copy];
    });
  };
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
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم المنتج</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: هودي قطني رمادي فضفاض"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">القسم الرئيسي</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as 'clothes' | 'shoes' | 'accessories';
                  setCategory(newCat);
                  // اقتراح أول قسم تفصيلي تابع لهذا القسم الرئيسي
                  const subs = getSubcategoriesForCategory(newCat);
                  if (subs.length > 0) {
                    setSubcategory(subs[0].id);
                  }
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm cursor-pointer bg-white font-medium"
              >
                <option value="clothes">ملابس (Clothes)</option>
                <option value="shoes">أحذية (Shoes)</option>
                <option value="accessories">إكسسوارات (Accessories)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                القسم التفصيلي
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-blue-300 bg-blue-50/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm cursor-pointer font-bold text-gray-900"
              >
                <option value="">-- اختر القسم التفصيلي --</option>
                {getSubcategoriesForCategory(category).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* تحديد المجموعات (Collections) التي ينتمي إليها المنتج */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="mb-2.5">
              <label className="block text-sm font-bold text-gray-800">
                المجموعات والتشكيلات التابع لها المنتج
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                اختر المجموعة أو المجموعات ليظهر هذا المنتج تلقائياً في صفحة المجموعة المعنية في المتجر
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'denim-casual', label: 'جينز وكاجوال (Denim & Casual)', desc: 'بناطيل جينز، جواكت كاجوال، قمصان يومية' },
                { id: 'sportswear-gym', label: 'ملابس رياضية (Sportswear & Gym)', desc: 'كيطمة، هوديز، سنيكرز، شورتات تمرين' },
                { id: 'summer-essentials', label: 'أساسيات الصيف (Summer Essentials)', desc: 'قمصان صيفية، شورتات، كلاكيط، نظارات' },
                { id: 'watches-fragrances', label: 'ساعات وعطور (Watches & Fragrances)', desc: 'ساعات يد، عطور فاخرة، إكسسوارات' },
              ].map((item) => {
                const isSelected = collections.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCollections(prev => [...prev, item.id]);
                        } else {
                          setCollections(prev => prev.filter(c => c !== item.id));
                        }
                      }}
                      className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs sm:text-sm font-bold leading-tight">{item.label}</span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
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

          {/* Product Images - Unified Single Upload Button & Interactive Gallery */}
          <div className="p-4 sm:p-5 border border-gray-200 rounded-2xl bg-gray-50/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  صور المنتج
                  <span className="text-red-500 font-bold">*</span>
                  {imageFiles.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                      {imageFiles.length} {imageFiles.length === 1 ? 'صورة' : 'صور'}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  اضغط على زر الرفع أو اسحب الصور هنا. تظهر الصورة الأولى كصورة رئيسية، والثانية عند تمرير الفأرة (Hover).
                </p>
              </div>

              {/* Single File Upload Button */}
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors shrink-0">
                <Plus className="w-4 h-4" />
                <span>رفع صور للمنتج</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    handleFilesAdded(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            {/* Drag and Drop & Empty / Gallery Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesAdded(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } p-4`}
            >
              {imageFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="text-center py-8 cursor-pointer group"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-700">اضغط هنا أو اسحب الصور لرفعها</p>
                  <p className="text-xs text-gray-400 mt-1">يمكنك رفع صورة واحدة أو عدة صور دفعة واحدة بدون أي قيود</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imageFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className={`relative group/img aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 transition-all p-1.5 shadow-2xs ${
                          idx === 0
                            ? 'border-blue-500 ring-2 ring-blue-100'
                            : idx === 1
                            ? 'border-purple-400'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />

                        {/* Badges for Primary & Hover */}
                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                          {idx === 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              الرئيسية
                            </span>
                          )}
                          {idx === 1 && (
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                              عند التمرير (Hover)
                            </span>
                          )}
                        </div>

                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => setAsPrimary(idx)}
                              className="bg-white/90 hover:bg-white text-blue-700 text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm transition-colors cursor-pointer"
                              title="تعيين كصورة رئيسية"
                            >
                              جعلها الرئيسية
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-2xs font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* Add More Button inside grid */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-gray-500 hover:text-blue-600"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-xs font-bold">إضافة المزيد</span>
                    </div>
                  </div>
                </div>
              )}
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
