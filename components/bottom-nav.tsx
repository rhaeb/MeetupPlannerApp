import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, Link } from "expo-router";
import { Home, Calendar, Users, MessageSquare, User } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  badgeHref?: string;
};

export function BottomNav() {
  const pathname = usePathname();
  const unreadNotifications = 3;

  const navItems: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Friends", href: "/friends", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      badge: unreadNotifications,
      badgeHref: "/notifications",
    },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link key={item.name} href={item.href as any} asChild>
            <Pressable style={styles.tab}>
              <Icon size={20} color={isActive ? "#16a34a" : "#6b7280"} />
              <Text style={[styles.label, { color: isActive ? "#16a34a" : "#6b7280" }]}>
                {item.name}
              </Text>

              {item.badge && item.badge > 0 && (
                <Link href={(item.badgeHref || item.href) as any} asChild>
                  <Pressable style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </Pressable>
                </Link>
              )}
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: 20,
    backgroundColor: "#16a34a",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});