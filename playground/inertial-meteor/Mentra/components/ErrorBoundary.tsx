import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { Brain } from 'lucide-react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // We could log this to Sentry/Crashlytics here later.
        console.error("Global Error Boundary Caught:", error, errorInfo);
    }

    handleRestart = () => {
        // In Expo, the best we can do short of Updates.reloadAsync() is to reset local state.
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Brain color={Colors.mentra.brandPrimary} size={64} style={{ marginBottom: Metrics.spacing.xl }} />
                    <Text style={styles.title}>System Interruption</Text>
                    <Text style={styles.subtitle}>
                        Mentra experienced an unexpected cognitive load. Please restart the protocol.
                    </Text>

                    <Pressable style={styles.button} onPress={this.handleRestart}>
                        <Text style={styles.btnText}>Restart App</Text>
                    </Pressable>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.mentra.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Metrics.spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.mentra.text,
        marginBottom: Metrics.spacing.m,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.mentra.textDim,
        textAlign: 'center',
        marginBottom: Metrics.spacing.xxl,
        lineHeight: 24,
    },
    button: {
        backgroundColor: Colors.mentra.surface,
        paddingVertical: Metrics.spacing.m,
        paddingHorizontal: Metrics.spacing.xl,
        borderRadius: Metrics.radius.m,
        borderWidth: 1,
        borderColor: Colors.mentra.brandPrimary,
    },
    btnText: {
        color: Colors.mentra.text,
        fontWeight: '600',
        fontSize: 16,
    }
});
