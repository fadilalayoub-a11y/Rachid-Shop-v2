interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" dir="rtl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
        <p className="text-gray-500 mb-6 text-sm">
          هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه نهائياً من المتجر والمخزون.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm cursor-pointer shadow-sm"
          >
            تأكيد الحذف
          </button>
        </div>
      </div>
    </div>
  );
}
