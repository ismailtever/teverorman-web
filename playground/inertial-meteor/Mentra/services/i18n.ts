import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';
import { I18nManager } from 'react-native';

export type Lang = 'en' | 'tr' | 'ar' | 'de' | 'fr' | 'hi' | 'zh';

import en from '../locales/en.json';
import tr from '../locales/tr.json';
import ar from '../locales/ar.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';

const translations: Record<Lang, Record<string, string>> = { en, tr, ar, de, fr, hi, zh };

// All supported language codes (for device locale detection)
const SUPPORTED_LANGS: Lang[] = ['tr', 'ar', 'de', 'fr', 'hi', 'zh', 'en'];

// Human-readable language names (for UI picker)
export const LANG_LABELS: Record<Lang, string> = {
    en: 'English',
    tr: 'Türkçe',
    ar: 'العربية',
    de: 'Deutsch',
    fr: 'Français',
    hi: 'हिन्दी',
    zh: '中文',
};

let currentLang: Lang = 'en';
const listeners: (() => void)[] = [];

// Re-apply RTL layout direction based on selected language
const applyRTL = (lang: Lang) => {
    const shouldBeRTL = lang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
    }
};

export const I18n = {
    t: (key: string, params?: Record<string, string | number>) => {
        const langDict = translations[currentLang];
        let text = langDict[key] ?? translations['en'][key] ?? key;

        if (params) {
            Object.keys(params).forEach(p => {
                text = text.replace(`%{${p}}`, String(params[p]));
            });
        }
        return text;
    },

    setLanguage: async (lang: Lang) => {
        currentLang = lang;
        applyRTL(lang);
        try {
            await AsyncStorage.setItem('mentra_lang', lang);
            listeners.forEach(cb => cb());
        } catch (e) {
            Logger.error('Failed to set language', e);
        }
    },

    getLanguage: () => currentLang,

    getSupportedLangs: () => SUPPORTED_LANGS,

    isRTL: () => currentLang === 'ar',

    init: async () => {
        try {
            const saved = await AsyncStorage.getItem('mentra_lang');
            if (saved && SUPPORTED_LANGS.includes(saved as Lang)) {
                currentLang = saved as Lang;
            } else {
                // Match device locale to supported language
                const deviceCode = getLocales()[0]?.languageCode ?? 'en';
                const matched = SUPPORTED_LANGS.find(l => l === deviceCode);
                currentLang = matched ?? 'en';
            }
            applyRTL(currentLang);
            listeners.forEach(cb => cb());
        } catch (e) {
            Logger.error('Failed to init I18n', e);
        }
    },

    subscribe: (cb: () => void) => {
        listeners.push(cb);
        return () => {
            const index = listeners.indexOf(cb);
            if (index > -1) listeners.splice(index, 1);
        };
    }
};

