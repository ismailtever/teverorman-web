import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Storage } from '@/services/storage';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ShieldCheck, Database, Eye, Trash2, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/Colors';
import { I18n, Lang } from '@/services/i18n';

// ─── Consent Screen (GDPR / KVKK / PDPL Compliant) ───────────────────────────
// Shown once on first launch. Complies with:
//  • EU: GDPR (Art. 13 — transparency at point of data collection)
//  • TR: KVKK (Kişisel Verilerin Korunması Kanunu)
//  • SA/MENA: PDPL (Personal Data Protection Law)

const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', label: 'العربية', flag: '🌍' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const DATA_POINTS = [
    {
        icon: Database,
        color: '#6366F1',
        title_en: 'Session scores & streaks',
        title_tr: 'Oturum skorları ve seriler',
        title_ar: 'نتائج الجلسات والمتابعة',
        title_hi: 'सत्र स्कोर और स्ट्रीक',
        title_fr: 'Scores et séries de sessions',
        title_de: 'Sitzungsergebnisse & Serien',
    },
    {
        icon: Eye,
        color: '#10B981',
        title_en: 'Journal entries (stored locally)',
        title_tr: 'Günlük girişleri (yerel depolama)',
        title_ar: 'مدخلات اليومية (تخزين محلي)',
        title_hi: 'डायरी प्रविष्टियां (स्थानीय संग्रहण)',
        title_fr: 'Entrées de journal (stockage local)',
        title_de: 'Tagebucheinträge (lokal gespeichert)',
    },
    {
        icon: ShieldCheck,
        color: '#F59E0B',
        title_en: 'Cognitive radar scores',
        title_tr: 'Bilişsel radar skorları',
        title_ar: 'درجات الرادار المعرفي',
        title_hi: 'संज्ञानात्मक रडार स्कोर',
        title_fr: 'Scores du radar cognitif',
        title_de: 'Kognitive Radar-Punkte',
    },
    {
        icon: Trash2,
        color: Colors.mentra.brandPrimary,
        title_en: 'Deletable anytime in Settings',
        title_tr: 'Ayarlar\'dan her zaman silinebilir',
        title_ar: 'حذف في أي وقت من الإعدادات',
        title_hi: 'सेटिंग्स में कभी भी हटाएं',
        title_fr: 'Supprimable à tout moment dans Paramètres',
        title_de: 'Jederzeit in Einstellungen löschbar',
    },
];

