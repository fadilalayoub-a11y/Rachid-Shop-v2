import { useState, FormEvent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { language, isRTL } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // إغلاق المودال بزر Escape ومنع تمرير الصفحة الخلفية
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // تصفير الأخطاء والمدخلات عند التبديل
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  if (!isOpen) return null;

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          try {
            await updateProfile(userCred.user, { displayName: name.trim() });
          } catch {
            // ignore
          }
        }
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(
          language === 'ar'
            ? 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول.'
            : language === 'fr'
            ? 'Cet email est déjà utilisé. Veuillez vous connecter.'
            : 'This email is already in use. Please sign in.'
        );
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError(
          language === 'ar'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            : language === 'fr'
            ? 'Email ou mot de passe incorrect.'
            : 'Invalid email or password.'
        );
      } else if (err.code === 'auth/weak-password') {
        setError(
          language === 'ar'
            ? 'كلمة المرور قصيرة (يجب ألا تقل عن 6 أحرف).'
            : language === 'fr'
            ? 'Le mot de passe doit comporter au moins 6 caractères.'
            : 'Password must be at least 6 characters.'
        );
      } else if (err.code === 'auth/invalid-email') {
        setError(
          language === 'ar'
            ? 'يرجى إدخال بريد إلكتروني صحيح.'
            : language === 'fr'
            ? 'Veuillez saisir une adresse email valide.'
            : 'Please enter a valid email address.'
        );
      } else {
        setError(
          language === 'ar'
            ? 'حدث خطأ أثناء المصادقة. يرجى المحاولة مجدداً.'
            : language === 'fr'
            ? 'Une erreur est survenue. Veuillez réessayer.'
            : 'An error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(
          language === 'ar'
            ? 'حدث خطأ أثناء تسجيل الدخول بجوجل.'
            : language === 'fr'
            ? 'Erreur lors de la connexion avec Google.'
            : 'Error signing in with Google.'
        );
      }
    }
  };

  const texts = {
    loginTitle: language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Connexion' : 'Sign In',
    registerTitle: language === 'ar' ? 'إنشاء حساب جديد' : language === 'fr' ? 'Créer un compte' : 'Create Account',
    subtitle:
      language === 'ar'
        ? 'أهلاً بك في متجر رشيد'
        : language === 'fr'
        ? 'Bienvenue sur RACHID SHOP'
        : 'Welcome to RACHID SHOP',
    nameLabel: language === 'ar' ? 'الاسم الكامل' : language === 'fr' ? 'Nom complet' : 'Full Name',
    namePlaceholder: language === 'ar' ? 'أدخل اسمك الكريم' : language === 'fr' ? 'Votre nom' : 'Your name',
    emailLabel: language === 'ar' ? 'البريد الإلكتروني' : language === 'fr' ? 'Adresse email' : 'Email Address',
    passwordLabel: language === 'ar' ? 'كلمة المرور' : language === 'fr' ? 'Mot de passe' : 'Password',
    loginBtn: language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Se connecter' : 'Sign In',
    registerBtn: language === 'ar' ? 'إنشاء الحساب' : language === 'fr' ? "S'inscrire" : 'Create Account',
    processing: language === 'ar' ? 'جاري المعالجة...' : language === 'fr' ? 'Traitement...' : 'Processing...',
    or: language === 'ar' ? 'أو' : language === 'fr' ? 'ou' : 'or',
    googleBtn:
      language === 'ar'
        ? 'المتابعة بحساب Google'
        : language === 'fr'
        ? 'Continuer avec Google'
        : 'Continue with Google',
    noAccount: language === 'ar' ? 'ليس لديك حساب؟' : language === 'fr' ? "Pas encore de compte ?" : "Don't have an account?",
    hasAccount: language === 'ar' ? 'لديك حساب بالفعل؟' : language === 'fr' ? 'Déjà un compte ?' : 'Already have an account?',
    switchToRegister: language === 'ar' ? 'إنشاء حساب جديد' : language === 'fr' ? "Créer un compte" : 'Sign up',
    switchToLogin: language === 'ar' ? 'تسجيل الدخول' : language === 'fr' ? 'Se connecter' : 'Sign in',
    closeAria: language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Close',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-stone-200/70"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div>
            <h2 className="text-xl font-black text-stone-900 leading-tight">
              {isLogin ? texts.loginTitle : texts.registerTitle}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">{texts.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-200/70 text-stone-400 hover:text-stone-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label={texts.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with smooth scroll on smaller screens */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {texts.nameLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 sm:h-12 px-4 ps-11 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-hidden transition-all text-sm text-stone-900 bg-stone-50/50 focus:bg-white"
                    placeholder={texts.namePlaceholder}
                  />
                  <UserIcon className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {texts.emailLabel}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 sm:h-12 px-4 ps-11 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-hidden transition-all text-sm text-stone-900 bg-stone-50/50 focus:bg-white"
                  placeholder="name@example.com"
                  dir="ltr"
                />
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {texts.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 sm:h-12 px-4 ps-11 pe-11 border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-hidden transition-all text-sm text-stone-900 bg-stone-50/50 focus:bg-white"
                  placeholder="••••••••"
                  dir="ltr"
                  minLength={6}
                />
                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer focus:outline-hidden"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 bg-stone-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 text-sm mt-1"
            >
              {loading ? texts.processing : isLogin ? texts.loginBtn : texts.registerBtn}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center justify-center gap-3">
            <div className="h-px bg-stone-200 flex-1" />
            <span className="text-xs text-stone-400 font-semibold">{texts.or}</span>
            <div className="h-px bg-stone-200 flex-1" />
          </div>

          {/* Google Sign-in */}
          <button
            onClick={handleGoogleAuth}
            type="button"
            className="w-full h-11 sm:h-12 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 font-bold rounded-xl hover:bg-stone-50 transition-all flex items-center justify-center gap-3 text-xs sm:text-sm cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{texts.googleBtn}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50/80 text-center border-t border-stone-100 shrink-0">
          <p className="text-xs text-stone-600">
            {isLogin ? texts.noAccount : texts.hasAccount}{' '}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-stone-900 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? texts.switchToRegister : texts.switchToLogin}
            </button>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
