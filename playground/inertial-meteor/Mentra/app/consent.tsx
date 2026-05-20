import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, ScrollView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, Database, Eye, Trash2, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { I18n, Lang, LANG_LABELS } from '@/services/i18n';

// ─── Consent Screen (GDPR / KVKK / PDPL Compliant) ───────────────────────────

const LANG_FLAGS: Record<Lang, string> = {
    en: '🇺🇸', tr: '🇹🇷', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', hi: '🇮🇳', zh: '🇨🇳',
};

const LANG_OPTIONS = I18n.getSupportedLangs().map(code => ({
    code,
    label: LANG_LABELS[code],
    flag: LANG_FLAGS[code],
}));

const DATA_POINT_DEFS = [
    { icon: Database, color: '#6366F1', title_en: 'Session scores & streaks',        title_tr: 'Oturum skorları ve seriler',    title_ar: 'نتائج الجلسات والمتابعة' },
    { icon: Eye,      color: '#10B981', title_en: 'Journal entries (stored locally)', title_tr: 'Günlük girişleri (yerel depolama)', title_ar: 'مدخلات اليومية (تخزين محلي)' },
    { icon: ShieldCheck, color: '#F59E0B', title_en: 'Cognitive radar scores',        title_tr: 'Bilişsel radar skorları',       title_ar: 'درجات الرادار المعرفي' },
    { icon: Trash2,   color: null /* dynamic — set inside component */, title_en: 'Deletable anytime in Settings', title_tr: "Ayarlar'dan her zaman silinebilir", title_ar: 'حذف في أي وقت من الإعدادات' },
];

export default function ConsentScreen() {
    const insets = useSafeAreaInsets();
    const C = useMentraTheme();
    const [selectedLang, setSelectedLang] = useState<Lang>(I18n.getLanguage() as Lang);

    // DATA_POINTS defined inside component so C.brandPrimary is available
    const DATA_POINTS = DATA_POINT_DEFS.map((d, i) => ({
        ...d,
        color: d.color ?? C.brandPrimary,
    }));

    const getTitle = (item: typeof DATA_POINTS[0]) => {
        if (selectedLang === 'tr') return item.title_tr;
        if (selectedLang === 'ar') return item.title_ar;
        return item.title_en;
    };

    const handleLangSelect = async (lang: Lang) => {
        setSelectedLang(lang);
        await I18n.setLanguage(lang);
    };

    const handleAccept = async () => {
        await AsyncStorage.setItem('mentra_consent', 'accepted');
        router.replace('/(tabs)' as any);
    };

    const handleDecline = async () => {
        await AsyncStorage.setItem('mentra_consent', 'declined');
        router.replace('/(tabs)' as any);
    };

    const isArabic = selectedLang === 'ar';
    const rtlStyle = isArabic ? { writingDirection: 'rtl' as const } : {};

    // Use I18n.t() — setLanguage() above has already updated the active language
    const texts = {
        title: I18n.t('gdprTitle'),
        body: I18n.t('gdprBody'),
        weCollect: I18n.t('gdprDataStored'),
        accept: I18n.t('gdprAccept'),
        decline: I18n.t('gdprDecline'),
        legal: `${I18n.t('privacyShort')} · ${I18n.t('termsShort')}`,
        chooseLang: I18n.t('chooseLanguage'),
    };

    const styles = makeStyles(C);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style={C.statusBar} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* ── Language Picker ── */}
                <Animated.View entering={FadeInUp.delay(0).springify()} style={styles.langPicker}>
                    <Globe size={16} color={C.textDim} />
                    <Text style={[styles.langPickerLabel, { color: C.textDim }]}>{texts.chooseLang}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langOptions} contentContainerStyle={{ gap: 8 }}>
                        {LANG_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.code}
                                onPress={() => handleLangSelect(opt.code)}
                                style={[
                                    styles.langBtn,
                                    selectedLang === opt.code && { borderColor: C.brandPrimary, backgroundColor: C.brandPrimary + '15' },
                                ]}
                            >
                                <Text style={styles.langFlag}>{opt.flag}</Text>
                                <Text style={[
                                    styles.langLabel,
                                    { color: C.textDim },
                                    selectedLang === opt.code && { color: C.brandPrimary }
                                ]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* ── Hero ── */}
                <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <ShieldCheck size={40} color={C.brandPrimary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: C.text }, rtlStyle]}>{texts.title}</Text>
                    <Text style={[styles.heroBody, { color: C.textDim }, rtlStyle]}>{texts.body}</Text>
                </Animated.View>

                {/* ── Data Points ── */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.dataCard}>
                    <Text style={[styles.sectionLabel, { color: C.textDim }, rtlStyle]}>{texts.weCollect}</Text>
                    {DATA_POINTS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Animated.View
                                key={i}
                                entering={FadeInDown.delay(250 + i * 60).springify()}
                                style={[styles.dataRow, isArabic && { flexDirection: 'row-reverse' }]}
                            >
                                <View style={[styles.dataIcon, { backgroundColor: item.color + '20' }]}>
                                    <Icon size={18} color={item.color} />
                                </View>
                                <Text style={[styles.dataText, { color: C.text }, rtlStyle]}>{getTitle(item)}</Text>
                            </Animated.View>
                        );
                    })}
                </Animated.View>

                {/* ── CTAs ── */}
                <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.ctaBlock}>
                    <Pressable onPress={handleAccept} style={styles.acceptBtn}>
                        <Text style={styles.acceptText}>{texts.accept}</Text>
                    </Pressable>
                    <Pressable onPress={handleDecline} style={styles.declineBtn}>
                        <Text style={[styles.declineText, { color: C.textDim }]}>{texts.decline}</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('/legal/privacy' as any)}>
                        <Text style={[styles.legalLink, { color: C.muted }]}>{texts.legal}</Text>
                    </Pressable>
                </Animated.View>

            </ScrollView>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        scroll: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 16 },

        langPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
        langPickerLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
        langOptions: { flexShrink: 1 },
        langBtn: {
            flexDirection: 'row', alignItems: 'center', gap: 4,
            paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
            borderWidth: 1, borderColor: C.border, backgroundColor: C.surface,
        },
        langFlag: { fontSize: 16 },
        langLabel: { fontSize: 12, fontWeight: '600' },

        hero: { alignItems: 'center', marginBottom: 32 },
        heroIcon: {
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: C.brandPrimary + '15',
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        },
        heroTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
        heroBody: { fontSize: 15, textAlign: 'center', lineHeight: 23 },

        dataCard: {
            backgroundColor: C.surface, borderRadius: 20, padding: 20,
            borderWidth: 1, borderColor: C.border, marginBottom: 32,
        },
        sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
        dataRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
        dataIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
        dataText: { fontSize: 14, fontWeight: '500', flex: 1 },

        ctaBlock: { gap: 12 },
        acceptBtn: {
            backgroundColor: C.brandPrimary, borderRadius: 16,
            paddingVertical: 18, alignItems: 'center',
            shadowColor: C.brandPrimary, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25, shadowRadius: 16,
        },
        acceptText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
        declineBtn: {
            borderRadius: 16, paddingVertical: 14, alignItems: 'center',
            backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
        },
        declineText: { fontSize: 14, fontWeight: '600' },
        legalLink: { fontSize: 12, textAlign: 'center', textDecorationLine: 'underline', marginTop: 4 },
    });
}
