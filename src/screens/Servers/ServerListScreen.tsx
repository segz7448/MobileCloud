import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {useServerStore} from '../../store/serverStore';
import {ServerCard} from '../../components/ServerCard';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import {Colors, FontSize, Spacing} from '../../utils/theme';

const REGIONS = ['us-east', 'us-west', 'eu-west', 'ap-south', 'global'];

export default function ServersScreen({navigation}: any) {
  const user = useAuthStore(s => s.user);
  const {servers, fetchServers, addServer, removeServer, toggleServer, loading} =
    useServerStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('global');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchServers(user.id);
  }, [user]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Server name is required');
      return;
    }
    setCreating(true);
    try {
      await addServer(user!.id, name.trim(), region);
      setShowModal(false);
      setName('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string, serverName: string) => {
    Alert.alert('Delete Server', `Delete "${serverName}"? This cannot be undone.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeServer(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Servers</Text>
        <Button title="+ New" onPress={() => setShowModal(true)} style={styles.newBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => user && fetchServers(user.id)}
            tintColor={Colors.accent}
          />
        }>
        {servers.map(server => (
          <ServerCard
            key={server.id}
            server={server}
            onPress={() =>
              navigation.navigate('ServerDetail', {serverId: server.id})
            }
            onToggle={() => toggleServer(server.id, server.status)}
            onDelete={() => handleDelete(server.id, server.name)}
          />
        ))}
        {servers.length === 0 && !loading && (
          <Text style={styles.empty}>No servers yet. Create your first one!</Text>
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Create Server Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Server</Text>
            <Input
              label="Server Name"
              placeholder="my-api-server"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.label}>Region</Text>
            <View style={styles.regions}>
              {REGIONS.map(r => (
                <Button
                  key={r}
                  title={r}
                  onPress={() => setRegion(r)}
                  variant={region === r ? 'primary' : 'secondary'}
                  style={styles.regionBtn}
                />
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowModal(false)}
                variant="secondary"
                style={styles.modalBtn}
              />
              <Button
                title="Create"
                onPress={handleCreate}
                loading={creating}
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
  newBtn: {paddingVertical: 8, paddingHorizontal: 16, minHeight: 36},
  list: {padding: Spacing.lg, paddingTop: 0},
  empty: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: FontSize.md,
  },
  bottomPad: {height: 80},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
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
  regions: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.lg},
  regionBtn: {paddingVertical: 6, paddingHorizontal: 12, minHeight: 36},
  modalActions: {flexDirection: 'row', gap: Spacing.sm},
  modalBtn: {flex: 1},
});
