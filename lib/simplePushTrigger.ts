// Real-time push notification trigger using Firestore + FCM for killed app
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function triggerPushNotification(reservationData: any): Promise<boolean> {
  try {
    console.log('📱 Writing notification trigger to Firestore for real-time iOS notifications...');
    
    // Get restaurant code from reservation data
    const restaurantCode = reservationData.restaurantCode;
    if (!restaurantCode) {
      console.error('❌ No restaurant code provided in reservation data');
      return false;
    }
    
    // Create notification trigger data for iOS app
    const notificationTrigger = {
      type: 'new_reservation_notification',
      customerName: reservationData.name,
      partySize: reservationData.guests,
      date: reservationData.date,
      time: reservationData.time,
      specialRequests: reservationData.notes || '',
      processed: false,
      createdAt: serverTimestamp()
    };
    
    // Write to restaurant-specific notification triggers collection
    console.log(`📱 Writing to restaurant: ${restaurantCode}`);
    const docRef = await addDoc(collection(db, 'restaurants', restaurantCode, 'notificationTriggers'), notificationTrigger);
    
    console.log('✅ Notification trigger written to Firestore with ID:', docRef.id);
    console.log('🔔 iOS app will receive real-time notification now!');
    console.log('📱 Trigger data:', notificationTrigger);
    
    // NOTE: Push notification is automatically sent by Cloud Function (sendNewReservationNotification)
    // when reservation is created in Firestore. No need to call /api/send-topic-push here.
    // Removed duplicate API call to prevent duplicate notifications.
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Failed to write notification trigger to Firestore:', error);
    console.log('🔄 Falling back to console logging for debugging...');
    
    // Fallback: just log the data
    const fallbackTrigger = {
      type: 'new_reservation_notification',
      customerName: reservationData.name,
      partySize: reservationData.guests,
      date: reservationData.date,
      time: reservationData.time,
      specialRequests: reservationData.notes || '',
      processed: false,
      createdAt: new Date().toISOString()
    };
    
    console.log('📱 Fallback notification trigger:', fallbackTrigger);
    return false;
  }
}
