import * as Application from 'expo-application';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertTriangle, FileText, Globe, Info, Shield, Trash2, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Linking, Platform } from 'react-native';
import Purchases from 'react-native-purchases';

import { ThemedText } from '@/components/themed-text';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';
import { Storage } from '@/services/storage';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Cards';
import { ListRow } from '@/components/ui/ListRow';
import { SectionTitle } from '@/components/ui/Typography';

const IS_DEV = __DEV__;

export default function SettingsScreen() {
    const C = useMentraTheme();
    const [_, forceUpdate] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const version = Application.nativeApplicationVersion || '1.0.0';
    const build = Application.nativeBuildVersion || '1';

    useEffect(() => {
        const unsub = I18n.subscribe(() => forceUpdate(n => n + 1));
        return unsub;
    }, []);

    const handleLanguageChange = async () => {
        const current = I18n.getLanguage();
        const next = current === 'en' ? 'tr' : 'en';
        await I18n.setLanguage(next);
    };

    useEffect(() => {
        const checkProStatus = async () => {
            try {
                const customerInfo = await Purchases.getCustomerInfo();
                if (typeof customerInfo.entitlements.active['Mentra Pro'] !== "undefined") {
                    setIsPro(true);
                }
            } catch (e) {
                // Ignore silent failure
            }
        };
        checkProStatus();
    }, []);

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (typeof customerInfo.entitlements.active['Mentra Pro'] !== "undefined") {
                setIsPro(true);
                Alert.alert(I18n.t('alertRestored'), I18n.t('alertRestoredMsg'));
            } else {
                Alert.alert(I18n.t('alertNoPurchases'), I18n.t('alertNoPurchasesMsg'));
            }
        } catch (e: any) {
            Alert.alert(I18n.t('alertRestoreFailed'), e.message);
        } finally {
            setIsRestoring(false);
        }
    };

    const handleManageSub = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('https://apps.apple.com/account/subscriptions');
        } else {
            Linking.openURL('https://play.google.com/store/account/subscriptions');
        }
    };

    const handleReset = () => {
        Alert.alert(
            I18n.t('resetData'),
            I18n.t('resetConfirm'),
            [
                { text: I18n.t('cancel'), style: 'cancel' },
                {
                    text: I18n.t('confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        await Storage.resetAllData();
                        router.replace('/(tabs)');
                    }
                }
            ]
        );
    };

    const styles = makeStyles(C);

    return (
        <View style={styles.container}>
            <StatusBar style={C.statusBar} />
            <AppHeader title={I18n.t('settings')} showBack />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Mentra Pro Upgrade CTA */}
                {!isPro && (
                    <View style={styles.section}>
                        <Card style={[styles.proCard, { padding: 0, overflow: 'hidden' }]}>
                            <ListRow
                                title={I18n.t('upgradeProTitle')}
                                subtitle={I18n.t('upgradeProSubtitle')}
                                icon={<Shield fill={C.brandPrimary} size={20} color={C.bg} />}
                                onPress={() => router.push('/paywall/onboarding' as any)}
                                style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}
                            />
                        </Card>
                    </View>
                )}

                {/* Subscriptions */}
                <View style={styles.section}>
                    <SectionTitle title={I18n.t('subscriptionLabel')} />
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <ListRow
                            title={isRestoring ? I18n.t('restoring') : I18n.t('paywallRestore')}
                            icon={<Zap size={20} color={C.brandPrimary} />}
                            onPress={handleRestore}
                        />
                        <ListRow
                            title={I18n.t('manageSubscription')}
                            icon={<Globe size={20} color={C.brandSecondary} />}
                            onPress={handleManageSub}
                            showChevron={false}
                        />
                    </Card>
                </View>

                {/* Language / Region */}
                <View style={styles.section}>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <ListRow
                            title={I18n.t('language')}
                            icon={<Globe size={20} color={C.brandPrimary} />}
                            rightElement={<ThemedText style={styles.valueText}>{I18n.getLanguage().toUpperCase()}</ThemedText>}
                            onPress={handleLanguageChange}
                        />
                    </Card>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <SectionTitle title={I18n.t('about')} />
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <ListRow
                            title={I18n.t('version')}
                            icon={<Info size={20} color={C.brandPrimary} />}
                            rightElement={<ThemedText style={styles.valueText}>{version} ({build})</ThemedText>}
                            showChevron={false}
                        />
                        <View style={styles.warningBox}>
                            <AlertTriangle size={16} color={C.warning} style={{ marginTop: 2 }} />
                            <ThemedText style={styles.warningText}>
                                {I18n.t('medicalWarning')}
                            </ThemedText>
                        </View>
                    </Card>
                </View>

                {/* Legal Section */}
                <View style={styles.section}>
                    <SectionTitle title={I18n.t('legal')} />
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <ListRow
                            title={I18n.t('privacy')}
                            icon={<Shield size={20} color={C.brandSecondary} />}
                            onPress={() => router.push('/legal/privacy')}
                        />
                        <ListRow
                            title={I18n.t('terms')}
                            icon={<FileText size={20} color={C.brandSecondary} />}
                            onPress={() => router.push('/legal/terms')}
                        />
                        <ListRow
                            title={I18n.t('disclaimer')}
                            icon={<AlertTriangle size={20} color={C.danger} />}
                            onPress={() => router.push('/legal/disclaimer')}
                        />
                    </Card>
                </View>

                {/* Data Zone */}
                <View style={[styles.section, { marginTop: Metrics.spacing.l }]}>
                    <Card variant="outline" style={{ borderColor: C.danger, padding: 0, overflow: 'hidden' }}>
                        <ListRow
                            title={I18n.t('resetData')}
                            icon={<Trash2 size={20} color={C.danger} />}
                            onPress={handleReset}
                            showChevron={false}
                        />
                    </Card>
                </View>

                {/* Dev Section */}
                {IS_DEV && (
                    <View style={styles.section}>
                        <SectionTitle title="DEVELOPER FORCE" />
                        <Card style={{ padding: 0, overflow: 'hidden' }}>
                            <ListRow
                                title={I18n.t('debugLab')}
                                icon={<Info size={20} color={C.muted} />}
                                onPress={() => router.push('/debug/engine')}
                            />
                        </Card>
                    </View>
                )}

                <ThemedText style={styles.footer}>{I18n.t('footerBrand')}</ThemedText>
            </ScrollView>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: C.bg,
        },
        scroll: {
            padding: Metrics.spacing.l,
            paddingBottom: 60,
        },
        section: {
            marginBottom: Metrics.spacing.l,
        },
        valueText: {
            color: C.muted,
            fontSize: 14,
            fontWeight: '600',
        },
        proCard: {
            borderColor: C.brandPrimary,
            borderWidth: 1,
            shadowColor: C.brandPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 6,
        },
        warningBox: {
            flexDirection: 'row',
            padding: Metrics.spacing.m,
            backgroundColor: C.surface2,
            borderTopWidth: 1,
            borderTopColor: C.border,
            gap: 12,
        },
        warningText: {
            flex: 1,
            fontSize: 13,
            color: C.textDim,
            lineHeight: 18,
        },
        footer: {
            textAlign: 'center',
            color: C.muted,
            marginTop: Metrics.spacing.xl,
            fontSize: 12,
            fontWeight: '500',
        },
    });
}
