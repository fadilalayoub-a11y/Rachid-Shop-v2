import { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface AdminAuthGateProps {
  loading: boolean;
  user: any;
  isAdmin: boolean;
  onLogout: () => void;
  children: ReactNode;
}

export function AdminAuthGate({
  loading,
  user,
  isAdmin,
  onLogout,
  children,
}: AdminAuthGateProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-600">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3 text-center">
            تسجيل الدخول للإدارة
          </h1>
          <p className="text-gray-500 mb-8 text-center leading-relaxed text-sm">
            للولوج إلى لوحة التحكم، يرجى تسجيل الدخول بحساب المدير من خلال المتجر الرئيسي.
          </p>

          <a
            href="/"
            className="w-full flex items-center justify-center bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            الذهاب للمتجر لتسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">عذراً، لا تملك صلاحية</h1>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            هذه الصفحة مخصصة لمديري المتجر فقط. يبدو أن حسابك ({user.email}) لا يملك الصلاحيات اللازمة للوصول للوحة التحكم.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="w-full bg-gray-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              العودة للمتجر
            </a>
            <button
              onClick={onLogout}
              className="w-full bg-white text-gray-700 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 cursor-pointer"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
