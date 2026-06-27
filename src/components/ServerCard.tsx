import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card} from './ui/Card';
import {Badge} from './ui/Badge';
import {Colors, FontSize, Spacing} from '../utils/theme';
import type {Server} from '../services/server';

interface ServerCardProps {
  server: Server;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  onPress,
  onToggle,
  onDelete,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name="server" size={20} color={Colors.accent} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{server.name}</Text>
            <Text style={styles.region}>{server.region || 'No region'}</Text>
          </View>
          <Badge status={server.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>
              {new Date(server.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.btns}>
            <TouchableOpacity style={styles.actionBtn} onPress={onToggle}>
              <Ionicons
                name={server.status === 'running' ? 'stop-circle' : 'play-circle'}
                size={22}
                color={server.status === 'running' ? Colors.error : Colors.success}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {marginBottom: Spacing.sm},
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {flex: 1},
  name: {color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600'},
  region: {color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2},
  divider: {height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm},
  actions: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  meta: {flexDirection: 'row', alignItems: 'center', gap: 4},
  metaText: {color: Colors.textMuted, fontSize: FontSize.xs},
  btns: {flexDirection: 'row', gap: Spacing.sm},
  actionBtn: {padding: 4},
});
