import { X, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }: CartDrawerProps) {
  const navigate = useNavigate();
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  const handleContinueShopping = () => {
    onClose();
    navigate('/');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">سلة المشتريات</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
              <p className="text-lg">سلة المشتريات فارغة</p>
              <button 
                onClick={onClose}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {cartItems.map((item) => (
                <li key={item.cartItemId} className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.selectedSize && (
                            <span className="text-xs text-gray-500 font-medium">المقاس: {item.selectedSize}</span>
                          )}
                          {(() => {
                            const inv = item.inventory?.find(i => i.size === item.selectedSize);
                            const remaining = inv ? inv.stock : null;
                            if (remaining !== null && remaining <= 3) {
                              return (
                                <span className="text-[11px] text-gray-400 font-normal">
                                  (باقي {remaining} قطع)
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-red-400 hover:text-red-600 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                          onClick={() => onUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          disabled={
                            item.inventory?.find(i => i.size === item.selectedSize) 
                              ? item.quantity >= (item.inventory.find(i => i.size === item.selectedSize)!.stock) 
                              : false
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">{item.price * item.quantity} درهم</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">المجموع:</span>
              <span className="text-2xl font-bold text-gray-900">{totalAmount} درهم</span>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onCheckout}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors active:scale-[0.98] shadow-md shadow-blue-500/20"
              >
                إتمام الطلب
              </button>
              <button 
                onClick={handleContinueShopping}
                className="w-full bg-white text-gray-700 border border-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                إكمال التسوق
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
