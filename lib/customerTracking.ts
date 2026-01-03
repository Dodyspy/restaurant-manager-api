import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

export interface Customer {
  id: string;
  primary_email: string;
  primary_phone: string;
  all_emails: string[];
  all_phones: string[];
  total_reservations: number;
  no_show_count: number;
  last_no_show_date?: string;
  first_reservation_date: string;
  created_at: any;
  updated_at: any;
}

export interface ReservationWithCustomer {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_notes: string;
  status: 'confirmed' | 'cancelled' | 'no_show';
  created_at: any;
  customer_id?: string;
  customer_history?: {
    total_reservations: number;
    no_show_count: number;
    has_no_shows: boolean;
  };
}

// Restaurant code for multi-tenant support
const RESTAURANT_CODE = 'CASANOVA2024';

/**
 * Find existing customer by email OR phone number in restaurant-specific collection
 */
export async function findExistingCustomer(email: string, phone: string): Promise<Customer | null> {
  try {
    console.log('🔍 SIMPLE: Finding existing customer for:', { email: email.toLowerCase(), phone });
    const customersRef = collection(db, 'restaurants', RESTAURANT_CODE, 'customers');
    
    // Simple query by primary email only (avoid array-contains for now)
    console.log('🔍 SIMPLE: Searching by primary_email:', email.toLowerCase());
    const emailQuery = query(
      customersRef,
      where('primary_email', '==', email.toLowerCase())
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      const doc = emailSnapshot.docs[0];
      const customer = { id: doc.id, ...doc.data() } as Customer;
      console.log('✅ SIMPLE: Found customer by email:', customer.id, customer);
      return customer;
    }
    console.log('❌ SIMPLE: No customer found by email');
    
    // Simple query by primary phone only (avoid array-contains for now)
    if (phone) {
      console.log('🔍 SIMPLE: Searching by primary_phone:', phone);
      const phoneQuery = query(
        customersRef,
        where('primary_phone', '==', phone)
      );
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (!phoneSnapshot.empty) {
        const doc = phoneSnapshot.docs[0];
        const customer = { id: doc.id, ...doc.data() } as Customer;
        console.log('✅ SIMPLE: Found customer by phone:', customer.id, customer);
        return customer;
      }
      console.log('❌ SIMPLE: No customer found by phone');
    }
    
    console.log('❌ SIMPLE: No existing customer found');
    return null;
  } catch (error) {
    console.error('SIMPLE: Error finding existing customer:', error);
    return null;
  }
}

/**
 * Create or update customer record - SAFE VERSION
 */
export async function createOrUpdateCustomer(
  email: string, 
  phone: string, 
  name: string,
  reservationDate: string
): Promise<string> {
  try {
    console.log('Safe customer tracking: checking for existing customer...');
    const existingCustomer = await findExistingCustomer(email, phone);
    
    if (existingCustomer) {
      console.log('Found existing customer:', existingCustomer.id);
      // SIMPLE: Update existing customer with minimal changes
      const customerRef = doc(db, 'restaurants', RESTAURANT_CODE, 'customers', existingCustomer.id);
      
      await updateDoc(customerRef, {
        total_reservations: existingCustomer.total_reservations + 1,
        updated_at: new Date().toISOString()
      });
      
      console.log('Updated existing customer successfully');
      return existingCustomer.id;
    } else {
      console.log('Creating new customer...');
      // Create new customer
      const customerRef = doc(collection(db, 'restaurants', RESTAURANT_CODE, 'customers'));
      const customerId = customerRef.id;
      
      // SIMPLE: Minimal customer data to avoid validation errors
      const customerData = {
        primary_email: email.toLowerCase(),
        primary_phone: phone || '',
        primary_name: name || '',
        total_reservations: 1,
        no_show_count: 0,
        created_at: new Date().toISOString()
      };
      
      await setDoc(customerRef, customerData);
      console.log('Created new customer successfully:', customerId);
      
      return customerId;
    }
  } catch (error) {
    console.error('Error in customer tracking (non-critical):', error);
    // Return empty string if customer tracking fails - don't break reservations
    return '';
  }
}

/**
 * Get customer history for display
 */
export async function getCustomerHistory(email: string, phone: string): Promise<{
  total_reservations: number;
  no_show_count: number;
  has_no_shows: boolean;
} | undefined> {
  try {
    console.log('📊 Getting customer history for:', { email, phone });
    const customer = await findExistingCustomer(email, phone);
    
    if (customer) {
      const history = {
        total_reservations: customer.total_reservations,
        no_show_count: customer.no_show_count,
        has_no_shows: customer.no_show_count > 0
      };
      console.log('✅ Customer history found:', history);
      return history;
    }
    
    console.log('❌ No customer history found (new customer)');
    return undefined;
  } catch (error) {
    console.error('Error getting customer history:', error);
    return undefined;
  }
}

/**
 * Mark a reservation as no-show and update customer record
 */
export async function markReservationAsNoShow(reservationId: string, customerId: string): Promise<void> {
  try {
    // Update reservation status
    const reservationRef = doc(db, 'restaurants', RESTAURANT_CODE, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: 'no_show'
    });
    
    // Update customer no-show count
    if (customerId) {
      const customerRef = doc(db, 'restaurants', RESTAURANT_CODE, 'customers', customerId);
      const customerDoc = await getDoc(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data() as Customer;
        await updateDoc(customerRef, {
          no_show_count: customerData.no_show_count + 1,
          last_no_show_date: new Date().toISOString().split('T')[0],
          updated_at: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error marking reservation as no-show:', error);
    throw error;
  }
}

/**
 * Get all reservations with customer history
 */
export async function getReservationsWithCustomerHistory(): Promise<ReservationWithCustomer[]> {
  try {
    const reservationsRef = collection(db, 'restaurants', RESTAURANT_CODE, 'reservations');
    const q = query(reservationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const reservationsWithHistory: ReservationWithCustomer[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const reservation = { id: docSnapshot.id, ...docSnapshot.data() } as ReservationWithCustomer;
      
      // Get customer history
      const customerHistory = await getCustomerHistory(reservation.customer_email, reservation.customer_phone || '');
      
      reservationsWithHistory.push({
        ...reservation,
        customer_history: customerHistory
      });
    }
    
    return reservationsWithHistory;
  } catch (error) {
    console.error('Error getting reservations with customer history:', error);
    return [];
  }
}
