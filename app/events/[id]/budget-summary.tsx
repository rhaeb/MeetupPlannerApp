import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { expenseController } from '../../../controllers/expenseController';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function BudgetSummary() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const eventId = typeof id === 'string' ? id : id?.[0];

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', description: '', price: '' });

  useEffect(() => {
    fetchExpenses();
    fetchAttendeeCount();
  }, [eventId]);

  const fetchExpenses = async () => {
    const { data, error } = await expenseController.getEventExpenses(eventId);
    if (!error && data) {
      setExpenses(data.expenses);
      setTotal(data.total);
    }
  };

  const fetchAttendeeCount = async () => {
    const { count } = await supabase
      .from('attend')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    setAttendeeCount(count ?? 1);
  };

  const handleAddExpense = async () => {
    const { title, description, price } = newExpense;
    const user = await supabase.auth.getUser();

    if (!title || !price || !user.data.user) return;

    const { error } = await expenseController.createExpense({
      title,
      description,
      price: parseFloat(price),
      event_id: eventId,
    });

    if (!error) {
      fetchExpenses();
      setNewExpense({ title: '', description: '', price: '' });
      setModalVisible(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#007AFF" />
          <Text style={styles.backText}>Back to Event</Text>
        </TouchableOpacity>
        
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Budget Split</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Budget Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator-outline" size={16} color="#666" />
          <Text style={styles.sectionTitle}>Budget Summary</Text>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total expenses:</Text>
            <Text style={styles.summaryAmount}>₱ {total.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Per person ({attendeeCount} people):</Text>
            <Text style={styles.summaryAmount}>₱ {(total / attendeeCount).toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Expenses */}
      <View style={styles.section}>
        <Text style={styles.expensesTitle}>Expenses</Text>
        
        {expenses.map((item) => (
          <View key={item.exp_id} style={styles.expenseItem}>
            <View style={styles.expenseContent}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.expenseDescription}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.expensePrice}>₱ {item.price.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Add Expense Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              placeholder="Expense title"
              style={styles.input}
              value={newExpense.title}
              onChangeText={(val) => setNewExpense((prev) => ({ ...prev, title: val }))}
            />
            
            <TextInput
              placeholder="Description (optional)"
              style={styles.input}
              value={newExpense.description}
              onChangeText={(val) => setNewExpense((prev) => ({ ...prev, description: val }))}
            />
            
            <TextInput
              placeholder="Amount (₱)"
              style={styles.input}
              keyboardType="numeric"
              value={newExpense.price}
              onChangeText={(val) => setNewExpense((prev) => ({ ...prev, price: val }))}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
              <Text style={styles.saveButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  
  addButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  sectionTitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: '500',
    marginLeft: 6,
  },
  
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  summaryLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: '400',
  },
  
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  
  expensesTitle: {
    fontSize: 18,
    color: 'black',
    fontWeight:'500',
    marginBottom: 12,
  },
  
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  expenseTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  
  expenseDescription: {
    fontSize: 13,
    color: '#666',
  },
  
  expensePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});