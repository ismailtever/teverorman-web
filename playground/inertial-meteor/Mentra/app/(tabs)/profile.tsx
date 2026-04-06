import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    Alert, Share
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ChevronLeft, User, Shield, Database, LogOut,
    ChevronRight, Zap, CreditCard, Bell, HelpCircle, Activity, Globe,
    BookOpen, AlertTriangle
} from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { Storage, UserProfile } from '@/services/storage';
import { getPremiumStatus, restoreFlow } from '@/services/purchases';
import { I18n, useI18n, LANG_META, Lang } from '@/services/i18n';
import { RamadanService } from '@/services/ramadan';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { lang, t } = useI18n();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [ramadanMode, setRamadanMode] = useState(false);
    const [currentLang, setCurrentLang] = useState<Lang>(lang);

    useFocusEffect(
        useCallback(() => {
            Storage.getUserProfile().then(setUser);
            getPremiumStatus().then(setIsPro);
            RamadanService.isRamadanModeActive().then(setRamadanMode);
        }, [])
    );

    // ── JSON Data Export ──────────────────────────────────────────────────────

    const handleDataExport = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(
                t('exportDataTitle' as any),
                t('exportDataMsg' as any),
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('export' as any), style: "default", onPress: performExport }
                ]
            );
        } catch (e) {
            console.error(e);
        }
    };

    const performExport = async () => {
        setIsExporting(true);
        try {
            // Aggregate all local storage data
            const keys = await AsyncStorage.getAllKeys();
            const relevantKeys = keys.filter(k => k.startsWith('mentra_'));
            const multi = await AsyncStorage.multiGet(relevantKeys);

            const exportData: Record<string, any> = {};
            multi.forEach(([key, value]) => {
                try {
                    exportData[key] = value ? JSON.parse(value) : null;
                } catch {
                    exportData[key] = value;
                }
            });

            // Share Sheet
            if (await Share.share({ message: JSON.stringify(exportData, null, 2), title: t('mentraExport' as any) })) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) {
            Alert.alert(t('exportFailed' as any), t('exportErrorMsg' as any));
        } finally {
            setIsExporting(false);
        }
    };

    const handleRestore = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const success = await restoreFlow("settings_tab");
            if (success) {
                setIsPro(true);
                Alert.alert(t('alertRestored'), t('alertRestoredMsg'));
            } else {
                Alert.alert(t('alertNoPurchases'), t('alertNoPurchasesMsg'));
            }
        } catch (e) {
            Alert.alert(t('error'), t('restoreFailed'));
        }
    };

    const handleLangChange = async (newLang: Lang) => {
        Haptics.selectionAsync?.();
        await I18n.setLanguage(newLang);
        setCurrentLang(newLang);
    };

    const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
        { code: 'en', label: 'EN', flag: '🇬🇧' },
        { code: 'tr', label: 'TR', flag: '🇹🇷' },
        { code: 'zh', label: 'ZH', flag: '🇨🇳' },
        { code: 'ar', label: 'AR', flag: '🌍' },
        { code: 'fr', label: 'FR', flag: '🇫🇷' },
        { code: 'de', label: 'DE', flag: '🇩🇪' },
        { code: 'hi', label: 'HI', flag: '🇮🇳' },
        { code: 'es', label: 'ES', flag: '🇪🇸' },
        { code: 'nl', label: 'NL', flag: '🇳🇱' },
        { code: 'it', label: 'IT', flag: '🇮🇹' },
        { code: 'ja', label: 'JA', flag: '🇯🇵' },
        { code: 'ko', label: 'KO', flag: '🇰🇷' },
        { code: 'fi', label: 'FI', flag: '🇫🇮' },
        { code: 'fa', label: 'FA', flag: '🇮🇷' },
    ];

    const RowItem = ({ icon, label, subLabel, onPress, danger }: any) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.rowItem, { backgroundColor: pressed ? Colors.mentra.surface2 : Colors.mentra.surface }]}
        >
            <View style={[styles.rowIcon, { backgroundColor: danger ? Colors.mentra.danger + '15' : Colors.mentra.surface2 }]}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, danger && { color: Colors.mentra.danger }]}>{label}</Text>
                {subLabel && <Text style={styles.rowSubLabel}>{subLabel}</Text>}
            </View>
            <ChevronRight size={20} color={Colors.mentra.muted} />
        </Pressable>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
                >
                    <ChevronLeft size={28} color={Colors.mentra.text} />
                </Pressable>
                <Text style={styles.headerTitle}>{t('profSettings')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile Card */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.name || t('user' as any)}</Text>
                            <Text style={styles.profileEmail}>{isPro ? t('proActive') : t('freeTier' as any)}</Text>
                        </View>
                        {!isPro && (
                            <Pressable style={styles.proBtn} onPress={() => router.push('/paywall/onboarding' as any)}>
                                <Zap size={14} color={Colors.mentra.brandPrimary} />
                                <Text style={styles.proBtnText}>{t('profUpgrade')}</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Account & Billing */}
                <Text style={styles.sectionTitle}>{t('profAccount')}</Text>
                <View style={styles.group}>
                    <RowItem
                        icon={<User size={20} color={Colors.mentra.textDim} />}
                        label={t('personalInfo' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<CreditCard size={20} color={Colors.mentra.textDim} />}
                        label={t('subscriptionLabel')}
                        subLabel={isPro ? t('proActiveYearly') : t('freeTier')}
                        onPress={() => isPro ? null : router.push('/paywall/onboarding' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Activity size={20} color={Colors.mentra.textDim} />}
                        label={t('paywallRestore')}
                        onPress={handleRestore}
                    />
                </View>

                {/* Data & Privacy */}
                <Text style={styles.sectionTitle}>{t('profPrivacy')}</Text>
                <View style={styles.group}>
                    <RowItem
                        icon={<Database size={20} color={Colors.mentra.textDim} />}
                        label={t('exportDataBtn' as any)}
                        subLabel={isExporting ? t('processing') : t('exportDataDesc' as any)}
                        onPress={handleDataExport}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Shield size={20} color={Colors.mentra.textDim} />}
                        label={t('legalPrivacy')}
                        onPress={() => router.push('/legal/privacy' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<BookOpen size={20} color={Colors.mentra.textDim} />}
                        label={t('legalTerms')}
                        onPress={() => router.push('/legal/terms' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<AlertTriangle size={20} color={Colors.mentra.textDim} />}
                        label={t('legalDisclaimer')}
                        onPress={() => router.push('/legal/disclaimer' as any)}
                    />
                </View>

                {/* Preferences */}
                <Text style={styles.sectionTitle}>{t('profAppPref')}</Text>
                <View style={styles.group}>
                    {/* Language Switcher */}
                    <View style={styles.rowItemScrollable}>
                        <View style={styles.langHeader}>
                            <View style={[styles.rowIcon, { backgroundColor: Colors.mentra.surface2 }]}>
                                <Globe size={20} color={Colors.mentra.textDim} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rowLabel}>{t('profLanguage')}</Text>
                                <Text style={styles.rowSubLabel}>{t('profInterfaceLang')}</Text>
                            </View>
                        </View>
                        <View style={styles.langSwitcher}>
                            {LANG_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.code}
                                    onPress={() => handleLangChange(opt.code)}
                                    style={[styles.langBtn, currentLang === opt.code && styles.langBtnActive]}
                                >
                                    <Text style={styles.langFlag}>{opt.flag}</Text>
                                    <Text style={[styles.langBtnText, currentLang === opt.code && styles.langBtnTextActive]}>{opt.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Text style={{ fontSize: 18 }}>🌙</Text>}
                        label={t('ramadanMode')}
                        subLabel={ramadanMode ? t('ramadanActive') : t('ramadanAutoDetect')}
                        onPress={async () => {
                            const next = !ramadanMode;
                            await RamadanService.setRamadanMode(next);
                            setRamadanMode(next);
                        }}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Bell size={20} color={Colors.mentra.textDim} />}
                        label={t('pushNotifications')}
                        subLabel={t('pushNotificationsDesc')}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<HelpCircle size={20} color={Colors.mentra.textDim} />}
                        label={t('supportTitle')}
                        subLabel="support@tevertechnology.com"
                        onPress={() => {
                            const { Linking } = require('react-native');
                            Linking.openURL('mailto:support@tevertechnology.com');
                        }}
                    />
                </View>

                {/* Actions */}
                <View style={[styles.group, { marginTop: 24, marginBottom: 120 }]}>
                    <RowItem
                        icon={<LogOut size={20} color={Colors.mentra.danger} />}
                        label={t('signOut' as any)}
                        danger
                    />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.mentra.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
    scroll: { paddingHorizontal: 20 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.mentra.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },

    group: { backgroundColor: Colors.mentra.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.mentra.border, overflow: 'hidden', marginBottom: 24 },
    divider: { height: 1, backgroundColor: Colors.mentra.border, marginLeft: 56 },

    // Profile Card
    profileCard: {
        backgroundColor: Colors.mentra.surface, borderRadius: 20, padding: 20,
        flexDirection: 'row', alignItems: 'center', gap: 16,
        borderWidth: 1, borderColor: Colors.mentra.border,
        shadowColor: Colors.mentra.brandPrimary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.mentra.brandPrimary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
    profileInfo: { flex: 1, gap: 2 },
    profileName: { fontSize: 18, fontWeight: '700', color: Colors.mentra.text },
    profileEmail: { fontSize: 13, color: Colors.mentra.textDim },
    proBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.mentra.brandSecondary + '20', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    proBtnText: { fontSize: 12, fontWeight: '700', color: Colors.mentra.brandPrimary },

    // Row Item
    rowItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    rowItemScrollable: { padding: 16, gap: 12 },
    langHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { fontSize: 16, fontWeight: '600', color: Colors.mentra.text },
    rowSubLabel: { fontSize: 13, color: Colors.mentra.textDim, marginTop: 2 },

    // Language Switcher
    langSwitcher: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    langBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.mentra.border, backgroundColor: Colors.mentra.bg, minWidth: 60, justifyContent: 'center' },
    langBtnActive: { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '15' },
    langFlag: { fontSize: 16 },
    langBtnText: { fontSize: 12, fontWeight: '700', color: Colors.mentra.textDim },
    langBtnTextActive: { color: Colors.mentra.brandPrimary },
});