export default function ConsentScreen() {
    const insets = useSafeAreaInsets();
    const [selectedLang, setSelectedLang] = useState<Lang>(I18n.getLanguage() as Lang);

    const getTitle = (item: any) => {
        if (selectedLang === 'tr') return item.title_tr;
        if (selectedLang === 'ar') return item.title_ar;
        if (selectedLang === 'hi') return item.title_hi;
        if (selectedLang === 'fr') return item.title_fr;
        if (selectedLang === 'de') return item.title_de;
        return item.title_en;
    };

    const handleLangSelect = async (lang: Lang) => {
        setSelectedLang(lang);
        await I18n.setLanguage(lang);
    };

    const handleAccept = async () => {
        await AsyncStorage.setItem('mentra_consent', 'accepted');
        const profile = await Storage.getUserProfile();
        if (!profile?.isOnboardingCompleted) {
            router.replace('/onboarding' as any);
        } else {
            router.replace('/(tabs)' as any);
        }
    };

    const handleDecline = async () => {
        await AsyncStorage.setItem('mentra_consent', 'declined');
        const profile = await Storage.getUserProfile();
        if (!profile?.isOnboardingCompleted) {
            router.replace('/onboarding' as any);
        } else {
            router.replace('/(tabs)' as any);
        }
    };

    const isArabic = selectedLang === 'ar';
    const rtlStyle = isArabic ? { writingDirection: 'rtl' as const } : {};

    const texts = {
        title: isArabic ? 'بياناتك، خصوصيتك' : selectedLang === 'tr' ? 'Verileriniz, Gizliliğiniz' : selectedLang === 'hi' ? 'आपका डेटा, आपकी गोपनीयता' : selectedLang === 'fr' ? 'Vos données, votre vie privée' : selectedLang === 'de' ? 'Ihre Daten, Ihre Privatsphäre' : 'Your Data, Your Privacy',
        body: isArabic
            ? 'نستخدم بياناتك المحلية فقط لتحسين تجربتك. لا نبيع أي شيء لأطراف ثالثة.'
            : selectedLang === 'tr'
                ? 'Deneyiminizi iyileştirmek için yalnızca yerel verilerinizi kullanıyoruz. Üçüncü taraflara hiçbir şey satmıyoruz.'
                : 'We only use your local data to improve your experience. We never sell anything to third parties.',
        weCollect: isArabic ? 'ما الذي نجمعه' : selectedLang === 'tr' ? 'Ne topluyoruz' : 'What we collect',
        accept: isArabic ? 'قبول والمتابعة' : selectedLang === 'tr' ? 'Kabul Et ve Devam Et' : 'Accept & Continue',
        decline: isArabic ? 'استمر بدون تتبع' : selectedLang === 'tr' ? 'Takip Olmadan Devam Et' : 'Continue Without Tracking',
        legal: isArabic ? 'سياسة الخصوصية · الشروط' : selectedLang === 'tr' ? 'Gizlilik Politikası · Şartlar' : 'Privacy Policy · Terms',
        chooseLang: isArabic ? 'اختر لغتك' : selectedLang === 'tr' ? 'Dil Seçin' : 'Choose Language',
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Language Picker ── */}
                <Animated.View entering={FadeInUp.delay(0).springify()} style={styles.langPicker}>
                    <Globe size={16} color={Colors.mentra.textDim} />
                    <Text style={styles.langPickerLabel}>{texts.chooseLang}</Text>
                    <View style={styles.langOptions}>
                        {LANG_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.code}
                                onPress={() => handleLangSelect(opt.code)}
                                style={[
                                    styles.langBtn,
                                    selectedLang === opt.code && styles.langBtnActive,
                                ]}
                            >
                                <Text style={styles.langFlag}>{opt.flag}</Text>
                                <Text style={[
                                    styles.langLabel,
                                    selectedLang === opt.code && styles.langLabelActive
                                ]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* ── Hero ── */}
                <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <ShieldCheck size={40} color={Colors.mentra.brandPrimary} />
                    </View>
                    <Text style={[styles.heroTitle, rtlStyle]}>{texts.title}</Text>
                    <Text style={[styles.heroBody, rtlStyle]}>{texts.body}</Text>
                </Animated.View>

                {/* ── Data Points ── */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.dataCard}>
                    <Text style={[styles.sectionLabel, rtlStyle]}>{texts.weCollect}</Text>
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
                                <Text style={[styles.dataText, rtlStyle]}>{getTitle(item)}</Text>
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
                        <Text style={styles.declineText}>{texts.decline}</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('/legal/privacy' as any)}>
                        <Text style={styles.legalLink}>{texts.legal}</Text>
                    </Pressable>
                </Animated.View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.mentra.bg },
    scroll: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 16 },

    // Language Picker
    langPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
    langPickerLabel: { fontSize: 13, fontWeight: '600', color: Colors.mentra.textDim, flex: 1 },
    langOptions: { flexDirection: 'row', gap: 8 },
    langBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: Colors.mentra.border, backgroundColor: Colors.mentra.surface },
    langBtnActive: { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '15' },
    langFlag: { fontSize: 16 },
    langLabel: { fontSize: 12, fontWeight: '600', color: Colors.mentra.textDim },
    langLabelActive: { color: Colors.mentra.brandPrimary },

    // Hero
    hero: { alignItems: 'center', marginBottom: 32 },
    heroIcon: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: Colors.mentra.brandPrimary + '15',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: Colors.mentra.text, textAlign: 'center', marginBottom: 12 },
    heroBody: { fontSize: 15, color: Colors.mentra.textDim, textAlign: 'center', lineHeight: 23 },

    // Data Card
    dataCard: { backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.mentra.border, marginBottom: 32 },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.mentra.textDim, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 },
    dataRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
    dataIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    dataText: { fontSize: 14, color: Colors.mentra.text, fontWeight: '500', flex: 1 },

    // CTAs
    ctaBlock: { gap: 12 },
    acceptBtn: {
        backgroundColor: Colors.mentra.brandPrimary, borderRadius: 16,
        paddingVertical: 18, alignItems: 'center',
        shadowColor: Colors.mentra.brandPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25, shadowRadius: 16,
    },
    acceptText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    declineBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.mentra.surface, borderWidth: 1, borderColor: Colors.mentra.border },
    declineText: { fontSize: 14, color: Colors.mentra.textDim, fontWeight: '600' },
    legalLink: { fontSize: 12, color: Colors.mentra.muted, textAlign: 'center', textDecorationLine: 'underline', marginTop: 4 },
});
