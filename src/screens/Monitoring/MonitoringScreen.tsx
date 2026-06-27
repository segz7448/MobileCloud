import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card} from '../../components/ui/Card';
import {Badge} from '../../components/ui/Badge';
import {Colors, FontSize, Spacing, Radius} from '../../utils/theme';
import {useServerStore} from '../../store/serverStore';

interface Metric {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  percent: number;
}

export default function MonitoringScreen() {
  const servers = useServerStore(s => s.servers);
  const [refreshing, setRefreshing] = useState(false);

  const runningServers = servers.filter(s => s.status === 'running');

  const globalMetrics: Metric[] = [
    {
      label: 'CPU Usage',
      value: runningServers.length > 0 ? '24' : '0',
      unit: '%',
      icon: 'hardware-chip',
      color: Colors.accent,
      percent: runningServers.length > 0 ? 24 : 0,
    },
    {
      label: 'Memory',
      value: runningServers.length > 0 ? '1.2' : '0',
      unit: 'GB',
      icon: 'layers',
      color: Colors.success,
      percent: runningServers.length > 0 ? 40 : 0,
    },
    {
      label: 'Network In',
      value: runningServers.length > 0 ? '42' : '0',
      unit: 'MB/s',
      icon: 'arrow-down',
      color: Colors.warning,
      percent: runningServers.length > 0 ? 15 : 0,
    },
    {
      label: 'Network Out',
      value: runningServers.length > 0 ? '18' : '0',
      unit: 'MB/s',
      icon: 'arrow-up',
      color: '#a855f7',
      percent: runningServers.length > 0 ? 8 : 0,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.accent}
        />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>Monitoring</Text>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Overview */}
      <View style={styles.overviewGrid}>
        {globalMetrics.map(metric => (
          <Card key={metric.label} style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Ionicons name={metric.icon as any} size={16} color={metric.color} />
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
            <Text style={[styles.metricValue, {color: metric.color}]}>
              {metric.value}
              <Text style={styles.metricUnit}> {metric.unit}</Text>
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${metric.percent}%`, backgroundColor: metric.color},
                ]}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Server Health */}
      <Text style={styles.sectionTitle}>Server Health</Text>
      {servers.map(server => (
        <Card key={server.id} style={styles.serverHealth}>
          <View style={styles.serverRow}>
            <View style={styles.serverIcon}>
              <Ionicons name="server" size={16} color={Colors.accent} />
            </View>
            <View style={styles.serverInfo}>
              <Text style={styles.serverName}>{server.name}</Text>
              <Text style={styles.serverRegion}>{server.region || 'Global'}</Text>
            </View>
            <Badge status={server.status} />
          </View>

          {server.status === 'running' && (
            <View style={styles.healthBars}>
              {[
                {label: 'CPU', val: 24, color: Colors.accent},
                {label: 'RAM', val: 38, color: Colors.success},
                {label: 'Disk', val: 12, color: Colors.warning},
              ].map(h => (
                <View key={h.label} style={styles.healthRow}>
                  <Text style={styles.healthLabel}>{h.label}</Text>
                  <View style={styles.healthBar}>
                    <View
                      style={[
                        styles.healthFill,
                        {width: `${h.val}%`, backgroundColor: h.color},
                      ]}
                    />
                  </View>
                  <Text style={[styles.healthVal, {color: h.color}]}>{h.val}%</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}

      {servers.length === 0 && (
        <Card style={styles.emptyCard}>
          <Ionicons name="pulse-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No servers to monitor</Text>
        </Card>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary},
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#052e16',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  liveText: {color: Colors.success, fontSize: FontSize.xs, fontWeight: '700'},
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricCard: {width: '47%', gap: Spacing.xs},
  metricTop: {flexDirection: 'row', alignItems: 'center', gap: 5},
  metricLabel: {color: Colors.textMuted, fontSize: FontSize.xs},
  metricValue: {fontSize: FontSize.xl, fontWeight: '800'},
  metricUnit: {fontSize: FontSize.sm, fontWeight: '400'},
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {height: '100%', borderRadius: 2},
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  serverHealth: {marginHorizontal: Spacing.lg, marginBottom: Spacing.sm},
  serverRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  serverIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverInfo: {flex: 1},
  serverName: {color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600'},
  serverRegion: {color: Colors.textMuted, fontSize: FontSize.xs},
  healthBars: {marginTop: Spacing.sm, gap: Spacing.xs},
  healthRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  healthLabel: {color: Colors.textMuted, fontSize: FontSize.xs, width: 30},
  healthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  healthFill: {height: '100%', borderRadius: 2},
  healthVal: {fontSize: FontSize.xs, fontWeight: '700', width: 32, textAlign: 'right'},
  emptyCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyText: {color: Colors.textMuted, fontSize: FontSize.md},
  bottomPad: {height: 80},
});
