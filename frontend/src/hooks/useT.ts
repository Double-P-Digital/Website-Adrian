'use client';

import { useLanguage } from '@/context/LanguageContext';

export const useT = () => {
    const { translations } = useLanguage();
    return translations;
};
