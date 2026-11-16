// Sign in / sign up screen (Supabase email + password).
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { Button } from './ui';

export default function AuthScreen({ initialMode = 'signin', onBack }) {
  const c = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isSignUp = mode === 'signup';

  const onSubmit = async () => {
    setError('');
    setInfo('');
    const e = email.trim();
    if (isSignUp && !name.trim()) return setError('Enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(e)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try {
      if (isSignUp) {
        const needsConfirm = await signUp(e, password, name.trim());
        if (needsConfirm) {
          setInfo('Account created. Check your email to confirm it, then sign in.');
          setMode('signin');
        }
      } else {
        await signIn(e, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = [styles.field, { borderColor: c.border, backgroundColor: c.card }];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={styles.back}>
            <MaterialCommunityIcons name="chevron-left" size={30} color={c.text} />
          </Pressable>
        ) : null}

        <MaterialCommunityIcons name="run-fast" size={84} color={c.primary} style={{ alignSelf: 'center' }} />
        <Text style={[styles.title, { color: c.text }]}>FitTrack</Text>
        <Text style={[styles.subtitle, { color: c.text }]}>{isSignUp ? 'Create your account' : 'Welcome back!'}</Text>

        {isSignUp && (
          <View style={field}>
            <MaterialCommunityIcons name="account-outline" size={22} color={c.muted} />
            <TextInput
              value={name}
              onChangeText={setName}
              autoComplete="name"
              placeholder="Full Name"
              placeholderTextColor={c.muted}
              style={[styles.input, { color: c.text }]}
              accessibilityLabel="Full name"
            />
          </View>
        )}

        <View style={field}>
          <MaterialCommunityIcons name="email-outline" size={22} color={c.muted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email Address"
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.text }]}
            accessibilityLabel="Email"
          />
        </View>

        <View style={field}>
          <MaterialCommunityIcons name="lock-outline" size={22} color={c.muted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder="Password"
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.text }]}
            onSubmitEditing={onSubmit}
            accessibilityLabel="Password"
          />
          <Pressable
            onPress={() => setShowPassword((s) => !s)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.muted} />
          </Pressable>
        </View>

        {error ? <Text style={[styles.msg, { color: c.danger }]}>{error}</Text> : null}
        {info ? <Text style={[styles.msg, { color: c.success }]}>{info}</Text> : null}

        <Button
          title={busy ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
          onPress={busy ? undefined : onSubmit}
          style={{ marginTop: 22 }}
        />

        <Pressable
          onPress={() => {
            setMode(isSignUp ? 'signin' : 'signup');
            setError('');
            setInfo('');
          }}
          accessibilityRole="button"
          style={styles.switch}
        >
          <Text style={{ color: c.text }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={{ color: c.primary, fontWeight: '700' }}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60, maxWidth: 440, width: '100%', alignSelf: 'center' },
  back: { position: 'absolute', top: 20, left: 12, padding: 6 },
  title: { fontSize: 40, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', marginTop: 6, letterSpacing: -1 },
  subtitle: { fontSize: 17, textAlign: 'center', marginTop: 4, marginBottom: 28 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 26,
    paddingHorizontal: 18, marginBottom: 14,
  },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, minWidth: 0 },
  msg: { marginTop: 4, fontWeight: '600', textAlign: 'center' },
  switch: { alignItems: 'center', marginTop: 22, padding: 6 },
});
