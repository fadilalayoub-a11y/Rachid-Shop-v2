import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MessageCircle,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { normalizeProductImageUrl } from '../utils/image';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = [];
      snapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(fetchedOrders);
      setPermissionError(null);
      setLoading(false);
    }, (err) => {
      console.warn('Orders snapshot status:', err.message);
      if (err.code === 'permission-denied') {
        setPermissionError('يرجى التأكد من صلاحيات الوصول لقسم الطلبات أو إعادة تحديث الصفحة.');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'delivered' | 'cancelled') => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'orders', orderToDelete));
      setOrderToDelete(null);
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const formatOrderDate = (createdAt: any) => {
    if (!createdAt) return 'منذ قليل';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return new Intl.DateTimeFormat('ar-MA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  // Format WhatsApp link for Moroccan numbers
  const getWhatsAppLink = (phone: string, customerName: string, orderTotal: number) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '212' + cleanPhone.substring(1);
    }
    const message = encodeURIComponent(`السلام عليكم أخي/أختي ${customerName}، معكم متجر Rachid Shop بخصوص تأكيد طلبك بقيمة ${orderTotal} درهم.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">إجمالي المبيعات النشطة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalRevenue} <span className="text-sm font-normal text-gray-500">درهم</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">طلبات قيد المعالجة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{pendingCount} <span className="text-sm font-normal text-gray-500">طلبات</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">طلبات تم تسليمها</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{deliveredCount} <span className="text-sm font-normal text-gray-500">طلبات</span></p>
          </div>
        </div>
      </div>

      {/* Orders Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-500" />
          <h2 className="font-bold text-gray-900 text-lg">سجل الطلبات ({orders.length})</h2>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            الكل ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-white text-amber-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            قيد المعالجة ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'delivered' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            تم التسليم ({deliveredCount})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'cancelled' ? 'bg-white text-rose-600 shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ملغي ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {permissionError ? (
        <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-200">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-800 font-semibold text-sm">{permissionError}</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-3">جاري تحميل الطلبات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">لا توجد طلبات في هذا القسم</h3>
          <p className="text-sm text-gray-500 mt-1">ستظهر أي طلبات شراء جديدة يقوم بها الزبناء هنا مباشرة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg">
                      #{order.id.slice(0, 7)}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatOrderDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge / selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">الحالة:</span>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border outline-none cursor-pointer ${
                          order.status === 'delivered' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : order.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">قيد المعالجة</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setOrderToDelete(order.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">معلومات الزبون</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700" dir="ltr">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <a 
                          href={`tel:${order.customerPhone}`} 
                          className="hover:text-blue-600 hover:underline font-mono"
                        >
                          {order.customerPhone}
                        </a>
                        <a
                          href={getWhatsAppLink(order.customerPhone, order.customerName, order.totalAmount)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-auto inline-flex items-center gap-1 text-[11px] bg-green-50 text-green-700 hover:bg-green-100 px-2 py-0.5 rounded-md font-semibold transition-colors"
                          title="مراسلة عبر واتساب"
                        >
                          <MessageCircle className="w-3 h-3 text-green-600" />
                          <span>واتساب</span>
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600 text-xs pt-1">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{order.customerCity}{order.customerAddress ? ` - ${order.customerAddress}` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Subtotals */}
                  <div className="lg:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">المنتجات المطلوبة</h4>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3 text-sm hover:bg-gray-50/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={normalizeProductImageUrl(item.image)}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate text-sm">{item.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                {item.selectedSize && (
                                  <span className="bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded">
                                    المقاس: {item.selectedSize}
                                  </span>
                                )}
                                <span>الكمية: {item.quantity}</span>
                                <span>× {item.price} درهم</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900 text-sm shrink-0">
                            {item.price * item.quantity} درهم
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 px-2">
                      <span className="text-sm font-semibold text-gray-600">المجموع الكلي للطلب:</span>
                      <span className="text-xl font-black text-blue-600">{order.totalAmount} درهم</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">حذف الطلب</h3>
            <p className="text-sm text-gray-500 text-center mb-6">هل أنت متأكد من رغبتك في حذف هذا الطلب من السجل؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium text-sm transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteOrder}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
