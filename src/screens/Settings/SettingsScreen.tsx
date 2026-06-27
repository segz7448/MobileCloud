import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/authStore';
import {Card} from '../../components/ui/Card';
import {Button} from '../../components/ui/Button';
import {Colors, FontSize, Spacing, Radius} from '../../utils/theme';

interface SettingRow {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const user = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: signOut},
    ]);
  };

  const sections: {title: string; rows: SettingRow[]}[] = [
    {
      title: 'Account',
      rows: [
        {
          icon: 'person-outline',
          label: 'Profile',
          value: user?.user_metadata?.full_name || 'Not set',
          onPress: () => {},
        },
        {
          icon: 'mail-outline',
          label: 'Email',
          value: user?.email || '',
          onPress: () => {},
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Platform',
      rows: [
        {
          icon: 'globe-outline',
          label: 'Domain Settings',
          onPress: () => {},
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => {},
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Security',
          onPress: () => {},
        },
        {
          icon: 'people-outline',
          label: 'Team',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Billing',
      rows: [
        {
          icon: 'card-outline',
          label: 'Subscription',
          value: 'Free Plan',
          onPress: () => {},
        },
        {
          icon: 'receipt-outline',
          label: 'Invoices',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={32} color={Colors.accent} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user?.user_metadata?.full_name || 'User'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </Card>

      {sections.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={styles.sectionCard}>
            {section.rows.map((row, idx) => (
              <TouchableOpacity
                key={row.label}
                style={[
                  styles.row,
                  idx < section.rows.length - 1 && styles.rowBorder,
                ]}
                onPress={row.onPress}
                activeOpacity={0.7}>
                <View style={[styles.rowIcon, row.danger && styles.dangerIcon]}>
                  <Ionicons
                    name={row.icon as any}
                    size={18}
                    color={row.danger ? Colors.error : Colors.accent}
                  />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, row.danger && {color: Colors.error}]}>
                    {row.label}
                  </Text>
                  {row.value && (
                    <Text style={styles.rowValue} numberOfLines={1}>
                      {row.value}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      <View style={styles.signOutSection}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
        />
      </View>

      <Text style={styles.version}>MobileCloud v1.0.0</Text>
      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.bg},
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  profileInfo: {flex: 1},
  profileName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  profileEmail: {color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2},
  section: {marginBottom: Spacing.lg},
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {marginHorizontal: Spacing.lg, padding: 0, overflow: 'hidden'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {backgroundColor: '#2d0a0a'},
  rowContent: {flex: 1},
  rowLabel: {color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '500'},
  rowValue: {color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2},
  signOutSection: {paddingHorizontal: Spacing.lg, marginBottom: Spacing.md},
  version: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  bottomPad: {height: 40},
});
