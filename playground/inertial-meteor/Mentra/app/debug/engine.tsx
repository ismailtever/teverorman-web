import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { MentraButton } from '@/components/MentraButton';
import { Colors } from '@/constants/Colors';
import { Storage } from '@/services/storage';
import { AnalysisEngine, DEFAULT_COGNITIVE_PROFILE } from '@/services/engine/AnalysisEngine';
import { RawGameSession, CognitiveProfile } from '@/services/engine/types';

// STRICT PRODUCTION GUARD
const IS_DEV = __DEV__;

export default function DebugEngineScreen() {
    const [sessions, setSessions] = useState<RawGameSession[]>([]);
    const [profile, setProfile] = useState<CognitiveProfile | null>(null);
    const [useMock, setUseMock] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // 1. PRODUCTION REDIRECT
    useEffect(() => {
        if (!IS_DEV) {
            router.replace('/(tabs)');
        }
    }, []);

    // 2. PRODUCTION FALLBACK UI
    if (!IS_DEV) {
        return (
            <View style={styles.centerContainer}>
                <StatusBar style="light" />
                <ThemedText type="subtitle">Not available in production</ThemedText>
                <ThemedText style={styles.subText}>This screen is dev-only.</ThemedText>
            </View>
        );
    }

    // 3. DEV LOGIC
    const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    const loadData = async () => {
        const s = await Storage.getRecentSessions(20);
        setSessions(s);

        const mockPref = await AsyncStorage.getItem('mentra_dev_use_mock');
        // Default to TRUE if null (Sim Mode)
        setUseMock(mockPref === null || mockPref === 'true');

        addLog(`Loaded ${s.length} sessions.`);
    };

    const toggleMock = async (val: boolean) => {
        setUseMock(val);
        await AsyncStorage.setItem('mentra_dev_use_mock', val ? 'true' : 'false');
        addLog(`Mock Mode set to: ${val}`);
    };

    const runRecompute = async () => {
        addLog('Starting Recompute...');
        if (sessions.length === 0) {
            addLog('Error: No sessions found.');
            return;
        }

        let current: CognitiveProfile = { ...DEFAULT_COGNITIVE_PROFILE };
        const sorted = [...sessions].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        sorted.forEach((sess, i) => {
            current = AnalysisEngine.updateProfile(current, sess);
        });

        setProfile(current);
        await Storage.saveCognitiveProfile(current);
        addLog('Profile Computed & Saved.');
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Mentra Debug Lab', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
            <StatusBar style="light" />

            <View style={styles.controls}>
                <View style={styles.row}>
                    <ThemedText>Use Mock Data</ThemedText>
                    <Switch value={useMock} onValueChange={toggleMock} trackColor={{ false: '#333', true: Colors.mentra.brandAccent }} />
                </View>
                <MentraButton title="Recompute Profile" onPress={runRecompute} style={{ marginTop: 10 }} />
                <MentraButton title="Refresh Sessions" variant="secondary" onPress={loadData} style={{ marginTop: 10 }} />
            </View>

            <ScrollView style={styles.scroll}>
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Computed Profile</ThemedText>
                    <ThemedText style={styles.mono}>{profile ? JSON.stringify(profile, null, 2) : 'No Data'}</ThemedText>
                </View>

                <ThemedText type="subtitle">Logs</ThemedText>
                {logs.map((l, i) => (
                    <ThemedText key={i} style={{ fontSize: 10, color: '#666' }}>{l}</ThemedText>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 20 },
    centerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    subText: { color: '#666', marginTop: 8 },
    controls: { marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 10, borderRadius: 8 },
    scroll: { flex: 1 },
    section: { marginBottom: 20, padding: 10, backgroundColor: '#111', borderRadius: 8 },
    mono: { fontFamily: 'monospace', color: Colors.mentra.brandSecondary, fontSize: 10 },
});
