import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { Metrics } from '@/constants/Theme';
import { Colors } from '@/constants/Colors';

export default function DisclaimerScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Medical Disclaimer', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <AlertTriangle size={48} color={Colors.mentra.danger} />
                    <ThemedText type="title" style={{ marginTop: 20, textAlign: 'center' }}>Not Medical Advice</ThemedText>
                </View>

                <ThemedText style={styles.p}>
                    The Mentra application and its cognitive training features are designed for general wellness, recreation, and performance tracking purposes only.
                </ThemedText>

                <View style={styles.box}>
                    <ThemedText type="defaultSemiBold" style={{ color: Colors.mentra.danger }}>IMPORTANT:</ThemedText>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    content: { padding: Metrics.spacing.l },
    p: { fontSize: 16, lineHeight: 24, color: '#ccc', marginBottom: 20, marginTop: 5 },
    box: {
        borderWidth: 1, borderColor: Colors.mentra.danger,
        backgroundColor: 'rgba(255, 50, 50, 0.1)',
        padding: 20, borderRadius: 12, marginBottom: 20
    }
});
