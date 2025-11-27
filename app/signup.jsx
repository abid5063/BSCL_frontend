import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (e) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(e).toLowerCase());
  };

  const validatePassword = (pw) => {
    if (!pw || pw.length < 6) return false;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill all required fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), designation: designation.trim(), email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201 || res.status === 200) {
        setSuccess('Account created. Redirecting to Sign In...');
        setTimeout(() => router.replace('/signin'), 900);
        return;
      }

      if (res.status === 400) {
        const details = data.details ? Object.values(data.details).join('\n') : data.error || 'Validation failed';
        setError(details);
        return;
      }

      if (res.status === 409) {
        setError(data.error || 'User already exists');
        return;
      }

      setError(data.error || `Server error (${res.status})`);
    } catch (e) {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b2340" />
      <LinearGradient colors={["#051428", "#0b3450"]} style={styles.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>

          {success ? <Text style={styles.successText}>{success}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.field}>
            <Ionicons name="person" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="rgba(200,220,255,0.5)"
              value={name}
              onChangeText={setName}
              style={styles.input}
              testID="nameInput"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="person-circle" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="rgba(200,220,255,0.5)"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="briefcase" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Designation"
              placeholderTextColor="rgba(200,220,255,0.5)"
              value={designation}
              onChangeText={setDesignation}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="mail" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="rgba(200,220,255,0.5)"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="key" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="rgba(200,220,255,0.5)"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="key" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="rgba(200,220,255,0.5)"
              value={confirm}
              onChangeText={setConfirm}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.primaryText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.lightText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signin')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  card: { width: '90%', padding: 20, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1 },
  title: { color: '#e8f7ff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 10 },
  input: { color: '#fff', flex: 1, fontSize: 16 },
  primaryButton: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  lightText: { color: 'rgba(235,245,255,0.7)' },
  linkText: { color: '#cfe8ff', fontWeight: '700' },
  errorText: { color: '#ffccd1', marginBottom: 8, textAlign: 'center' },
  successText: { color: '#b6ffd6', marginBottom: 8, textAlign: 'center', fontWeight: '700' },
});
