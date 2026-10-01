'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '@/context/LanguageContext';

export interface LanguageSwitcherProps {
  className?: string;
  dropDirection?: 'down' | 'up';
}

interface LanguageItem {
  code: Language;
  name: string;
  nativeName: string;
  displayLabel: string;
}

const LANGUAGES: LanguageItem[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', displayLabel: 'Français (FR)' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', displayLabel: 'العربية (AR)' },
  { code: 'en', name: 'English', nativeName: 'English', displayLabel: 'English (EN)' },
];

export function LanguageSwitcher({ className = '', dropDirection = 'down' }: LanguageSwitcherProps) {
  const { language, setLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Calculate coordinates when open
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 180;
      let left = isRTL ? rect.right - menuWidth : rect.left;
      
      // Keep within window boundary
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      const top = dropDirection === 'up'
        ? rect.top - 8
        : rect.bottom + 6;

      setDropdownPos({ top, left, width: menuWidth });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, isRTL, dropDirection]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Luxury black button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-stone-900 border border-stone-800 shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
        aria-label="Select website language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="tracking-wide select-none">{currentLang.displayLabel}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-stone-300 group-hover:text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Render via Portal to eliminate overflow / z-index conflicts */}
      {isOpen && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropDirection === 'up' ? undefined : `${dropdownPos.top}px`,
            bottom: dropDirection === 'up' ? `${window.innerHeight - dropdownPos.top}px` : undefined,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            zIndex: 999999,
          }}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="bg-black text-white rounded-xl shadow-2xl border border-stone-800 py-1.5 animate-in fade-in zoom-in-95 duration-150 select-none"
          role="listbox"
        >
          <div className="p-1 space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-start transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-800 text-white font-bold'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex flex-col">
                    <span className="text-xs">{lang.displayLabel}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {lang.nativeName}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
