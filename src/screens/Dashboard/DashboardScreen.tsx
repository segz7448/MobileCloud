import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/authStore';
import {useServerStore} from '../../store/serverStore';
import {Card} from '../../components/ui/Card';
import {Badge} from '../../components/ui/Badge';
import {Colors, FontSize, Spacing, Radius} from '../../utils/theme';

export default function DashboardScreen({navigation}: any) {
  const user = useAuthStore(s => s.user);
  const {servers, fetchServers, loading, subscribeRealtime} = useServerStore();

  useEffect(() => {
    if (user) {
      fetchServers(user.id);
      const unsub = subscribeRealtime(user.id);
      return unsub;
    }
  }, [user]);

  const runningCount = servers.filter(s => s.status === 'running').length;
  const stoppedCount = servers.filter(s => s.status === 'stopped').length;
  const errorCount = servers.filter(s => s.status === 'error').length;

  const quickActions = [
    {icon: 'server-outline', label: 'New Server', screen: 'Servers'},
    {icon: 'rocket-outline', label: 'Deploy', screen: 'Deployments'},
    {icon: 'globe-outline', label: 'Domains', screen: 'Domains'},
    {icon: 'key-outline', label: 'Credentials', screen: 'Credentials'},
    {icon: 'pulse-outline', label: 'Monitoring', screen: 'Monitoring'},
    {icon: 'document-text-outline', label: 'Logs', screen: 'Logs'},
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => user && fetchServers(user.id)}
          tintColor={Colors.accent}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'} 👋
          </Text>
          <Text style={styles.username}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="person" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statVal}>{servers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
        <Card style={[styles.statCard, {borderColor: '#052e16'}]}>
          <Text style={[styles.statVal, {color: Colors.success}]}>{runningCount}</Text>
          <Text style={styles.statLabel}>Running</Text>
        </Card>
        <Card style={[styles.statCard, {borderColor: '#2d0a0a'}]}>
          <Text style={[styles.statVal, {color: Colors.error}]}>{errorCount}</Text>
          <Text style={styles.statLabel}>Errors</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statVal, {color: Colors.textMuted}]}>{stoppedCount}</Text>
          <Text style={styles.statLabel}>Stopped</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map(action => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon as any} size={22} color={Colors.accent} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Servers */}
      <Text style={styles.sectionTitle}>Recent Servers</Text>
      {servers.slice(0, 3).map(server => (
        <TouchableOpacity
          key={server.id}
          onPress={() => navigation.navigate('Servers')}
          activeOpacity={0.8}>
          <Card style={styles.serverRow}>
            <View style={styles.serverRowInner}>
              <View style={styles.serverIcon}>
                <Ionicons name="server" size={16} color={Colors.accent} />
              </View>
              <View style={styles.serverInfo}>
                <Text style={styles.serverName}>{server.name}</Text>
                <Text style={styles.serverRegion}>{server.region || 'Global'}</Text>
              </View>
              <Badge status={server.status} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {servers.length === 0 && (
        <Card style={styles.emptyCard}>
          <Ionicons name="server-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No servers yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first server to get started
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  greeting: {color: Colors.textMuted, fontSize: FontSize.sm},
  username: {color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '700'},
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {flex: 1, alignItems: 'center', padding: Spacing.sm},
  statVal: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {color: Colors.textMuted, fontSize: 10, marginTop: 2},
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '30%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  serverRow: {marginHorizontal: Spacing.lg, marginBottom: Spacing.sm},
  serverRowInner: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
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
  emptyCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyText: {color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600'},
  emptySubtext: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  bottomPad: {height: 80},
});
