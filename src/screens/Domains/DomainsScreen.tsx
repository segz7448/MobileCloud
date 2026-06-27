import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/authStore';
import {useServerStore} from '../../store/serverStore';
import {getDomains, addDomain} from '../../services/server';
import {Card} from '../../components/ui/Card';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import {Badge} from '../../components/ui/Badge';
import {Colors, FontSize, Spacing} from '../../utils/theme';

export default function DomainsScreen() {
  const user = useAuthStore(s => s.user);
  const servers = useServerStore(s => s.servers);
  const [domains, setDomains] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [domain, setDomain] = useState('');
  const [serverId, setServerId] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) loadDomains();
  }, [user]);

  const loadDomains = async () => {
    try {
      const data = await getDomains(user!.id);
      setDomains(data);
    } catch {}
  };

  const handleAdd = async () => {
    if (!domain.trim() || !serverId) {
      Alert.alert('Error', 'Domain and server are required');
      return;
    }
    setAdding(true);
    try {
      const newDomain = await addDomain(serverId, user!.id, domain.trim());
      setDomains(prev => [newDomain, ...prev]);
      setShowModal(false);
      setDomain('');
      setServerId('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Domains</Text>
        <Button title="+ Add" onPress={() => setShowModal(true)} style={styles.addBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {domains.map(d => (
          <Card key={d.id} style={styles.domainCard}>
            <View style={styles.domainRow}>
              <View style={styles.domainIcon}>
                <Ionicons name="globe" size={20} color={Colors.accent} />
              </View>
              <View style={styles.domainInfo}>
                <Text style={styles.domainName}>{d.domain}</Text>
                <Text style={styles.domainMeta}>
                  {servers.find(s => s.id === d.server_id)?.name || 'Unknown server'}
                </Text>
              </View>
              <Badge status={d.ssl_status === 'active' ? 'active' : 'building'} label={d.ssl_status} />
            </View>
            <View style={styles.sslRow}>
              <Ionicons name="lock-closed" size={12} color={Colors.success} />
              <Text style={styles.sslText}>SSL {d.ssl_status}</Text>
            </View>
          </Card>
        ))}

        {domains.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="globe-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No domains yet</Text>
            <Text style={styles.emptyText}>
              Add a custom domain to your server
            </Text>
          </Card>
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Domain</Text>
            <Input
              label="Domain"
              placeholder="api.example.com"
              value={domain}
              onChangeText={setDomain}
              keyboardType="url"
            />
            <Text style={styles.label}>Attach to Server</Text>
            {servers.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.serverOption, serverId === s.id && styles.serverSelected]}
                onPress={() => setServerId(s.id)}>
                <Ionicons name="server" size={16} color={Colors.accent} />
                <Text style={styles.serverOptionText}>{s.name}</Text>
                {serverId === s.id && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                onPress={() => setShowModal(false)}
                variant="secondary"
                style={styles.modalBtn}
              />
              <Button
                title="Add Domain"
                onPress={handleAdd}
                loading={adding}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {paddingVertical: 8, paddingHorizontal: 16, minHeight: 36},
  list: {padding: Spacing.lg, paddingTop: 0},
  domainCard: {marginBottom: Spacing.sm},
  domainRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  domainIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainInfo: {flex: 1},
  domainName: {color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600'},
  domainMeta: {color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2},
  sslRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sslText: {color: Colors.success, fontSize: FontSize.xs},
  emptyCard: {alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl, marginTop: Spacing.lg},
  emptyTitle: {color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600'},
  emptyText: {color: Colors.textMuted, textAlign: 'center', fontSize: FontSize.sm},
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end'},
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  serverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  serverSelected: {borderColor: Colors.accent, backgroundColor: '#0c1a3d'},
  serverOptionText: {flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm},
  modalBtns: {flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md},
  modalBtn: {flex: 1},
  bottomPad: {height: 80},
});
