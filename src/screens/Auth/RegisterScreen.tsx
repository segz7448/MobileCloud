import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useAuthStore} from '../../store/authStore';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import {Colors, FontSize, Spacing} from '../../utils/theme';

export default function RegisterScreen({navigation}: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore(s => s.signUp);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      Alert.alert('Success', 'Check your email to confirm your account');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start hosting in seconds</Text>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Zenas Ayansipe"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />
          <Button
            title="Already have an account? Sign in"
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: Colors.bg},
  container: {flex: 1},
  content: {flexGrow: 1, padding: Spacing.lg, paddingTop: 60},
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {color: Colors.textMuted, fontSize: FontSize.md, marginBottom: Spacing.xl},
  form: {},
  btn: {marginTop: Spacing.sm, marginBottom: Spacing.sm},
});
