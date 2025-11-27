import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignIn() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!username.trim() || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200) {
        const { id, username } = data;
        console.log('Login successful, user data:', { id, username });
        setSuccess('Signed in — loading profile...');
        
        // Store user ID and username
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem('username', username);
        
        // Store basic login data as fallback profile since /api/user/ has CORS issues
        const loginBasedProfile = {
          name: username, // We only have username from login response
          username: username,
          designation: 'User', // Default since not available in login response
          email: `${username}@domain.com`, // Placeholder since not available
          corsIssue: true
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(loginBasedProfile));
        console.log('Stored login-based profile data:', loginBasedProfile);
        
        // Try to fetch detailed profile (will likely fail due to CORS)
        try {
          console.log(`Attempting to fetch detailed profile for user ID: ${id}`);
          const profileRes = await fetch(`http://localhost:8080/api/user/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const profileData = await profileRes.json().catch(() => ({}));
          
          console.log('Detailed profile API response:', profileData);
          
          if (profileRes.status === 200) {
            // Override with real data if successful
            await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
            console.log('Real profile data stored successfully');
          } else {
            console.log('Detailed profile fetch failed with status:', profileRes.status);
          }
        } catch (e) {
          console.log('Expected: Detailed profile fetch blocked by CORS:', e.message);
          // We already have fallback data stored above
        }
        
        setTimeout(() => router.replace('/profile'), 800);
        return;
      }

      if (res.status === 400) {
        const details = data.details ? Object.values(data.details).join('\n') : data.error || 'Invalid request';
        setError(details);
        return;
      }

      if (res.status === 401 || res.status === 403) {
        setError(data.error || 'Invalid username or password');
        return;
      }

      setError(data.error || `Server error (${res.status})`);
    } catch (e) {
      setError('Network error — check connection and try again');
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
          <Text style={styles.title}>Sign In</Text>

          {success ? <Text style={styles.successText}>{success}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.field}>
            <Ionicons name="person" size={18} color="#cfe8ff" style={{ marginRight: 8 }} />
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

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.primaryText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/profile')} activeOpacity={0.85}>
            <Text style={styles.secondaryText}>View Demo Profile</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.lightText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
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
  secondaryButton: { marginTop: 10, borderWidth: 1, borderColor: 'rgba(207,232,255,0.12)', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryText: { color: '#cfe8ff', fontWeight: '700' },
});
