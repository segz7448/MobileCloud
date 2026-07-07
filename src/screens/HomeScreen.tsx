import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {darkTheme} from '@theme/index';
import {useAppStore} from '@store/useAppStore';

function HomeScreen(): React.JSX.Element {
  const bootstrapped = useAppStore(state => state.bootstrapped);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MobileCloud</Text>
      <Text style={styles.subtitle}>Foundation build — Phase 1</Text>
      <Text style={styles.status}>
        Store bootstrapped: {String(bootstrapped)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: darkTheme.spacing.lg,
  },
  title: {
    ...darkTheme.typography.h1,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  subtitle: {
    ...darkTheme.typography.body,
    color: darkTheme.colors.textMuted,
    marginBottom: darkTheme.spacing.md,
  },
  status: {
    ...darkTheme.typography.caption,
    color: darkTheme.colors.textDisabled,
  },
});

export default HomeScreen;
