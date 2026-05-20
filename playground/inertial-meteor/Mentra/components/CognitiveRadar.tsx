import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

import { useMentraTheme } from '@/hooks/useMentraTheme';
import { ThemedText } from './themed-text';
import { CognitiveProfile } from '@/services/engine/types';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface CognitiveRadarProps {
    data: CognitiveProfile;
    size?: number;
}

const AXIS_LABELS = ['Memory', 'Focus', 'Speed', 'Flexibility', 'Problem']; // 5 axes

export function CognitiveRadar({ data, size = 300 }: CognitiveRadarProps) {
    const C = useMentraTheme();
    const center = size / 2;
    const radius = (size / 2) - 40; // Padding for labels

    // Calculate points for the polygon (0-100 normalized)
    const calculatePoints = (profile: CognitiveProfile): string => {
        const values = [
            profile.memory,
            profile.focus,
            profile.speed,
            profile.flexibility,
            profile.problem_solving || 50 // fallback
        ];

        return values.map((val, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2; // Start at top (-90deg)
            const r = (val / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    };

    // Background Webs (20%, 40%, 60%, 80%, 100%)
    const renderWebs = () => {
        const levels = [0.2, 0.4, 0.6, 0.8, 1];
        return levels.map((level, lvlIndex) => {
            const points = Array.from({ length: 5 }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const r = radius * level;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
            }).join(' ');

            return (
                <Polygon
                    key={lvlIndex}
                    points={points}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                    fill="none"
                />
            );
        });
    };

    // Axis Lines & Labels
    const renderAxes = () => {
        return Array.from({ length: 5 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            // Label Position (pushed out slightly)
            const labelX = center + (radius + 25) * Math.cos(angle);
            const labelY = center + (radius + 20) * Math.sin(angle);

            return (
                <G key={i}>
                    <Line
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                    <SvgText
                        x={labelX}
                        y={labelY}
                        fill="rgba(255,255,255,0.6)"
                        fontSize="10"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                    >
                        {AXIS_LABELS[i].toUpperCase()}
                    </SvgText>
                </G>
            );
        });
    };

    const points = calculatePoints(data);

    // Simple animation using React state or Reanimated if complex logic needed
    // For MVP, direct render is fine, but lets add initial opacity fade in

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg height={size} width={size}>
                {renderWebs()}
                {renderAxes()}

                {/* Data Polygon */}
                <Polygon
                    points={points}
                    fill={C.brandPrimary}
                    fillOpacity="0.4"
                    stroke={C.brandPrimary}
                    strokeWidth="2"
                />

                {/* Comparison/Mock Average (Gray) if needed */}
                {/* <Polygon points={bgPoints} stroke="rgba(255,255,255,0.2)" fill="none" /> */}
            </Svg>
        </View>
    );
}
