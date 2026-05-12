import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../design-system/tokens';

const Logo = ({ size = 80, style }) => {
  return (
    <View style={[styles.logoContainer, style]}>
      <Image 
        source={{ uri: 'https://placehold.co/200x200?text=ACF+Logo' }} 
        style={[styles.logo, { width: size, height: size }]} 
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Style sẽ được áp dụng qua prop
  },
});

export default Logo;