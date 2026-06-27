import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/authStore';
import {
  getCredentials,
  saveCredential,
  deleteCredential,
  type Credential,
  type CredentialType,
} from '../../services/credentials';
import {Card} from '../../components/ui/Card';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import {Colors, FontSize, Spacing, Radius} from '../../utils/theme';

const CREDENTIAL_TYPES: {type: CredentialType; label: string; icon: string; fields: string[]}[] = [
  {
    type: 's3',
    label: 'S3 / Object Storage',
    icon: 'cloud-upload',
    fields: ['endpoint', 'access_key', 'secret_key', 'bucket', 'region'],
  },
  {
    type: 'smtp',
    label: 'Email / SMTP',
    icon: 'mail',
    fields: ['host', 'port', 'username', 'password', 'from_email'],
  },
  {
    type: 'ai',
    label: 'AI Provider',
    icon: 'hardware-chip',
    fields: ['provider', 'api_key', 'model'],
  },
  {
    type: 'stripe',
    label: 'Stripe Payments',
    icon: 'card',
    fields: ['publishable_key', 'secret_key', 'webhook_secret'],
  },
  {
    type: 'twilio',
    label: 'Twilio / SMS',
    icon: 'chatbubble',
    fields: ['account_sid', 'auth_token', 'from_number'],
  },
  {
    type: 'custom',
    label: 'Custom API Keys',
    icon: 'key',
    fields: ['key_name', 'key_value'],
  },
];

export default function CredentialsScreen() {
  const user = useAuthStore(s => s.user);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof CREDENTIAL_TYPES[0] | null>(null);
  const [label, setLabel] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadCredentials();
  }, [user]);

  const loadCredentials = async () => {
    try {
      const data = await getCredentials(user!.id);
      setCredentials(data);
    } catch {}
  };

  const handleSave = async () => {
    if (!label.trim() || !selectedType) return;
    setSaving(true);
    try {
      await saveCredential(user!.id, selectedType.type, label, fieldValues);
      await loadCredentials();
      setShowModal(false);
      setLabel('');
      setFieldValues({});
      setSelectedType(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, credLabel: string) => {
    Alert.alert('Remove Credential', `Remove "${credLabel}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteCredential(id);
          setCredentials(prev => prev.filter(c => c.id !== id));
        },
      },
    ]);
  };

  const getTypeConfig = (type: string) =>
    CREDENTIAL_TYPES.find(t => t.type === type);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Credentials</Text>
        <Button
          title="+ Connect"
          onPress={() => setShowModal(true)}
          style={styles.addBtn}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {credentials.map(cred => {
          const config = getTypeConfig(cred.type);
          return (
            <Card key={cred.id} style={styles.credCard}>
              <View style={styles.credRow}>
                <View style={styles.credIcon}>
                  <Ionicons
                    name={(config?.icon || 'key') as any}
                    size={20}
                    color={Colors.accent}
                  />
                </View>
                <View style={styles.credInfo}>
                  <Text style={styles.credLabel}>{cred.label}</Text>
                  <Text style={styles.credType}>{config?.label || cred.type}</Text>
                </View>
                <View style={styles.credActions}>
                  <View style={styles.connectedBadge}>
                    <View style={styles.connectedDot} />
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(cred.id, cred.label)}>
                    <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}

        {credentials.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="link-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No credentials connected</Text>
            <Text style={styles.emptyText}>
              Connect your storage, email, AI, and payment providers
            </Text>
          </Card>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Add Credential Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedType ? selectedType.label : 'Connect Service'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setSelectedType(null);
                  setLabel('');
                  setFieldValues({});
                }}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!selectedType ? (
                <View style={styles.typeGrid}>
                  {CREDENTIAL_TYPES.map(ct => (
                    <TouchableOpacity
                      key={ct.type}
                      style={styles.typeCard}
                      onPress={() => setSelectedType(ct)}>
                      <Ionicons name={ct.icon as any} size={24} color={Colors.accent} />
                      <Text style={styles.typeLabel}>{ct.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View>
                  <Input
                    label="Label (e.g. My S3 Bucket)"
                    placeholder="Friendly name"
                    value={label}
                    onChangeText={setLabel}
                  />
                  {selectedType.fields.map(field => (
                    <Input
                      key={field}
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      placeholder={field}
                      value={fieldValues[field] || ''}
                      onChangeText={val =>
                        setFieldValues(prev => ({...prev, [field]: val}))
                      }
                      secureTextEntry={
                        field.includes('key') ||
                        field.includes('secret') ||
                        field.includes('password') ||
                        field.includes('token')
                      }
                    />
                  ))}
                  <View style={styles.modalBtns}>
                    <Button
                      title="Back"
                      onPress={() => setSelectedType(null)}
                      variant="secondary"
                      style={styles.modalBtn}
                    />
                    <Button
                      title="Save"
                      onPress={handleSave}
                      loading={saving}
                      style={styles.modalBtn}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
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
  credCard: {marginBottom: Spacing.sm},
  credRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm},
  credIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credInfo: {flex: 1},
  credLabel: {color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600'},
  credType: {color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2},
  credActions: {alignItems: 'flex-end', gap: Spacing.xs},
  connectedBadge: {flexDirection: 'row', alignItems: 'center', gap: 4},
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  connectedText: {color: Colors.success, fontSize: FontSize.xs, fontWeight: '600'},
  emptyCard: {alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl, marginTop: Spacing.lg},
  emptyTitle: {color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600'},
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  overlay: {
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
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary},
  typeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  typeCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalBtns: {flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm},
  modalBtn: {flex: 1},
  bottomPad: {height: 80},
});
