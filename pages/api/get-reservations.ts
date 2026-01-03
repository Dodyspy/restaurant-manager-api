import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../lib/firebase-admin';

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



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Add API key check for security
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'casanova-reserve-app-key') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const restaurantCode = resolveRestaurantCode(req.query.restaurantCode);
    const collectionRef = adminDb
      .collection('restaurants')
      .doc(restaurantCode)
      .collection('reservations');

    const snapshot = await collectionRef.orderBy('createdAt', 'desc').get();
    
    let reservations: Reservation[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: data.guests,
        notes: data.notes,
        timestamp: data.timestamp,
        status: data.status,
        createdAt: data.createdAt,
        notificationStatus: data.notificationStatus
      });
    });
    
    // If no reservations found, return empty array (no sample data needed)
    console.log(`Found ${reservations.length} reservations for ${restaurantCode}`);

    // Return the reservations
    res.status(200).json({ reservations, restaurantCode });
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
