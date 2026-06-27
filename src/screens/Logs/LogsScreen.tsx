import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useServerStore} from '../../store/serverStore';
import {getLogs} from '../../services/server';
import {supabase} from '../../services/supabase';
import {Colors, FontSize, Spacing, Radius} from '../../utils/theme';

const LOG_COLORS: Record<string, string> = {
  info: Colors.success,
  warn: Colors.warning,
  error: Colors.error,
  debug: Colors.accent,
};

export default function LogsScreen() {
  const servers = useServerStore(s => s.servers);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const scrollRef = useRef<ScrollView>(null);

  const selectedServer = servers.find(s => s.id === selectedServerId);

  useEffect(() => {
    if (servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0].id);
    }
  }, [servers]);

  useEffect(() => {
    if (!selectedServerId) return;
    loadLogs();

    const channel = supabase
      .channel(`logs-${selectedServerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'logs',
          filter: `server_id=eq.${selectedServerId}`,
        },
        payload => {
          setLogs(prev => [...prev, payload.new]);
          scrollRef.current?.scrollToEnd({animated: true});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedServerId]);

  const loadLogs = async () => {
    if (!selectedServerId) return;
    try {
      const data = await getLogs(selectedServerId, 200);
      setLogs(data.reverse());
    } catch {}
  };

  const filteredLogs =
    filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Server selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.serverSelector}
        contentContainerStyle={styles.serverSelectorContent}>
        {servers.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.serverChip,
              selectedServerId === s.id && styles.serverChipActive,
            ]}
            onPress={() => setSelectedServerId(s.id)}>
            <Text
              style={[
                styles.serverChipText,
                selectedServerId === s.id && styles.serverChipTextActive,
              ]}>
              {s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Level filter */}
      <View style={styles.filters}>
        {(['all', 'info', 'warn', 'error'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                filter === f && {color: Colors.textPrimary},
              ]}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Log output */}
      <ScrollView
        ref={scrollRef}
        style={styles.logBox}
        contentContainerStyle={styles.logContent}>
        {filteredLogs.length === 0 && (
          <Text style={styles.emptyLog}>
            {selectedServer
              ? 'No logs yet. Start your server to see logs.'
              : 'Select a server to view logs.'}
          </Text>
        )}
        {filteredLogs.map((log, i) => (
          <View key={i} style={styles.logLine}>
            <Text style={styles.logTime}>
              {new Date(log.created_at).toLocaleTimeString()}
            </Text>
            <Text
              style={[
                styles.logLevel,
                {color: LOG_COLORS[log.level] || Colors.textMuted},
              ]}>
              {(log.level || 'INFO').toUpperCase().padEnd(5)}
            </Text>
            <Text style={styles.logMsg}>{log.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
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
  liveDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success},
  liveText: {color: Colors.success, fontSize: FontSize.xs, fontWeight: '700'},
  serverSelector: {maxHeight: 50},
  serverSelectorContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  serverChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serverChipActive: {backgroundColor: Colors.accent, borderColor: Colors.accent},
  serverChipText: {color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '500'},
  serverChipTextActive: {color: '#fff'},
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  filterActive: {backgroundColor: Colors.border},
  filterText: {color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700'},
  logBox: {
    flex: 1,
    backgroundColor: '#060A10',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logContent: {padding: Spacing.sm},
  emptyLog: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
    padding: Spacing.xl,
  },
  logLine: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  logTime: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    minWidth: 70,
  },
  logLevel: {fontSize: 10, fontFamily: 'monospace', fontWeight: '700', minWidth: 40},
  logMsg: {
    flex: 1,
    color: '#a0aec0',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
