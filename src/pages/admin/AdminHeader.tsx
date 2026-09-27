import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export function AdminHeader({ userEmail, onLogout }: AdminHeaderProps) {
  return (
    <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">مرحباً بك، {userEmail}</p>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
        >
          زيارة المتجر
        </a>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-rose-600 rounded-xl shadow-sm border border-gray-200 hover:bg-rose-50 transition-colors text-sm font-bold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج</span>
        </button>
      </div>
    </header>
  );
}
