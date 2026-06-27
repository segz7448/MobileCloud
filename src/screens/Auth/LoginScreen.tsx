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
import {Ionicons} from '@expo/vector-icons';
import {useAuthStore} from '../../store/authStore';
import {Button} from '../../components/ui/Button';
import {Input} from '../../components/ui/Input';
import {Colors, FontSize, Spacing} from '../../utils/theme';

export default function LoginScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore(s => s.signIn);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
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
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Ionicons name="cloud" size={36} color={Colors.accent} />
          </View>
          <Text style={styles.title}>MobileCloud</Text>
          <Text style={styles.subtitle}>Your pocket cloud platform</Text>
        </View>

        <View style={styles.form}>
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
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.btn}
          />
          <Button
            title="Create an account"
            onPress={() => navigation.navigate('Register')}
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
  content: {flexGrow: 1, padding: Spacing.lg, justifyContent: 'center'},
  hero: {alignItems: 'center', marginBottom: Spacing.xl},
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#0c1a3d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {color: Colors.textMuted, fontSize: FontSize.md, marginTop: 4},
  form: {gap: 0},
  btn: {marginBottom: Spacing.sm, marginTop: Spacing.sm},
});
