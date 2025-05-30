import React, { useEffect ,useRef  } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 3000, 
        useNativeDriver: true,
      }).start(() => {
        router.replace('/login'); 
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <LinearGradient
      colors={['#a5d6a7', '#57C785', '#AFED53']}
      style={styles.container}
    >
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
     <Image
        source={require('../assets/intro.png')}
        style={styles.iconic}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  logo: {
    width: 230,
    height: 230,
    bottom:140,
    resizeMode: 'contain',
  },

   iconic: {
    position: 'absolute',
    width: 410,
    height: 400,
    bottom: -90,
    left: '50%',
    transform: [{ translateX: -200 }],
    opacity: 0.6,
  },
});
