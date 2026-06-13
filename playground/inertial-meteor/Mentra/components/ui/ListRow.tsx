import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { ChevronRight } from 'lucide-react-native';

interface ListRowProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showChevron?: boolean;
    style?: any;
}

export const ListRow = ({ title, subtitle, icon, rightElement, onPress, showChevron = true, style, ...props }: ListRowProps) => {
    const C = useMentraTheme();
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.container, {
                backgroundColor: C.surface,
                borderBottomColor: C.border,
            }, style]}
            onPress={onPress}
            activeOpacity={0.7}
            {...(props as any)}
        >
            <View style={styles.leftContent}>
                {icon && (
                    <View style={[styles.iconContainer, { backgroundColor: C.surface2 }]}>
                        {icon}
                    </View>
                )}
                <View style={styles.textContainer}>
                    <ThemedText style={[styles.title, { color: C.text }]}>{title}</ThemedText>
                    {subtitle && <ThemedText style={[styles.subtitle, { color: C.muted }]}>{subtitle}</ThemedText>}
                </View>
            </View>
            <View style={styles.rightContent}>
                {rightElement}
                {onPress && showChevron && !rightElement && (
                    <ChevronRight size={20} color={C.muted} />
                )}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Metrics.spacing.m,
        paddingHorizontal: Metrics.spacing.l,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        marginRight: Metrics.spacing.m,
        width: 40, height: 40,
        borderRadius: Metrics.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: { flex: 1 },
    title:    { fontSize: 16, fontWeight: '600' },
    subtitle: { fontSize: 14, marginTop: 2 },
    rightContent: { flexDirection: 'row', alignItems: 'center', marginLeft: Metrics.spacing.m },
});
