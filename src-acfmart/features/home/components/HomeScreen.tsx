import { View, Text, StyleSheet } from 'react-native';
import { colors, semanticColors, spacing, typography } from '../../../design-system/tokens';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ACF Marketplace</Text>
      <Text style={styles.subtitle}>Sàn TMĐT chống hàng giả</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
    color: colors.brand.red[500],
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
});

export default HomeScreen;
