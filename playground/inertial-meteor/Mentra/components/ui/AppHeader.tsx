import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export const AppHeader = ({ title, showBack = false, rightAction }: AppHeaderProps) => {
    const insets = useSafeAreaInsets();
    const C = useMentraTheme();

    return (
        <View style={[styles.container, {
            paddingTop: insets.top + 16,
            borderBottomColor: C.border,
            backgroundColor: C.bg,
        }]}>
            <View style={styles.left}>
                {showBack && (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color={C.brandPrimary} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.center}>
                <ThemedText style={[styles.title, { color: C.text }]} numberOfLines={1}>{title}</ThemedText>
            </View>
            <View style={styles.right}>
                {rightAction}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    left:   { flex: 1, alignItems: 'flex-start' },
    center: { flex: 2, alignItems: 'center' },
    right:  { flex: 1, alignItems: 'flex-end' },
    title:  { fontSize: 18, fontWeight: '700' },
    backButton: { padding: 8, marginRight: -8 },
});
