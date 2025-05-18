import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter, Link } from 'expo-router';  // Import Link from expo-router
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
      router.replace('/tabs/index');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#a5d6a7', '#57C785', '#AFED53']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Top Content */}
              <View style={styles.topContentContainer}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                {/* <Text style={styles.title}>Tara</Text> */}

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
              </View>

              {/* White bottom container for buttons */}
              <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.signInButton} onPress={handleSignup}>
                  <Text style={styles.signInText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>
                    Already have an account?{' '}
                  </Text>
                  <Link href="/login" asChild>
                    <Text style={styles.signUpLink}>Sign In</Text>
                  </Link>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
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
  topContentContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
    paddingBottom: 0,
    marginBottom: -70
  },
  bottomContainer: {
    flex: 0.4,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});
