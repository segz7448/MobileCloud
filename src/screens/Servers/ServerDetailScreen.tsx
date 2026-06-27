import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card} from '../../components/ui/Card';
import {Badge} from '../../components/ui/Badge';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import {Colors, FontSize, Spacing, Radius} from '../../utils/theme';
import {useServerStore} from '../../store/serverStore';
import {
  getDeployments, getLogs, createDeployment,
  updateServerStatus, type Deployment,
} from '../../services/server';
import {useAuthStore} from '../../store/authStore';
import {supabase} from '../../services/supabase';
import {
  deployFromGitHub, deleteWorker,
  sanitizeWorkerName, getWorkerMetrics,
} from '../../services/cloudflare';
import {listRepos, getBranches, getLatestCommit} from '../../services/github';

export default function ServerDetailScreen({route, navigation}: any) {
  const {serverId} = route.params;
  const user = useAuthStore(s => s.user);
  const servers = useServerStore(s => s.servers);
  const toggleServer = useServerStore(s => s.toggleServer);
  const server = servers.find(s => s.id === serverId);

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [deploying, setDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState<'deployments'|'logs'|'env'>('deployments');
  const [repos, setRepos] = useState<any[]>([]);
  const [workerUrl, setWorkerUrl] = useState('');
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadRepos();
    const channel = supabase
      .channel(`server-${serverId}`)
      .on('postgres_changes',
        {event: 'INSERT', schema: 'public', table: 'logs',
          filter: `server_id=eq.${serverId}`},
        payload => setLogs(prev => [payload.new, ...prev]),
      )
      .subscribe();
    return () => {supabase.removeChannel(channel);};
  }, [serverId]);

  const loadData = async () => {
    const [deps, serverLogs] = await Promise.all([
      getDeployments(serverId),
      getLogs(serverId),
    ]);
    setDeployments(deps);
    setLogs(serverLogs);
  };

  const loadRepos = async () => {
    try {
      const data = await listRepos();
      setRepos(data);
    } catch {}
  };

  const handleDeploy = async () => {
    if (!repo.trim()) {
      Alert.alert('Error', 'Please enter a GitHub repo (e.g. username/repo)');
      return;
    }
    setDeploying(true);
    try {
      // 1. Create deployment record
      const dep = await createDeployment(serverId, user!.id, repo.trim(), branch);
      setDeployments(prev => [dep, ...prev]);

      // 2. Get latest commit info
      let commitHash = '';
      try {
        const commit = await getLatestCommit(repo.trim(), branch);
        commitHash = commit.sha;
      } catch {}

      // 3. Deploy to Cloudflare Workers
      const workerName = sanitizeWorkerName(`mc-${server?.name || serverId.slice(0,8)}`);
      const result = await deployFromGitHub(workerName, repo.trim(), branch);

      // 4. Update server status to running
      await updateServerStatus(serverId, 'running');
      setWorkerUrl(result.url);

      // 5. Update deployment status to success
      await supabase.from('deployments')
        .update({status: 'success', deployed_at: new Date().toISOString(), commit_hash: commitHash})
        .eq('id', dep.id);

      // 6. Log the deployment
      await supabase.from('logs').insert({
        server_id: serverId,
        level: 'info',
        message: `Deployed ${repo} (${branch}) → ${result.url}`,
      });

      setDeployments(prev =>
        prev.map(d => d.id === dep.id
          ? {...d, status: 'success', commit_hash: commitHash}
          : d
        )
      );

      // 7. Fetch metrics
      try {
        const m = await getWorkerMetrics(workerName);
        setMetrics(m);
      } catch {}

      Alert.alert(
        '🚀 Deployed!',
        `Your server is live at:\n${result.url}`,
        [{text: 'OK'}]
      );
    } catch (e: any) {
      await supabase.from('logs').insert({
        server_id: serverId,
        level: 'error',
        message: `Deployment failed: ${e.message}`,
      });
      Alert.alert('Deployment Failed', e.message);
    } finally {
      setDeploying(false);
    }
  };

  const handleStopServer = async () => {
    if (!server) return;
    Alert.alert('Stop Server', 'This will delete the Cloudflare Worker. Continue?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Stop',
        style: 'destructive',
        onPress: async () => {
          try {
            const workerName = sanitizeWorkerName(`mc-${server.name}`);
            await deleteWorker(workerName);
            await updateServerStatus(serverId, 'stopped');
            await supabase.from('logs').insert({
              server_id: serverId,
              level: 'warn',
              message: 'Server stopped — Worker removed from Cloudflare',
            });
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (!server) return null;

  const tabs = ['deployments', 'logs', 'env'] as const;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.serverName}>{server.name}</Text>
          <Badge status={server.status} />
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn,
            server.status === 'running' ? styles.stopBtn : styles.startBtn]}
          onPress={server.status === 'running' ? handleStopServer
            : () => toggleServer(server.id, server.status)}>
          <Ionicons
            name={server.status === 'running' ? 'stop' : 'play'}
            size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Worker URL Banner */}
      {(workerUrl || server.status === 'running') && (
        <View style={styles.urlBanner}>
          <Ionicons name="globe" size={14} color={Colors.success} />
          <Text style={styles.urlText} numberOfLines={1}>
            {workerUrl || `mc-${sanitizeWorkerName(server.name)}.workers.dev`}
          </Text>
        </View>
      )}

      {/* Metrics row */}
      {metrics && (
        <View style={styles.metricsRow}>
          {[
            {label: 'Requests', value: metrics.requests.toLocaleString()},
            {label: 'Errors', value: metrics.errors},
            {label: 'CPU ms', value: metrics.cpuTime},
          ].map(m => (
            <Card key={m.label} style={styles.metricCard}>
              <Text style={styles.metricVal}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </Card>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'deployments' && (
          <View>
            <Card style={styles.deployForm}>
              <Text style={styles.sectionTitle}>Deploy to Cloudflare</Text>

              {/* Repo picker from GitHub */}
              {repos.length > 0 && (
                <View style={styles.repoList}>
                  <Text style={styles.label}>Your Repos</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {repos.slice(0, 10).map(r => (
                      <TouchableOpacity
                        key={r.id}
                        style={[styles.repoChip,
                          repo === r.full_name && styles.repoChipActive]}
                        onPress={() => setRepo(r.full_name)}>
                        <Text style={[styles.repoChipText,
                          repo === r.full_name && {color: '#fff'}]}>
                          {r.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Input
                label="GitHub Repo"
                placeholder="username/repo-name"
                value={repo}
                onChangeText={setRepo}
              />
              <Input
                label="Branch"
                placeholder="main"
                value={branch}
                onChangeText={setBranch}
              />
              <Button
                title={deploying ? 'Deploying to Cloudflare...' : '🚀 Deploy Now'}
                onPress={handleDeploy}
                loading={deploying}
              />
            </Card>

            <Text style={styles.sectionTitle}>Deployment History</Text>
            {deployments.map(dep => (
              <Card key={dep.id} style={styles.depCard}>
                <View style={styles.depRow}>
                  <View style={styles.depInfo}>
                    <Text style={styles.depRepo}>{dep.github_repo}</Text>
                    <Text style={styles.depMeta}>
                      {dep.branch}
                      {dep.commit_hash ? ` · ${dep.commit_hash}` : ''}
                      {' · '}{new Date(dep.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Badge status={dep.status} />
                </View>
              </Card>
            ))}
            {deployments.length === 0 && (
              <Text style={styles.empty}>No deployments yet</Text>
            )}
          </View>
        )}

        {activeTab === 'logs' && (
          <View>
            <View style={styles.logHeader}>
              <Text style={styles.sectionTitle}>Live Logs</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>
            {logs.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={[styles.logLevel, {color: getLogColor(log.level)}]}>
                  [{(log.level || 'INFO').toUpperCase()}]
                </Text>
                <Text style={styles.logMsg}>{log.message}</Text>
              </View>
            ))}
            {logs.length === 0 && <Text style={styles.empty}>No logs yet</Text>}
          </View>
        )}

        {activeTab === 'env' && (
          <View>
            <Text style={styles.sectionTitle}>Environment Variables</Text>
            <Card style={styles.envCard}>
              <Ionicons name="lock-closed" size={24} color={Colors.textMuted} />
              <Text style={styles.envText}>
                Variables are encrypted and injected into your Cloudflare Worker at deploy time
              </Text>
              <Button title="Manage Variables" onPress={() => {}} variant="secondary" style={styles.envBtn} />
            </Card>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const getLogColor = (level: string) => {
  switch (level) {
    case 'error': return Colors.error;
    case 'warn': return Colors.warning;
    default: return Colors.success;
  }
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  header: {flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    paddingTop: Spacing.xl, gap: Spacing.sm},
  backBtn: {padding: 4},
  headerInfo: {flex: 1, gap: 4},
  serverName: {color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700'},
  toggleBtn: {width: 36, height: 36, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center'},
  startBtn: {backgroundColor: Colors.success},
  stopBtn: {backgroundColor: Colors.error},
  urlBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: '#052e16', padding: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: '#134e2a',
  },
  urlText: {color: Colors.success, fontSize: FontSize.xs,
    fontFamily: 'monospace', flex: 1},
  metricsRow: {flexDirection: 'row', paddingHorizontal: Spacing.lg,
    gap: Spacing.sm, marginBottom: Spacing.sm},
  metricCard: {flex: 1, alignItems: 'center', padding: Spacing.sm},
  metricVal: {color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '800'},
  metricLabel: {color: Colors.textMuted, fontSize: 10},
  tabs: {flexDirection: 'row', paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border},
  tab: {paddingVertical: 12, paddingHorizontal: Spacing.md, marginBottom: -1},
  activeTab: {borderBottomWidth: 2, borderBottomColor: Colors.accent},
  tabText: {color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '500'},
  activeTabText: {color: Colors.accent},
  content: {flex: 1, padding: Spacing.lg},
  sectionTitle: {fontSize: FontSize.md, fontWeight: '700',
    color: Colors.textPrimary, marginBottom: Spacing.sm},
  label: {color: Colors.textSecondary, fontSize: FontSize.sm,
    fontWeight: '500', marginBottom: Spacing.xs},
  deployForm: {marginBottom: Spacing.lg},
  repoList: {marginBottom: Spacing.sm},
  repoChip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.xl,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    marginRight: Spacing.xs},
  repoChipActive: {backgroundColor: Colors.accent, borderColor: Colors.accent},
  repoChipText: {color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '500'},
  depCard: {marginBottom: Spacing.sm},
  depRow: {flexDirection: 'row', alignItems: 'center'},
  depInfo: {flex: 1},
  depRepo: {color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600'},
  depMeta: {color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2},
  logHeader: {flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.sm},
  liveIndicator: {flexDirection: 'row', alignItems: 'center', gap: 4},
  liveDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success},
  liveText: {color: Colors.success, fontSize: FontSize.xs, fontWeight: '600'},
  logRow: {flexDirection: 'row', gap: Spacing.sm, paddingVertical: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.border},
  logLevel: {fontSize: FontSize.xs, fontWeight: '700', fontFamily: 'monospace'},
  logMsg: {flex: 1, color: Colors.textSecondary, fontSize: FontSize.xs,
    fontFamily: 'monospace'},
  empty: {color: Colors.textMuted, textAlign: 'center',
    marginTop: Spacing.lg, fontSize: FontSize.sm},
  envCard: {alignItems: 'center', gap: Spacing.md, padding: Spacing.xl},
  envText: {color: Colors.textMuted, textAlign: 'center',
    fontSize: FontSize.sm, lineHeight: 20},
  envBtn: {width: '100%'},
  bottomPad: {height: 80},
});
