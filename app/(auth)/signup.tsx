import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useRouter, Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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

      // Insert a profile for the new user (optional, if not handled in ProfileContext)
      await supabase
        .from('profile')
        .insert([{ user_id: user.id, username }]);

      // Immediately log the user in after signup
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }
      
      // Wait for the profile row to exist before redirecting
    let profileExists = false;
    let attempts = 0;
    while (!profileExists && attempts < 10) {
      const { data: profileData } = await supabase
        .from('profile')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profileData) {
        profileExists = true;
      } else {
        await new Promise(res => setTimeout(res, 500)); // wait 0.5s
        attempts++;
      }
    }
      // Redirect to home/tabs after successful login
      router.replace('/tabs');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    }finally {
    setLoading(false); // Stop loading
  }
  };

  return (
    <LinearGradient
      colors={['#a5d6a7', '#57C785', '#AFED53']}
      style={{ flex: 1 }}
    >
       {loading ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginBottom: 16, color: '#2e7d32', fontSize: 18 }}>Creating your account...</Text>
        <ActivityIndicator size="large" color="#66bb6a" />
      </View>
    ) : (
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
    )}
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
    paddingBottom: 0
  },
  bottomContainer: {
    flex: 0.2,
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
