import { useEffect, useState } from 'react';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';
import { I18nManager } from 'react-native';

import en from '../locales/en.json';
import tr from '../locales/tr.json';
import ar from '../locales/ar.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';
import es from '../locales/es.json';
import nl from '../locales/nl.json';
import it from '../locales/it.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import fi from '../locales/fi.json';
import fa from '../locales/fa.json';

export type Lang = 'en' | 'tr' | 'ar' | 'fr' | 'de' | 'hi' | 'zh' | 'es' | 'nl' | 'it' | 'ja' | 'ko' | 'fi' | 'fa';

const translations = { en, tr, ar, fr, de, hi, zh, es, nl, it, ja, ko, fi, fa };

// ─── Language metadata ─────────────────────────────────────────────────────
export const LANG_META: Record<Lang, { label: string; nativeLabel: string; flag: string; rtl: boolean }> = {
    en: { label: 'English',  nativeLabel: 'English',   flag: '🇬🇧', rtl: false },
    tr: { label: 'Turkish',  nativeLabel: 'Türkçe',    flag: '🇹🇷', rtl: false },
    ar: { label: 'Arabic',   nativeLabel: 'العربية',   flag: '🌍',  rtl: true  },
    fr: { label: 'French',   nativeLabel: 'Français',  flag: '🇫🇷', rtl: false },
    de: { label: 'German',   nativeLabel: 'Deutsch',   flag: '🇩🇪', rtl: false },
    hi: { label: 'Hindi',    nativeLabel: 'हिन्दी',     flag: '🇮🇳', rtl: false },
    zh: { label: 'Chinese', nativeLabel: '简体中文',   flag: '🇨🇳', rtl: false },
    es: { label: 'Spanish',  nativeLabel: 'Español',   flag: '🇪🇸', rtl: false },
    nl: { label: 'Dutch',    nativeLabel: 'Nederlands', flag: '🇳🇱', rtl: false },
    it: { label: 'Italian',  nativeLabel: 'Italiano',  flag: '🇮🇹', rtl: false },
    ja: { label: 'Japanese', nativeLabel: '日本語',    flag: '🇯🇵', rtl: false },
    ko: { label: 'Korean',   nativeLabel: '한국어',    flag: '🇰🇷', rtl: false },
    fi: { label: 'Finnish',  nativeLabel: 'Suomi',     flag: '🇫🇮', rtl: false },
    fa: { label: 'Persian',  nativeLabel: 'فارسی',     flag: '🇮🇷', rtl: true  },
};

// ─── Date locale map ────────────────────────────────────────────────────────
export const DATE_LOCALE: Record<Lang, string> = {
    en: 'en-IN',
    tr: 'tr-TR',
    ar: 'ar-SA',
    fr: 'fr-FR',
    de: 'de-DE',
    hi: 'hi-IN',
    zh: 'zh-CN',
    es: 'es-ES',
    nl: 'nl-NL',
    it: 'it-IT',
    ja: 'ja-JP',
    ko: 'ko-KR',
    fi: 'fi-FI',
    fa: 'fa-IR',
};

let currentLang: Lang = 'en';
const listeners: (() => void)[] = [];

const applyRTL = (lang: Lang) => {
    const shouldBeRTL = LANG_META[lang].rtl;
    if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        I18nManager.allowRTL(shouldBeRTL);
    }
};

// ─── Device language → App language ───────────────────────────────────────
const detectLanguage = (deviceCode: string | undefined): Lang => {
    if (!deviceCode) return 'en';
    const code = deviceCode.toLowerCase().split('-')[0];
    
    const supported: Lang[] = ['en', 'tr', 'ar', 'fr', 'de', 'hi', 'zh', 'es', 'nl', 'it', 'ja', 'ko', 'fi', 'fa'];
    if ((supported as string[]).includes(code)) return code as Lang;
    
    if (deviceCode.toLowerCase().startsWith('zh')) return 'zh';
    
    return 'en';
};

export const I18n = {
    t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
        const langDict = (translations[currentLang] || translations['en']) as Record<string, string>;
        let text = langDict[key] ?? (translations['en'] as Record<string, string>)[key] ?? key;
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
    getDateLocale: () => DATE_LOCALE[currentLang],
    isRTL: () => LANG_META[currentLang].rtl,

    init: async () => {
        try {
            const saved = await AsyncStorage.getItem('mentra_lang');
            if (saved && saved in translations) {
                currentLang = saved as Lang;
            } else {
                const locales = getLocales();
                const device = locales[0]?.languageCode;
                currentLang = detectLanguage(device ?? undefined);
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
            const idx = listeners.indexOf(cb);
            if (idx > -1) listeners.splice(idx, 1);
        };
    }
};

/**
 * Hook for components to reactively update when the language changes.
 */
export function useI18n() {
    const [, setTick] = useState(0);
    const [lang, setLang] = useState<Lang>(I18n.getLanguage() as Lang);

    useEffect(() => {
        return I18n.subscribe(() => {
            setLang(I18n.getLanguage() as Lang);
            setTick(n => n + 1);
        });
    }, []);

    return {
        t: I18n.t,
        lang,
        isRTL: LANG_META[lang].rtl,
        getDateLocale: DATE_LOCALE[lang]
    };
}
