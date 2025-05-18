import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Add this import

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    // Navigate to reset password page, passing email as param
    router.push({ pathname: '/(auth)/reset-password-confirm', params: { email } });
  };

  return (
    <LinearGradient
      colors={['#a5d6a7', '#57C785', '#AFED53']}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        {/* <Text style={styles.title}>Tara</Text> */}
        <Text style={styles.subtitle}>Forgot Password</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#000"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleContinue}
        >
          <Text style={styles.resetText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 30,
    color: '#004d40',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fcf9',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  resetButton: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    color: '#004d40',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  successText: {
    color: '#004d40',
    marginBottom: 10,
    fontWeight: 'bold',
    backgroundColor: '#a5d6a7',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    width: '100%',
  },
});