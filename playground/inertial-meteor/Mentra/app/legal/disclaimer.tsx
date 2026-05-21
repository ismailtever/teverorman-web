import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertTriangle } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { Metrics } from '@/constants/Theme';
import { useMentraTheme } from '@/hooks/useMentraTheme';

export default function DisclaimerScreen() {
    const C = useMentraTheme();
    const styles = makeStyles(C);

    return (
        <View style={styles.container}>
            <StatusBar style={C.statusBar} />
            <Stack.Screen options={{
                title: 'Medical Disclaimer',
                headerStyle: { backgroundColor: C.bg },
                headerTintColor: C.text,
            }} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <AlertTriangle size={48} color={C.danger} />
                    <ThemedText type="title" style={{ marginTop: 20, textAlign: 'center' }}>Not Medical Advice</ThemedText>
                </View>

                <ThemedText style={styles.p}>
                    The Mentra application and its cognitive training features are designed for general wellness, recreation, and performance tracking purposes only.
                </ThemedText>

                <View style={styles.box}>
                    <ThemedText type="defaultSemiBold" style={{ color: C.danger }}>IMPORTANT:</ThemedText>
                    <ThemedText style={styles.p}>
                        Mentra is NOT a medical device. It should NOT be used to diagnose, treat, cure, or prevent any disease, medical condition, or mental health disorder (such as ADHD, Snoezelen, or Concussion).
                    </ThemedText>
                </View>

                <ThemedText style={styles.p}>
                    If you believe you have a medical condition or are experiencing symptoms, please consult with a qualified healthcare professional immediately. Do not disregard professional medical advice or delay in seeking it because of something you have read or experienced in this app.
                </ThemedText>
            </ScrollView>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        content: { padding: Metrics.spacing.l },
        p: {
            fontSize: 16,
            lineHeight: 24,
            color: C.textDim,
            marginBottom: 20,
            marginTop: 5,
        },
        box: {
            borderWidth: 1,
            borderColor: C.danger,
            backgroundColor: C.isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.05)',
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
        },
    });
}
