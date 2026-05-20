import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    Alert, Share, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    User, Shield, Database, LogOut,
    ChevronRight, Zap, CreditCard, Bell, HelpCircle, Activity, Globe, Info,
} from 'lucide-react-native';

import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Storage, UserProfile } from '@/services/storage';
import { getPremiumStatus, restoreFlow } from '@/services/purchases';
import { I18n, Lang } from '@/services/i18n';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const C = useMentraTheme();

    const [user, setUser]               = useState<UserProfile | null>(null);
    const [isPro, setIsPro]             = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [currentLang, setCurrentLang] = useState<Lang>(I18n.getLanguage() as Lang);

    useFocusEffect(
        useCallback(() => {
            Storage.getUserProfile().then(setUser);
            getPremiumStatus().then(setIsPro);
        }, [])
    );

    // ── Data Export ──────────────────────────────────────────────────────────

    const handleDataExport = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Export Your Data',
            'Generate a JSON package of all your journals, scores, and routines?',
            [
                { text: I18n.t('cancel'), style: 'cancel' },
                { text: 'Export', style: 'default', onPress: performExport },
            ]
        );
    };

    const performExport = async () => {
        setIsExporting(true);
        try {
            const keys = await AsyncStorage.getAllKeys();
            const relevantKeys = keys.filter(k => k.startsWith('mentra_'));
            const multi = await AsyncStorage.multiGet(relevantKeys);
            const exportData: Record<string, any> = {};
            multi.forEach(([key, value]) => {
                try { exportData[key] = value ? JSON.parse(value) : null; } catch { exportData[key] = value; }
            });
            await Share.share({ message: JSON.stringify(exportData, null, 2), title: 'Mentra Export' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
            Alert.alert('Export Failed', 'There was an error generating your data package.');
        } finally {
            setIsExporting(false);
        }
    };

    // ── Restore Purchases ────────────────────────────────────────────────────

    const handleRestore = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const success = await restoreFlow('settings_tab');
            if (success) {
                setIsPro(true);
                Alert.alert(I18n.t('alertRestored'), I18n.t('alertRestoredMsg'));
            } else {
                Alert.alert(I18n.t('alertNoPurchases'), I18n.t('alertNoPurchasesMsg'));
            }
        } catch {
            Alert.alert(I18n.t('alertRestoreFailed'), '');
        }
    };

    // ── Language ─────────────────────────────────────────────────────────────

    const handleLangChange = async (lang: Lang) => {
        Haptics.selectionAsync?.();
        await I18n.setLanguage(lang);
        setCurrentLang(lang);
    };

    // ── Sign Out ─────────────────────────────────────────────────────────────

    const handleSignOut = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Sign Out',
            'Are you sure? Your local data will remain on this device.',
            [
                { text: I18n.t('cancel'), style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('mentra_user_profile');
                        router.replace('/onboarding' as any);
                    },
                },
            ]
        );
    };

    // ── Reset All Data ────────────────────────────────────────────────────────

    const handleResetData = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            I18n.t('resetData'),
            I18n.t('resetConfirm'),
            [
                { text: I18n.t('cancel'), style: 'cancel' },
                {
                    text: I18n.t('confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        const keys = await AsyncStorage.getAllKeys();
                        const mentraKeys = keys.filter(k => k.startsWith('mentra_'));
                        await AsyncStorage.multiRemove(mentraKeys);
                        router.replace('/onboarding' as any);
                    },
                },
            ]
        );
    };

    const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
        { code: 'en', label: 'EN', flag: '🇺🇸' },
        { code: 'tr', label: 'TR', flag: '🇹🇷' },
        { code: 'ar', label: 'AR', flag: '🇸🇦' },
    ];

    // ── Row Item component ────────────────────────────────────────────────────

    const RowItem = ({
        icon, label, subLabel, onPress, danger,
    }: { icon: React.ReactNode; label: string; subLabel?: string; onPress?: () => void; danger?: boolean }) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [{
                flexDirection: 'row' as const, alignItems: 'center' as const,
                padding: 16, gap: 16,
                backgroundColor: pressed ? C.surface2 : C.surface,
            }]}
        >
            <View style={[styles.rowIcon, { backgroundColor: danger ? C.danger + '15' : C.surface2 }]}>
                {icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: danger ? C.danger : C.text }]}>{label}</Text>
                {subLabel ? <Text style={[styles.rowSubLabel, { color: C.textDim }]}>{subLabel}</Text> : null}
            </View>
            <ChevronRight size={20} color={C.muted} />
        </Pressable>
    );

    return (
        <View style={[styles.container, { backgroundColor: C.bg, paddingTop: insets.top }]}>
            <StatusBar style={C.statusBar} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: C.text }]}>{I18n.t('settingsTitle')}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Profile Card ── */}
                <View style={{ marginBottom: 32 }}>
                    <View style={[styles.profileCard, {
                        backgroundColor: C.surface, borderColor: C.border, shadowColor: C.brandPrimary,
                    }]}>
                        <View style={[styles.avatar, { backgroundColor: C.brandPrimary }]}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.profileName, { color: C.text }]}>{user?.name || 'User'}</Text>
                            <Text style={[styles.profileEmail, { color: C.textDim }]}>
                                {isPro ? 'Mentra Pro Member' : 'Free Tier'}
                            </Text>
                        </View>
                        {!isPro && (
                            <Pressable
                                style={[styles.proBtn, { backgroundColor: C.brandPrimary + '20' }]}
                                onPress={() => router.push('/paywall/onboarding' as any)}
                            >
                                <Zap size={14} color={C.brandPrimary} />
                                <Text style={[styles.proBtnText, { color: C.brandPrimary }]}>Upgrade</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* ── Account ── */}
                <Text style={[styles.sectionTitle, { color: C.textDim }]}>Account</Text>
                <View style={[styles.group, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <RowItem
                        icon={<User size={20} color={C.textDim} />}
                        label="Personal Information"
                        subLabel={user?.name || ''}
                        onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available in the next update.')}
                    />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <RowItem
                        icon={<CreditCard size={20} color={C.textDim} />}
                        label="Subscription"
                        subLabel={isPro ? 'Active · Mentra Pro Yearly' : 'Free Tier'}
                        onPress={() => !isPro && router.push('/paywall/onboarding' as any)}
                    />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <RowItem
                        icon={<Activity size={20} color={C.textDim} />}
                        label="Restore Purchases"
                        onPress={handleRestore}
                    />
                </View>

                {/* ── Data & Privacy ── */}
                <Text style={[styles.sectionTitle, { color: C.textDim }]}>Data & Privacy</Text>
                <View style={[styles.group, { backgroundColor: C.surface, borderColor: C.border }]}>
                    <RowItem
                        icon={<Database size={20} color={C.textDim} />}
                        label="Export Data (JSON)"
                        subLabel={isExporting ? 'Generating...' : 'Download all your journals and stats'}
                        onPress={handleDataExport}
                    />
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <RowItem
                        icon={<Shield size={20} color={C.textDim} />}
                        label={I18n.t('privacy')}
                        onPress={() => router.push('/legal/privacy' as any)}
                    />
                </View>

                {/* ── App Preferences ── */}
                <Text style={[styles.sectionTitle, { color: C.textDim }]}>App Preferences</Text>
                <View style={[styles.group, { backgroundColor: C.surface, borderColor: C.border }]}>

                    {/* Language Switcher */}
                    <View style={[styles.langRow, { backgroundColor: C.surface }]}>
                        <View style={[styles.rowIcon, { backgroundColor: C.surface2 }]}>
                            <Globe size={20} color={C.textDim} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rowLabel, { color: C.text }]}>{I18n.t('language')}</Text>
                            <Text style={[styles.rowSubLabel, { color: C.textDim }]}>Interface language</Text>
                        </View>
                        <View style={styles.langSwitcher}>
                            {LANG_OPTIONS.map(opt => (
                                <Pressable
                                    key={opt.code}
                                    onPress={() => handleLangChange(opt.code)}
                                    style={[styles.langBtn, {
                                        borderColor: currentLang === opt.code ? C.brandPrimary : C.border,
                                        backgroundColor: currentLang === opt.code ? C.brandPrimary + '15' : C.bg,
                                    }]}
                                >
                                    <Text style={styles.langFlag}>{opt.flag}</Text>
                                    <Text style={[styles.langBtnText, {
                                        color: currentLang === opt.code ? C.brandPrimary : C.textDim,
                                    }]}>{opt.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: C.border }]} 