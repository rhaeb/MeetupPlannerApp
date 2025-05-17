import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter, Link } from 'expo-router';  // Import Link from expo-router
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      // Sign up the user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      const user = signupData.user;
      if (!user) {
        setError('Signup failed. Please try again.');
        return;
      }

      // Insert a profile for the new user
      const { error: profileError } = await supabase
        .from('profile') // Ensure the table name is correct
        .insert([{ user_id: user.id, username }]);

      if (profileError) {
        setError(`Profile creation failed: ${profileError.message}`);
        return;
      }

      // Redirect to the main page after successful signup
      router.push('/tabs/index');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Tara</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <FontAwesome name="user" size={18} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#000"
            value={username}
            onChangeText={setUsername}
          />
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="email" size={20} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#000"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="lock" size={20} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#000"
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="lock-outline" size={20} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            placeholderTextColor="#000"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignup}>
        <Text style={styles.signInText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.signUpText}>
        Already have an account?{' '}
        <Link href="/login">
          <Text style={styles.signUpLink}>Sign In</Text>
        </Link>
      </Text>
    </View>
    </TouchableWithoutFeedback>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b2dfdb',
    alignItems: 'center',
    justifyContent: 'center'
    ,
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2e7d32',
    fontFamily: 'serif',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: '#004d40',
    marginBottom: 10,
  },
  signUpText: {
    color: '#004d40',
  },
  signUpLink: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});
