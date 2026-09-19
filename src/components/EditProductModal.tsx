import { useState, useEffect, FormEvent } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { X, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

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
  const [inventory, setInventory] = useState<{ size: string; stock: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? String(product.price) : '');
      setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
      setCategory(product.category || 'clothes');
      setPreviewImage(product.image || '');
      setImageFile(null);
      setMessage({ type: '', text: '' });

      if (product.inventory && product.inventory.length > 0) {
        setInventory(product.inventory.map(inv => ({ size: inv.size, stock: String(inv.stock) })));
      } else {
        setInventory([{ size: '', stock: '' }]);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name || !description || !price) {
      setMessage({ type: 'error', text: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الوصف، السعر)' });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = product.image;

      // Upload new image to Cloudinary if selected
      if (imageFile) {
        // 1. Get Signature from our secure Serverless Function
        const signatureRes = await fetch('/api/cloudinary-sign');
        const signatureData = await signatureRes.json();

        if (!signatureRes.ok) {
          throw new Error(signatureData.error || 'فشل الحصول على تصريح رفع الصورة');
        }

        const { timestamp, signature, apiKey, cloudName } = signatureData;

        // 2. Upload Image to Cloudinary (Signed)
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadRes = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || 'فشل رفع الصورة الجديدة');
        }

        finalImageUrl = uploadData.secure_url;
      }

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
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category,
        inventory: validInventory,
        image: finalImageUrl,
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as 'clothes' | 'shoes' | 'accessories')}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="clothes">ملابس</option>
                <option value="shoes">أحذية</option>
                <option value="accessories">إكسسوارات</option>
              </select>
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

            {/* Image Preview & Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 px-4 rounded-xl transition-colors shadow-sm">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span>تغيير الصورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    {imageFile ? imageFile.name : 'اترك الحقل فارغاً للاحتفاظ بالصورة الحالية'}
                  </p>
                </div>
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
