import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'

import { colors } from "@/constants/colors"
import Button from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import Badge from "@/components/Badge"
import Avatar from "@/components/Avatar"

// Define your navigation types
type RootStackParamList = {
  EventDetails: { id: string };
  Poll: { id: string };
  Budget: { id: string };
  Chat: { id: string };
  // Add other screens as needed
};

type EventDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;
type EventDetailsScreenRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

const EventDetailsScreen = () => {
  const navigation = useNavigation<EventDetailsScreenNavigationProp>()
  const route = useRoute<EventDetailsScreenRouteProp>()
  const { id } = route.params

  // Sample event data
  const event = {
    id,
    title: "La Union Beach Trip",
    date: "May 15-17, 2025",
    time: "6:00 AM Departure",
    location: "San Juan, La Union",
    description:
      "Weekend getaway to La Union! We'll surf, chill at Flotsam & Jetsam, and enjoy the sunset at Urbiztondo Beach. Don't forget to bring sunscreen and good vibes!",
    image: "https://via.placeholder.com/400x200",
    status: "confirmed",
    attendees: [
      {
        id: "1",
        name: "Maria Santos",
        avatar: "https://via.placeholder.com/40",
        status: "going",
      },
      {
        id: "2",
        name: "Juan Dela Cruz",
        avatar: "https://via.placeholder.com/40",
        status: "going",
      },
      {
        id: "3",
        name: "Ana Reyes",
        avatar: "https://via.placeholder.com/40",
        status: "going",
      },
      {
        id: "4",
        name: "Carlo Aquino",
        avatar: "https://via.placeholder.com/40",
        status: "maybe",
      },
      {
        id: "5",
        name: "Bianca Gonzalez",
        avatar: "https://via.placeholder.com/40",
        status: "invited",
      },
      {
        id: "6",
        name: "Paolo Pascual",
        avatar: "https://via.placeholder.com/40",
        status: "invited",
      },
    ],
    expenses: [
      {
        id: "1",
        description: "Accommodation (2 nights)",
        amount: 12000,
        paidBy: "Maria Santos",
      },
      {
        id: "2",
        description: "Gas and toll fees",
        amount: 3500,
        paidBy: "Juan Dela Cruz",
      },
      {
        id: "3",
        description: "Food and drinks",
        amount: 5000,
        paidBy: "Ana Reyes",
      },
    ],
  }

  // Calculate total expenses and per person
  const totalExpenses = event.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const perPerson = Math.round(totalExpenses / event.attendees.filter((a) => a.status === "going").length)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color={colors.gray[700]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-social-outline" size={20} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Badge>{event.status === "confirmed" ? "Confirmed" : "Planning"}</Badge>
          </View>
        </View>

        <Card style={styles.detailsCard}>
          <CardContent>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.green[600]} />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.green[600]} />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.green[600]} />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardContent>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </CardContent>
        </Card>

        <View style={styles.attendeesHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="people-outline" size={16} color={colors.green[600]} />
            <Text style={styles.sectionTitle}>Attendees ({event.attendees.length})</Text>
          </View>
          <Button title="Invite More" variant="outline" size="sm" onPress={() => {}} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attendeesScroll}>
          {event.attendees.map((attendee) => (
            <View key={attendee.id} style={styles.attendee}>
              <Avatar source={{ uri: attendee.avatar }} name={attendee.name} size="lg" />
              <Text style={styles.attendeeName}>{attendee.name.split(" ")[0]}</Text>
              <Badge
                variant="outline"
                color={
                  attendee.status === "going"
                    ? colors.green[500]
                    : attendee.status === "maybe"
                      ? colors.amber[500]
                      : colors.gray[500]
                }
                size="sm"
              >
                {attendee.status}
              </Badge>
            </View>
          ))}
        </ScrollView>

        <View style={styles.featuresGrid}>
          <TouchableOpacity 
            style={styles.featureItem} 
            onPress={() => navigation.navigate("Poll", { id: event.id })}
          >
            <Ionicons name="stats-chart" size={24} color={colors.green[600]} />
            <Text style={styles.featureText}>Polls</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.featureItem} 
            onPress={() => navigation.navigate("Budget", { id: event.id })}
          >
            <Ionicons name="wallet" size={24} color={colors.green[600]} />
            <Text style={styles.featureText}>Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.featureItem} 
            onPress={() => navigation.navigate("Chat", { id: event.id })}
          >
            <Ionicons name="chatbubble" size={24} color={colors.green[600]} />
            <Text style={styles.featureText}>Chat</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.card}>
          <CardContent>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="wallet-outline" size={16} color={colors.green[600]} />
              <Text style={styles.sectionTitle}>Budget Summary</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Total expenses:</Text>
              <Text style={styles.budgetValue}>₱{totalExpenses.toLocaleString()}</Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Per person:</Text>
              <Text style={styles.budgetValue}>₱{perPerson.toLocaleString()}</Text>
            </View>
            <Button
              title="View Full Budget"
              variant="outline"
              onPress={() => navigation.navigate("Budget", { id: event.id })}
              style={styles.viewBudgetButton}
              fullWidth
            />
          </CardContent>
        </Card>

        <Button title="Confirm Attendance" onPress={() => {}} style={styles.confirmButton} fullWidth />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
  },
  imageContainer: {
    position: "relative",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    flex: 1,
  },
  detailsCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 8,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  attendeesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  attendeesScroll: {
    marginBottom: 24,
  },
  attendee: {
    alignItems: "center",
    marginRight: 16,
  },
  attendeeName: {
    fontSize: 12,
    color: colors.gray[700],
    marginTop: 4,
    marginBottom: 2,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  featureItem: {
    width: "31%",
    backgroundColor: colors.green[100],
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: colors.gray[700],
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  viewBudgetButton: {
    marginTop: 8,
  },
  confirmButton: {
    marginBottom: 32,
  },
})

export default EventDetailsScreen