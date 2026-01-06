import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminDb } from '../../lib/firebase-admin';

const DEFAULT_RESTAURANT_CODE = process.env.DEFAULT_RESTAURANT_CODE ?? 'CASANOVA2024';

function resolveRestaurantCode(value?: string | string[]) {
  if (!value) {
    return DEFAULT_RESTAURANT_CODE;
  }

  if (Array.isArray(value)) {
    return value[0]?.toUpperCase() || DEFAULT_RESTAURANT_CODE;
  }

  const trimmed = value.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : DEFAULT_RESTAURANT_CODE;
}

// Define the reservation data structure
type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
  timestamp: string;
  status?: string;
  createdAt?: any;
  notificationStatus?: {
    restaurant: string;
    backup?: string;
    customer: string;
  };
};

// DISABLED: EmailJS confirmation emails - now using Nodemailer via Cloud Function
// This function is kept for reference but should never be called
async function sendConfirmationEmail(reservation: Reservation): Promise<boolean> {
  console.log('⚠️ EmailJS sendConfirmationEmail called but is DISABLED');
  console.log('Customer already received confirmation via Nodemailer Cloud Function');
  return false; // Always return false - email not sent
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Add API key check for security
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'casanova-reserve-app-key') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { id, status, restaurantCode: rawRestaurantCode } = req.body;
    const restaurantCode = resolveRestaurantCode(rawRestaurantCode);
    
    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({ message: 'Missing required fields: id and status' });
    }
    
    // Valid status values
    const validStatuses = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Get the reservation from Firestore
    const adminDb = getAdminDb();
    const reservationDoc = await adminDb
      .collection('restaurants')
      .doc(restaurantCode)
      .collection('reservations')
      .doc(id)
      .get();
    
    if (!reservationDoc.exists) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    const reservationData = reservationDoc.data();
    const currentReservation: Reservation = {
      id: reservationDoc.id,
      name: reservationData?.name || '',
      email: reservationData?.email || '',
      phone: reservationData?.phone || '',
      date: reservationData?.date || '',
      time: reservationData?.time || '',
      guests: reservationData?.guests || '',
      notes: reservationData?.notes || '',
      timestamp: reservationData?.timestamp || '',
      status: reservationData?.status || 'pending',
      createdAt: reservationData?.createdAt,
      notificationStatus: reservationData?.notificationStatus
    };
    
    // Update the reservation status in Firestore
    await adminDb
      .collection('restaurants')
      .doc(restaurantCode)
      .collection('reservations')
      .doc(id)
      .update({
        status: status,
        updatedAt: new Date(),
        timestamp: new Date().toISOString()
      });
    
    // Create updated reservation object for email
    const updatedReservation: Reservation = {
      ...currentReservation,
      status: status,
      timestamp: new Date().toISOString()
    };
    
    // DISABLED: Email confirmation now handled by Cloud Function with Nodemailer
    // The customer already received a confirmation email when they made the reservation
    // No need to send another email when the restaurant confirms it
    let emailSent = false;
    // if (status === 'confirmed' && currentReservation.email) {
    //   emailSent = await sendConfirmationEmail(updatedReservation);
    //   
    //   // Update notification status in Firestore
    //   await adminDb
    //     .collection('restaurants')
    //     .doc(restaurantCode)
    //     .collection('reservations')
    //     .doc(id)
    //     .update({
    //       'notificationStatus.confirmation': emailSent ? 'sent' : 'failed'
    //     });
    // }
    
    console.log(`Reservation ${id} status updated to ${status}${emailSent ? ' (confirmation email sent)' : ''}`);
    
    // Return success
    res.status(200).json({ 
      success: true, 
      message: `Reservation status updated to ${status}`,
      reservation: updatedReservation,
      emailSent: emailSent,
      restaurantCode
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
