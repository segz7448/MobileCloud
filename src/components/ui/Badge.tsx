import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Radius, FontSize} from '../../utils/theme';

type Status = 'running' | 'stopped' | 'error' | 'building' | 'pending' | 'success' | 'failed' | 'active';

interface BadgeProps {
  status: Status;
  label?: string;
}

const statusConfig: Record<Status, {color: string; bg: string; dot: string}> = {
  running: {color: Colors.success, bg: '#052e16', dot: Colors.success},
  stopped: {color: Colors.textMuted, bg: '#1a1a2e', dot: Colors.textMuted},
  error: {color: Colors.error, bg: '#2d0a0a', dot: Colors.error},
  building: {color: Colors.warning, bg: '#1c1407', dot: Colors.warning},
  pending: {color: Colors.warning, bg: '#1c1407', dot: Colors.warning},
  success: {color: Colors.success, bg: '#052e16', dot: Colors.success},
  failed: {color: Colors.error, bg: '#2d0a0a', dot: Colors.error},
  active: {color: Colors.accent, bg: '#0c1a3d', dot: Colors.accent},
};

export const Badge: React.FC<BadgeProps> = ({status, label}) => {
  const config = statusConfig[status] || statusConfig.stopped;
  return (
    <View style={[styles.badge, {backgroundColor: config.bg}]}>
      <View style={[styles.dot, {backgroundColor: config.dot}]} />
      <Text style={[styles.label, {color: config.color}]}>
        {label || status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xl,
    gap: 5,
  },
  dot: {width: 6, height: 6, borderRadius: 3},
  label: {fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize'},
});
