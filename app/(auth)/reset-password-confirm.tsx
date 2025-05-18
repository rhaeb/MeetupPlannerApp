import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { userController } from '../../controllers/userController';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResetPasswordConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    // Re-authenticate
    const { error: loginError } = await userController.login(email, oldPassword);
    if (loginError) {
      setLoading(false);
      setError('Current password is incorrect');
      return;
    }

    // Update password
    const { error: updateError } = await userController.updatePassword(newPassword);
    setLoading(false);
    if (updateError) {
      setError(updateError.message || 'Failed to update password');
      return;
    }

    Alert.alert(
      'Success',
      'Your password has been updated successfully'
    );
  };

  return (
    <LinearGradient
      colors={['#a5d6a7', '#57C785', '#AFED53']}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        {/* <Text style={styles.title}>Tara</Text> */}
        <Text style={styles.subtitle}>Reset Password</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#000"
              value={email}
              editable={false}
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#000"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#000"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock-outline" size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#000"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <Text style={styles.resetText}>
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
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
    backgroundColor: '#ffffffa0',
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
});