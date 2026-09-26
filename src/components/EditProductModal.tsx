import { useState, useEffect, FormEvent, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { X, Plus, Trash2, Image as ImageIcon, Loader2, UploadCloud, Star } from 'lucide-react';
import { normalizeProductImageUrl } from '../utils/image';
import { STORE_SUBCATEGORIES, getSubcategoriesForCategory } from '../constants/categories';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated?: () => void;
}

export function EditProductModal({ product, isOpen, onClose, onProductUpdated }: EditProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<'clothes' | 'shoes' | 'accessories'>('clothes');
  const [subcategory, setSubcategory] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [inventory, setInventory] = useState<{ size: string; stock: string }[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? String(product.price) : '');
      setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
      setCategory(product.category || 'clothes');
      setSubcategory(product.subcategory || '');
      setCollections(Array.isArray(product.collections) ? product.collections : []);

      const imgs: string[] = [];
      if (product.image && product.image.trim() !== '') imgs.push(product.image.trim());
      if (product.secondaryImage && product.secondaryImage.trim() !== '' && !imgs.includes(product.secondaryImage.trim())) {
        imgs.push(product.secondaryImage.trim());
      }
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (img && typeof img === 'string' && img.trim() !== '' && !imgs.includes(img.trim())) imgs.push(img.trim());
        });
      }


      setExistingImages(imgs);
      setNewImageFiles([]);
      setMessage({ type: '', text: '' });

      if (product.inventory && product.inventory.length > 0) {
        setInventory(product.inventory.map(inv => ({ size: inv.size, stock: String(inv.stock) })));
      } else {
        setInventory([{ size: '', stock: '' }]);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (filesArray.length > 0) {
      setNewImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name || !description || !price) {
      setMessage({ type: 'error', text: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الوصف، السعر)' });
      return;
    }

    if (existingImages.length === 0 && newImageFiles.length === 0) {
      setMessage({ type: 'error', text: 'يجب أن يحتوي المنتج على صورة واحدة على الأقل' });
      return;
    }

    setIsSubmitting(true);

    try {
      const newlyUploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        const signatureRes = await fetch('/api/cloudinary-sign');
        const signatureData = await signatureRes.json();

        if (!signatureRes.ok) {
          throw new Error(signatureData.error || 'فشل الحصول على تصريح رفع الصور');
        }

        const { timestamp, signature, apiKey, cloudName } = signatureData;
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        for (const file of newImageFiles) {
          const addFormData = new FormData();
          addFormData.append('file', file);
          addFormData.append('api_key', apiKey);
          addFormData.append('timestamp', timestamp.toString());
          addFormData.append('signature', signature);

          const addUploadRes = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: addFormData,
          });

          const addUploadData = await addUploadRes.json();
          if (!addUploadRes.ok || !addUploadData.secure_url) {
            throw new Error(addUploadData.error?.message || 'فشل رفع إحدى الصور');
          }

          newlyUploadedUrls.push(addUploadData.secure_url);
        }
      }

      // Combine images
      const combinedImages = [...existingImages, ...newlyUploadedUrls];
      const primaryImageUrl = combinedImages[0];
      const secondaryImageUrl = combinedImages.length > 1 ? combinedImages[1] : null;

      // Filter and format inventory
      const validInventory = inventory
        .filter(item => item.size.trim() !== '')
        .map(item => ({
          size: item.size.trim(),
          stock: item.stock ? Math.max(0, Number(item.stock)) : 0,
        }));

      // Update Firestore document
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        name: name.trim(),
        title: name.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        compare_at_price: originalPrice ? Number(originalPrice) : null,
        category,
        category_id: category,
        subcategory: subcategory.trim(),
        subcategory_id: subcategory.trim(),
        collections,
        inventory: validInventory,
        image: primaryImageUrl,
        secondaryImage: secondaryImageUrl,
        images: combinedImages,
      });

      setMessage({ type: 'success', text: 'تم تحديث بيانات المنتج بنجاح!' });
      if (onProductUpdated) onProductUpdated();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setMessage({ type: 'error', text: `خطأ أثناء التحديث: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h2 className="text-xl font-bold text-gray-900">تعديل المنتج</h2>
            <p className="text-xs text-gray-500">تعديل الأسعار والمقاسات والكميات المتوفرة</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 overflow-y-auto flex-1">
          {message.text && (
            <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الحالي (درهم)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي قبل التخفيض (اختياري)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  placeholder="لإظهار نسبة الخصم"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القسم الرئيسي</label>
                <select
                  value={category}
                  onChange={e => {
                    const newCat = e.target.value as 'clothes' | 'shoes' | 'accessories';
                    setCategory(newCat);
                    const subs = getSubcategoriesForCategory(newCat);
                    if (subs.length > 0) {
                      setSubcategory(subs[0].id);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
                >
                  <option value="clothes">ملابس (Clothes)</option>
                  <option value="shoes">أحذية (Shoes)</option>
                  <option value="accessories">إكسسوارات (Accessories)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القسم التفصيلي</label>
                <select
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value)}
                  className="w-full px-4 py-2 border border-blue-300 bg-blue-50/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer font-bold text-gray-900"
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

            {/* تحديد المجموعات (Collections) */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                المجموعات والتشكيلات التابع لها المنتج
              </label>
              <p className="text-xs text-gray-500 mb-2.5">
                حدد المجموعة ليظهر المنتج داخلها تلقائياً
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'denim-casual', label: 'جينز وكاجوال (Denim & Casual)' },
                  { id: 'sportswear-gym', label: 'ملابس رياضية (Sportswear & Gym)' },
                  { id: 'summer-essentials', label: 'أساسيات الصيف (Summer Essentials)' },
                  { id: 'watches-fragrances', label: 'ساعات وعطور (Watches & Fragrances)' },
                ].map((item) => {
                  const isChecked = collections.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold select-none ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCollections(prev => [...prev, item.id]);
                          } else {
                            setCollections(prev => prev.filter(c => c !== item.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Inventory (Sizes and Stock) */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                المقاسات والكمية المتوفرة (السطوك)
              </label>
              
              {inventory.map((item, index) => (
                <div key={index} className="flex gap-3 mb-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.size}
                      onChange={e => {
                        const newInv = [...inventory];
                        newInv[index].size = e.target.value;
                        setInventory(newInv);
                      }}
                      placeholder="المقاس (مثال: M أو 42)"
                      dir="ltr"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center font-medium text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={e => {
                        const newInv = [...inventory];
                        newInv[index].stock = e.target.value;
                        setInventory(newInv);
                      }}
                      placeholder="الكمية المتوفرة"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center font-bold text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setInventory(inventory.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                    title="حذف هذا المقاس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setInventory([...inventory, { size: '', stock: '' }])}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 mt-2 transition-colors"
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
                    {(existingImages.length + newImageFiles.length) > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                        {existingImages.length + newImageFiles.length} صورة
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    الصورة الأولى هي الصورة الرئيسية للمنتج، والثانية تظهر عند التمرير (Hover).
                  </p>
                </div>

                {/* Single Upload Button */}
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

              {/* Drag and Drop & Gallery Area */}
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
                {existingImages.length === 0 && newImageFiles.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center py-8 cursor-pointer group"
                  >
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">اضغط هنا أو اسحب الصور لرفعها</p>
                    <p className="text-xs text-gray-400 mt-1">يمكنك رفع صورة واحدة أو عدة صور دفعة واحدة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {/* Existing Saved Images */}
                    {existingImages.map((url, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className={`relative group/img aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 transition-all p-1.5 shadow-2xs ${
                          idx === 0
                            ? 'border-blue-500 ring-2 ring-blue-100'
                            : idx === 1
                            ? 'border-purple-400'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={normalizeProductImageUrl(url)}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />

                        {/* Badges */}
                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                          {idx === 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              الرئيسية
                            </span>
                          )}
                          {idx === 1 && (
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                              Hover
                            </span>
                          )}
                        </div>

                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setExistingImages(prev => {
                                  const copy = [...prev];
                                  const [picked] = copy.splice(idx, 1);
                                  return [picked, ...copy];
                                });
                              }}
                              className="bg-white/90 hover:bg-white text-blue-700 text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm transition-colors cursor-pointer"
                              title="تعيين كصورة رئيسية"
                            >
                              الرئيسية
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setExistingImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <span className="absolute bottom-1.5 left-1.5 bg-gray-900/70 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-2xs font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* New Staged Files */}
                    {newImageFiles.map((file, idx) => {
                      const displayIdx = existingImages.length + idx;
                      return (
                        <div
                          key={`new-${idx}`}
                          className={`relative group/img aspect-square rounded-xl overflow-hidden bg-blue-50/20 border-2 border-dashed border-blue-400 transition-all p-1.5 shadow-2xs ${
                            displayIdx === 0 ? 'ring-2 ring-blue-100' : ''
                          }`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`صورة جديدة ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />

                          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                            {displayIdx === 0 && (
                              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                الرئيسية
                              </span>
                            )}
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                              جديدة
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            {displayIdx !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  // move this new file to be primary
                                  setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
                                  setNewImageFiles(prev => [file, ...prev]);
                                  // if there are existing images, move this file ahead of everything by shifting existing images
                                }}
                                className="bg-white/90 hover:bg-white text-blue-700 text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm transition-colors cursor-pointer"
                              >
                                تقديم
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                              title="إلغاء الصورة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <span className="absolute bottom-1.5 left-1.5 bg-blue-700/80 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-2xs font-mono">
                            #{displayIdx + 1}
                          </span>
                        </div>
                      );
                    })}

                    {/* Add More Button in grid */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-gray-500 hover:text-blue-600"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-xs font-bold">إضافة المزيد</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <span>حفظ التعديلات</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
