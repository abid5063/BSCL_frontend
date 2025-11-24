import { Text, View, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const router = useRouter();
  const { language, changeLanguage, isLoading: languageLoading } = useLanguage();
  const { t, i18n } = useTranslation();

  // Update i18n language when language changes
  useEffect(() => {
    if (!languageLoading) {
      try {
        i18n.changeLanguage(language);
      } catch (error) {
        console.log('Error changing language:', error);
      }
    }
  }, [language, i18n, languageLoading]);

  const handleFarmerAuth = () => {
    router.push('/farmerAuth');
  };

  const handleVetAuth = () => {
    router.push('/vetAuth');
  };

  const handleCustomerAuth = () => {
    router.push('/customerAuth');
  };

  const handleSignIn = () => {
    // Navigate to sign in screen - adjust route if your project uses a different path
    router.push('/signin');
  };

  const handleSignUp = () => {
    // Navigate to sign up screen - adjust route if your project uses a different path
    router.push('/signup');
  };

  const handleLearnMore = () => {
    try {
      // You can replace this URL with your actual tutorial video link
      Linking.openURL('https://www.youtube.com/watch?v=your-tutorial-video-id');
    } catch (error) {
      console.log('Error opening tutorial link:', error);
    }
  };

  // Show loading state while language is initializing
  if (languageLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0d3750" />
        <LinearGradient
          colors={['#0d3852', '#143f63', '#0f2f45']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}> 
      <StatusBar barStyle="light-content" backgroundColor="#0d3750" />

      {/* Space Gradient Background (lightened) */}
      <LinearGradient
        colors={['#0d3852', '#143f63', '#0f2f45']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* BN Language Button (only) */}
      <TouchableOpacity
        style={styles.langButton}
        onPress={() => {
          try {
            changeLanguage('bn');
          } catch (error) {
            console.log('Error changing language:', error);
          }
        }}
      >
        <Text style={styles.langButtonText}>BN</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section - Blended with background */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {/* Subtle radial spotlight behind the logo */}
            <View style={styles.spotlight} />
            <Image 
              source={require('../assets/images/bscl_logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
            {/* Logo blend overlay - space theme */}
            <LinearGradient
              colors={['rgba(140, 180, 255, 0.08)', 'rgba(20, 40, 80, 0.14)', 'transparent']}
              style={styles.logoBlendOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {/* Additional blend layers for seamless integration */}
            <View style={styles.logoBlendLayer1} />
            <View style={styles.logoBlendLayer2} />
          </View>
        </View>

        {/* Tagline removed as requested */}

        {/* Middle hero line */}
        <View style={styles.dividerWrap}>
          <Text style={styles.heroLine}>To infinity and Beyond</Text>
        </View>

        {/* Sign In / Sign Up buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleSignIn}
            testID="signin-button"
            activeOpacity={0.8}
          >
              <Ionicons name="log-in" size={24} color='#cfe8ff' />
            <Text style={styles.buttonText}>{t('signIn') || 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleSignUp}
            testID="signup-button"
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={24} color='#cfe8ff' />
            <Text style={styles.buttonText}>{t('signUp') || 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom gradient overlay - lighten vignette so logo shows more */}
      <LinearGradient
        colors={['transparent','rgba(6, 12, 30, 0.9)',  'rgba(8, 14, 30, 0.95)']}
        style={styles.grassOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  logoSection: {
    flex: 1, //don't change
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 36, // move logo a little lower
    marginTop: 10,
  },
  logoContainer: {
    width: '120%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    opacity: 1,
    borderRadius: 8,
  },
  logoBlendOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    borderRadius: 10,
  },
  logoBlendLayer1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    backgroundColor: 'rgba(12, 22, 50, 0.04)',
    borderRadius: 15,
  },
  logoBlendLayer2: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    backgroundColor: 'rgba(40, 24, 70, 0.015)',
    borderRadius: 10,
  },
  spotlight: {
    position: 'absolute',
    width: '88%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(206,232,255,0.08)',
    alignSelf: 'center',
    top: '8%',
    zIndex: 0,
    shadowColor: '#cfeeff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 6,
    transform: [{ scaleX: 1.5 }, { scaleY: 0.85 }],
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0d3b16',
    textAlign: 'center',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#2d5a2d',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  taglineSection: {
    alignItems: 'center',
    paddingVertical: 2,
    gap:6,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f7112ff',
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subTagline: {
    fontSize: 20,
    color: '#2f7112ff',
    textAlign: 'center',
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingBottom: 6,
    marginBottom: 2,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  learnMoreText: {
    fontSize: 16,
    color:'#ffffffff',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  dividerWrap: {
    alignItems: 'center',
    marginVertical: 18,
    zIndex: 1,
  },
  divider: {
    width: '80%',
    height: 8,
    borderRadius: 8,
    shadowColor: '#9fe6ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  heroLine: {
    color: '#e8f7ff',
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(110,200,255,0.18)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    letterSpacing: 0.6,
    paddingHorizontal: 8,
  },
  buttonSection: {
    paddingBottom: 40,
    gap: 28,
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
    gap: 15,
    minHeight: 50,
    borderWidth: 1.8,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  grassBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 0,
  },
  grassImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  grassOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  langButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  langButtonText: {
    color: '#dbe9ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.85)',
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});