"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import Button from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import Badge from "@/components/Badge"
import Avatar from "@/components/Avatar"

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: {
    id: string
    name: string
    avatar: string
  }
  category: string
  date: string
}

interface Attendee {
  id: string
  name: string
  avatar: string
  paid: number
  shouldPay: number
  balance: number
}

interface Settlement {
  from: Attendee
  to: Attendee
  amount: number
}

const BudgetScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id: string }
  const [activeTab, setActiveTab] = useState<"expenses" | "settlements">("expenses")

  // Sample expenses data
  const expenses: Expense[] = [
    {
      id: "1",
      description: "Accommodation (2 nights)",
      amount: 12000,
      paidBy: {
        id: "1",
        name: "Maria Santos",
        avatar: "https://via.placeholder.com/40",
      },
      category: "Accommodation",
      date: "May 15, 2025",
    },
    {
      id: "2",
      description: "Gas and toll fees",
      amount: 3500,
      paidBy: {
        id: "2",
        name: "Juan Dela Cruz",
        avatar: "https://via.placeholder.com/40",
      },
      category: "Transportation",
      date: "May 15, 2025",
    },
    {
      id: "3",
      description: "Food and drinks",
      amount: 5000,
      paidBy: {
        id: "3",
        name: "Ana Reyes",
        avatar: "https://via.placeholder.com/40",
      },
      category: "Food",
      date: "May 16, 2025",
    },
    {
      id: "4",
      description: "Surfing lessons",
      amount: 4000,
      paidBy: {
        id: "4",
        name: "Carlo Aquino",
        avatar: "https://via.placeholder.com/40",
      },
      category: "Activities",
      date: "May 16, 2025",
    },
    {
      id: "5",
      description: "Dinner at Makai Bowls",
      amount: 3500,
      paidBy: {
        id: "1",
        name: "Maria Santos",
        avatar: "https://via.placeholder.com/40",
      },
      category: "Food",
      date: "May 17, 2025",
    },
  ]

  // Sample attendees data
  const attendees: Attendee[] = [
    {
      id: "1",
      name: "Maria Santos",
      avatar: "https://via.placeholder.com/40",
      paid: 15500,
      shouldPay: 5600,
      balance: 9900,
    },
    {
      id: "2",
      name: "Juan Dela Cruz",
      avatar: "https://via.placeholder.com/40",
      paid: 3500,
      shouldPay: 5600,
      balance: -2100,
    },
    {
      id: "3",
      name: "Ana Reyes",
      avatar: "https://via.placeholder.com/40",
      paid: 5000,
      shouldPay: 5600,
      balance: -600,
    },
    {
      id: "4",
      name: "Carlo Aquino",
      avatar: "https://via.placeholder.com/40",
      paid: 4000,
      shouldPay: 5600,
      balance: -1600,
    },
    {
      id: "5",
      name: "Bianca Gonzalez",
      avatar: "https://via.placeholder.com/40",
      paid: 0,
      shouldPay: 5600,
      balance: -5600,
    },
  ]

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate per person amount
  const perPerson = Math.round(totalExpenses / attendees.length)

  // Calculate settlements
  const settlements: Settlement[] = []
  const debtors = attendees.filter((a) => a.balance < 0).sort((a, b) => a.balance - b.balance)
  const creditors = attendees.filter((a) => a.balance > 0).sort((a, b) => b.balance - a.balance)

  debtors.forEach((debtor) => {
    let remainingDebt = Math.abs(debtor.balance)
    for (let i = 0; i < creditors.length && remainingDebt > 0; i++) {
      const creditor = creditors[i]
      if (creditor.balance > 0) {
        const amount = Math.min(remainingDebt, creditor.balance)
        if (amount > 0) {
          settlements.push({
            from: debtor,
            to: creditor,
            amount,
          })
          remainingDebt -= amount
          creditor.balance -= amount
        }
      }
    }
  })

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.gray[700]} />
            <Text style={styles.backText}>Back to Event</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Budget Split</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={20} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryCard}>
          <CardContent>
            <View style={styles.summaryHeader}>
              <Ionicons name="wallet-outline" size={16} color={colors.green[600]} />
              <Text style={styles.summaryTitle}>Budget Summary</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total expenses:</Text>
              <Text style={styles.summaryValue}>₱{totalExpenses.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Per person ({attendees.length} people):</Text>
              <Text style={styles.summaryValue}>₱{perPerson.toLocaleString()}</Text>
            </View>
          </CardContent>
        </Card>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "expenses" && styles.activeTab]}
            onPress={() => setActiveTab("expenses")}
          >
            <Text style={[styles.tabText, activeTab === "expenses" && styles.activeTabText]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "settlements" && styles.activeTab]}
            onPress={() => setActiveTab("settlements")}
          >
            <Text style={[styles.tabText, activeTab === "settlements" && styles.activeTabText]}>Settlements</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.contentContainer}>
          {activeTab === "expenses" ? (
            <View style={styles.expensesContainer}>
              {expenses.map((expense) => (
                <Card key={expense.id} style={styles.expenseCard}>
                  <CardContent>
                    <View style={styles.expenseHeader}>
                      <View>
                        <Text style={styles.expenseDescription}>{expense.description}</Text>
                        <View style={styles.expenseMeta}>
                          <Ionicons name="receipt-outline" size={12} color={colors.gray[500]} />
                          <Text style={styles.expenseMetaText}>
                            {expense.category} • {expense.date}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.expenseAmount}>₱{expense.amount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.paidByContainer}>
                      <Text style={styles.paidByLabel}>Paid by:</Text>
                      <Avatar source={{ uri: expense.paidBy.avatar }} name={expense.paidBy.name} size="sm" />
                      <Text style={styles.paidByName}>{expense.paidBy.name}</Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          ) : (
            <View style={styles.settlementsContainer}>
              {settlements.map((settlement, index) => (
                <Card key={index} style={styles.settlementCard}>
                  <CardContent>
                    <View style={styles.settlementParties}>
                      <View style={styles.settlementParty}>
                        <Avatar source={{ uri: settlement.from.avatar }} name={settlement.from.name} size="md" />
                        <Text style={styles.settlementName}>{settlement.from.name.split(" ")[0]}</Text>
                      </View>
                      <View style={styles.settlementArrow}>
                        <Ionicons name="arrow-forward" size={20} color={colors.gray[500]} />
                      </View>
                      <View style={styles.settlementParty}>
                        <Avatar source={{ uri: settlement.to.avatar }} name={settlement.to.name} size="md" />
                        <Text style={styles.settlementName}>{settlement.to.name.split(" ")[0]}</Text>
                      </View>
                    </View>
                    <View style={styles.settlementAmount}>
                      <Text style={styles.settlementLabel}>Payment amount:</Text>
                      <Text style={styles.settlementValue}>₱{settlement.amount.toLocaleString()}</Text>
                    </View>
                    <Button
                      title="Mark as Paid"
                      size="sm"
                      icon={<Ionicons name="card-outline" size={16} color={colors.white} />}
                      onPress={() => {}}
                      style={styles.markPaidButton}
                      fullWidth
                    />
                  </CardContent>
                </Card>
              ))}
            </View>
          )}

          <View style={styles.balancesContainer}>
            <Text style={styles.balancesTitle}>Individual Balances</Text>
            {attendees.map((attendee) => (
              <Card key={attendee.id} style={styles.balanceCard}>
                <CardContent>
                  <View style={styles.balanceContent}>
                    <View style={styles.attendeeInfo}>
                      <Avatar source={{ uri: attendee.avatar }} name={attendee.name} size="md" />
                      <View style={styles.attendeeDetails}>
                        <Text style={styles.attendeeName}>{attendee.name}</Text>
                        <View style={styles.attendeeMeta}>
                          <Text style={styles.attendeeMetaText}>Paid: ₱{attendee.paid.toLocaleString()}</Text>
                          <Text style={styles.attendeeMetaDot}>•</Text>
                          <Text style={styles.attendeeMetaText}>
                            Should pay: ₱{attendee.shouldPay.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Badge
                      color={
                        attendee.balance > 0
                          ? colors.green[500]
                          : attendee.balance < 0
                            ? colors.red[500]
                            : colors.gray[500]
                      }
                    >
                      {attendee.balance > 0
                        ? `+₱${attendee.balance.toLocaleString()}`
                        : attendee.balance < 0
                          ? `-₱${Math.abs(attendee.balance).toLocaleString()}`
                          : "₱0"}
                    </Badge>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </ScrollView>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  activeTabText: {
    fontWeight: "600",
    color: colors.gray[900],
  },
  contentContainer: {
    flex: 1,
  },
  expensesContainer: {
    marginBottom: 24,
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  expenseMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  expenseMetaText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  paidByContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  paidByLabel: {
    fontSize: 12,
    color: colors.gray[700],
    marginRight: 8,
  },
  paidByName: {
    fontSize: 12,
    color: colors.gray[700],
    marginLeft: 4,
  },
  settlementsContainer: {
    marginBottom: 24,
  },
  settlementCard: {
    marginBottom: 12,
  },
  settlementParties: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  settlementParty: {
    alignItems: "center",
  },
  settlementArrow: {
    flex: 1,
    alignItems: "center",
  },
  settlementName: {
    fontSize: 12,
    color: colors.gray[700],
    marginTop: 4,
  },
  settlementAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  settlementLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  settlementValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  markPaidButton: {
    marginTop: 4,
  },
  balancesContainer: {
    marginBottom: 24,
  },
  balancesTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginBottom: 12,
  },
  balanceCard: {
    marginBottom: 12,
  },
  balanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendeeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeeDetails: {
    marginLeft: 12,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  attendeeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  attendeeMetaText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  attendeeMetaDot: {
    fontSize: 12,
    color: colors.gray[500],
    marginHorizontal: 4,
  },
})

export default BudgetScreen
