'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { SUPPORTED_LANGUAGES, LanguageCode } from './config';
import { cn } from '../lib/utils';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={cn("relative z-50", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-[#1A1D27]/80 hover:bg-[#232635] border border-[#2E3147] transition-colors"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-400 hidden sm:block" />
        <span className="uppercase tracking-widest">{selectedLang.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#13151D] border border-[#2E3147] rounded-lg shadow-xl shadow-black/50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as LanguageCode);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left",
                language === lang.code
                  ? "bg-indigo-600/10 text-indigo-300"
                  : "text-slate-300 hover:bg-[#1A1D27] hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
              {language === lang.code && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
