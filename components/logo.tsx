import { Image, View, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

type LogoProps = {
  size?: "small" | "default" | "large";
};

export function Logo({ size = "default" }: LogoProps) {
  const sizes = {
    small: {
      width: 100,
      height: 50,
    },
    default: {
      width: 150,
      height: 75,
    },
    large: {
      width: 200,
      height: 100,
    },
  };

  const { width, height } = sizes[size];

  return (
    <Link href="/" asChild>
      <Pressable style={[styles.container, { width, height }]}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});