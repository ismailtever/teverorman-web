import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import Animated, { useAnimatedProps, withRepeat, withTiming, useSharedValue, withSequence } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const HEIGHT = 240;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Node = ({ x, y, size, active }: any) => {
  const scale = useSharedValue(active ? 1.2 : 1);

  React.useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(withTiming(1.4, { duration: 1500 }), withTiming(1.1, { duration: 1500 })),
        -1,
        true
      );
    }
  }, [active]);

  return (
    <G>
      <Circle cx={x} cy={y} r={size + 4} fill="rgba(0, 128, 128, 0.1)" />
      <AnimatedCircle cx={x} cy={y} r={size} fill={active ? '#008080' : 'rgba(255, 255, 255, 0.2)'} />
    </G>
  );
};

export const NeuralTree = () => {
  const center = width / 2;
  
  return (
    <View style={styles.container}>
      <Svg width={width} height={HEIGHT}>
        <G>
          {/* Main Trunk */}
          <Line x1={center} y1={220} x2={center} y2={120} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          
          {/* Branches */}
          <Line x1={center} y1={120} x2={center - 60} y2={70} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <Line x1={center} y1={120} x2={center + 60} y2={50} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <Line x1={center - 60} y1={70} x2={center - 100} y2={30} stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          
          {/* Nodes */}
          <Node x={center} y={220} size={10} active={true} />
          <Node x={center} y={120} size={8} active={false} />
          <Node x={center - 60} y={70} size={6} active={true} />
          <Node x={center + 60} y={50} size={6} active={false} />
          <Node x={center - 100} y={30} size={4} active={true} />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: HEIGHT, alignItems: 'center', justifyContent: 'center' },
});
