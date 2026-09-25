import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

export interface LanguageSwitcherProps {
  variant?: 'footer' | 'inline';
  className?: string;
}

interface LanguageItem {
  code: Language;
  name: string; // International English Name
  nativeName: string; // Native Script
  displayLabel: string; // E.g. English (EN)
}

const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', displayLabel: 'English (EN)' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', displayLabel: 'العربية (AR)' },
  { code: 'fr', name: 'French', nativeName: 'Français', displayLabel: 'Français (FR)' },
];

export function LanguageSwitcher({ variant = 'footer', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inline segmented switch
  if (variant === 'inline') {
    return (
      <div 
        className={`inline-flex items-center p-1 rounded-full bg-stone-100/90 border border-stone-200/80 ${className}`}
        dir="ltr"
      >
        <div className="flex items-center gap-1.5 pl-2 pr-1 text-stone-400">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-0.5">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/50'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Luxury Popover / Dropdown (Default for Global Footers like Apple, Zara, Nike)
  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-100/80 transition-all duration-200 cursor-pointer active:scale-[0.98]"
        aria-label="Select website language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
        <span className="font-medium text-stone-700 group-hover:text-stone-950">{currentLang.displayLabel}</span>
        <ChevronDown 
          className={`w-3 h-3 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute bottom-full mb-2 ${
            isRTL ? 'right-0' : 'left-0'
          } w-48 bg-white rounded-xl shadow-xl border border-stone-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden`}
          role="listbox"
        >
          <div className="px-3.5 py-1.5 text-[10px] font-bold text-stone-400 tracking-wider uppercase border-b border-stone-100">
            {language === 'ar' ? 'اللغة والمنطقة' : language === 'fr' ? 'Langue et région' : 'Language & Region'}
          </div>
          <div className="p-1 space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-start transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-stone-50 font-medium'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex flex-col">
                    <span className="text-xs">{lang.displayLabel}</span>
                    <span className={`text-[10px] ${
                      isSelected ? 'text-stone-300' : 'text-stone-400'
                    }`}>
                      {lang.nativeName}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-stone-50" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
