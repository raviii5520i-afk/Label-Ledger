'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE } from './config';
import { en } from './translations/en';
import { hi } from './translations/hi';
import { gu } from './translations/gu';
import { te } from './translations/te';

// Type for the translations based on the structure of the English file
export type TranslationDictionary = typeof en;

const translations: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
  gu,
  te,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('labelguard-lang');
    if (stored && ['en', 'hi', 'gu', 'te'].includes(stored)) {
      setLanguageState(stored as LanguageCode);
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('labelguard-lang', lang);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let dict: any = translations[language];
    let fallbackDict: any = translations[DEFAULT_LANGUAGE];

    let val = dict;
    let fallbackVal = fallbackDict;

    for (const k of keys) {
      if (val) val = val[k];
      if (fallbackVal) fallbackVal = fallbackVal[k];
    }

    if (val !== undefined && val !== null) {
      return val as string;
    }
    
    if (fallbackVal !== undefined && fallbackVal !== null) {
      console.warn(`[i18n] Missing translation for key: ${key} in ${language}. Falling back to en.`);
      return fallbackVal as string;
    }

    console.warn(`[i18n] Missing translation for key: ${key} in both ${language} and en.`);
    return key; // return key as last resort
  }, [language]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
