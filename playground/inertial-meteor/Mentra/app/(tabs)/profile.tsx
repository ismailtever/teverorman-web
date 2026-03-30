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
import { I18n, Lang } from '@/services/i18n';
import { RamadanService } from '@/services/ramadan';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [ramadanMode, setRamadanMode] = useState(false);
    const [currentLang, setCurrentLang] = useState<Lang>(I18n.getLanguage() as Lang);

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
                "Export Your Data",
                "Generate a JSON package of all your journals, scores, and routines?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Export", style: "default", onPress: performExport }
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
            if (await Share.share({ message: JSON.stringify(exportData, null, 2), title: 'Mentra Export' })) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) {
            Alert.alert("Export Failed", "There was an error generating your data package.");
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
                Alert.alert("Restored", "Your Pro subscription has been restored.");
            } else {
                Alert.alert("No Purchases Found", "We couldn't find an active Pro subscription linked to this Apple ID.");
            }
        } catch (e) {
            Alert.alert("Error", "Could not restore purchases at this time.");
        }
    };

    const handleLangChange = async (lang: Lang) => {
        Haptics.selectionAsync?.();
        await I18n.setLanguage(lang);
        setCurrentLang(lang);
    };

    const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
        { code: 'en', label: 'EN', flag: '🇬🇧' },
        { code: 'hi', label: 'हि', flag: '🇮🇳' },
        { code: 'tr', label: 'TR', flag: '🇹🇷' },
        { code: 'ar', label: 'AR', flag: '🌍' },
        { code: 'fr', label: 'FR', flag: '🇫🇷' },
        { code: 'de', label: 'DE', flag: '🇩🇪' },
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
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile Card */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                            <Text style={styles.profileEmail}>{isPro ? 'Mentra Pro Member' : 'Free Tier'}</Text>
                        </View>
                        {!isPro && (
                            <Pressable style={styles.proBtn} onPress={() => router.push('/paywall/onboarding' as any)}>
                                <Zap size={14} color={Colors.mentra.brandPrimary} />
                                <Text style={styles.proBtnText}>Upgrade</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Account & Billing */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.group}>
                    <RowItem
                        icon={<User size={20} color={Colors.mentra.textDim} />}
                        label="Personal Information"
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<CreditCard size={20} color={Colors.mentra.textDim} />}
                        label="Subscription"
                        subLabel={isPro ? "Active • Mentra Pro Yearly" : "Free Tier"}
                        onPress={() => isPro ? null : router.push('/paywall/onboarding' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Activity size={20} color={Colors.mentra.textDim} />}
                        label="Restore Purchases"
                        onPress={handleRestore}
                    />
                </View>

                {/* Data & Privacy */}
                <Text style={styles.sectionTitle}>Data & Privacy</Text>
                <View style={styles.group}>
                    <RowItem
                        icon={<Database size={20} color={Colors.mentra.textDim} />}
                        label="Export Data (JSON)"
                        subLabel={isExporting ? "Generating..." : "Download all your journals and stats"}
                        onPress={handleDataExport}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Shield size={20} color={Colors.mentra.textDim} />}
                        label="Privacy Policy"
                        onPress={() => router.push('/legal/privacy' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<BookOpen size={20} color={Colors.mentra.textDim} />}
                        label="Terms of Service"
                        onPress={() => router.push('/legal/terms' as any)}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<AlertTriangle size={20} color={Colors.mentra.textDim} />}
                        label="Medical Disclaimer"
                        onPress={() => router.push('/legal/disclaimer' as any)}
                    />
                </View>

                {/* Preferences */}
                <Text style={styles.sectionTitle}>App Preferences</Text>
                <View style={styles.group}>
                    {/* Language Switcher */}
                    <View style={styles.rowItem}>
                        <View style={[styles.rowIcon, { backgroundColor: Colors.mentra.surface2 }]}>
                            <Globe size={20} color={Colors.mentra.textDim} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowLabel}>Language</Text>
                            <Text style={styles.rowSubLabel}>Interface language</Text>
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
                        label={I18n.t('ramadanMode')}
                        subLabel={ramadanMode ? I18n.t('ramadanActive') : 'Auto-detect or enable manually'}
                        onPress={async () => {
                            const next = !ramadanMode;
                            await RamadanService.setRamadanMode(next);
                            setRamadanMode(next);
                        }}
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<Bell size={20} color={Colors.mentra.textDim} />}
                        label="Push Notifications"
                        subLabel="Daily streak and check-in reminders"
                    />
                    <View style={styles.divider} />
                    <RowItem
                        icon={<HelpCircle size={20} color={Colors.mentra.textDim} />}
                        label="Help & Support"
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
                        label="Sign Out"
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
    rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { fontSize: 16, fontWeight: '600', color: Colors.mentra.text },
    rowSubLabel: { fontSize: 13, color: Colors.mentra.textDim, marginTop: 2 },

    // Language Switcher
    langSwitcher: { flexDirection: 'row', gap: 6 },
    langBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: Colors.mentra.border, backgroundColor: Colors.mentra.bg },
    langBtnActive: { borderColor: Colors.mentra.brandPrimary, backgroundColor: Colors.mentra.brandPrimary + '15' },
    langFlag: { fontSize: 14 },
    langBtnText: { fontSize: 11, fontWeight: '700', color: Colors.mentra.textDim },
    langBtnTextActive: { color: Colors.mentra.brandPrimary },
});
