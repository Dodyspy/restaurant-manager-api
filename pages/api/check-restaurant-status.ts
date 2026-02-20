import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Restaurant code is required' });
      return;
    }

    // Query restaurant by code field
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      res.status(404).json({ 
        active: false, 
        error: 'Restaurant not found' 
      });
      return;
    }

    const restaurant = querySnapshot.docs[0].data();
    const subscriptionStatus = restaurant.subscriptionStatus || 'inactive';
    const reservationsThisMonth = restaurant.reservationsThisMonth || 0;
    const reservationLimit = restaurant.reservationLimit || 200;
    const paymentStatus = restaurant.paymentStatus || 'pending';
    const temporarilyClosed = restaurant.temporarilyClosed || false;
    const closedReason = restaurant.closedReason || '';
    const isFull = restaurant.isFull || false;
    const fullReason = restaurant.fullReason || '';
    const closedDates = restaurant.closedDates || [];
    const openingHours = restaurant.openingHours || {};

    // Check if restaurant is active
    // NOTE: reservationLimit check disabled for now
    const isActive = 
      subscriptionStatus === 'active' && 
      paymentStatus !== 'overdue' &&
      // reservationsThisMonth < reservationLimit &&
      !temporarilyClosed &&
      !isFull;

    // Return status with details
    res.status(200).json({
      active: isActive,
      subscriptionStatus,
      paymentStatus,
      reservationsThisMonth,
      reservationLimit,
      limitReached: reservationsThisMonth >= reservationLimit,
      temporarilyClosed,
      closedReason,
      isFull,
      fullReason,
      closedDates,
      openingHours,
      message: !isActive ? getInactiveReason(subscriptionStatus, paymentStatus, reservationsThisMonth, reservationLimit, temporarilyClosed, closedReason, isFull, fullReason) : null
    });

  } catch (error) {
    console.error('Error checking restaurant status:', error);
    res.status(500).json({ 
      active: true, // Default to active on error to not block legitimate users
      error: 'Internal server error' 
    });
  }
}

function getInactiveReason(
  subscriptionStatus: string, 
  paymentStatus: string, 
  reservationsThisMonth: number, 
  reservationLimit: number,
  temporarilyClosed: boolean,
  closedReason: string,
  isFull: boolean,
  fullReason: string
): string {
  if (temporarilyClosed) {
    return closedReason || 'Restaurant temporairement fermé';
  }
  if (isFull) {
    return fullReason || 'Restaurant complet';
  }
  if (subscriptionStatus !== 'active') {
    return 'Subscription is not active';
  }
  if (paymentStatus === 'overdue') {
    return 'Payment is overdue';
  }
  // if (reservationsThisMonth >= reservationLimit) {
  //   return 'Monthly reservation limit reached';
  // }
  return 'Service temporarily unavailable';
}
