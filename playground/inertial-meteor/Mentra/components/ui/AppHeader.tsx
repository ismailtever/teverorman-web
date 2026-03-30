import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/Colors';
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

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            <View style={styles.left}>
                {showBack && (
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color={Colors.mentra.brandPrimary} />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.center}>
                <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.mentra.divider,
        backgroundColor: Colors.mentra.bg,
    },
    left: {
        flex: 1,
        alignItems: 'flex-start',
    },
    center: {
        flex: 2,
        alignItems: 'center',
    },
    right: {
        flex: 1,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.mentra.text,
    },
    backButton: {
        padding: 8,
        marginRight: -8,
    }
});
