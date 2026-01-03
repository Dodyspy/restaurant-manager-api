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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow POST for JSON body (mobile clients)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Add API key check for security
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'casanova-reserve-app-key') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { id, restaurantCode: rawRestaurantCode } = req.body ?? {};
    const restaurantCode = resolveRestaurantCode(rawRestaurantCode);
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Missing required parameter: id' });
    }
    
    const reservationRef = adminDb
      .collection('restaurants')
      .doc(restaurantCode)
      .collection('reservations')
      .doc(id);
    const doc = await reservationRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    await reservationRef.delete();
    
    res.status(200).json({ 
      success: true, 
      message: 'Reservation deleted successfully',
      reservationId: id,
      restaurantCode
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
