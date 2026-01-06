import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get first 5 restaurants
    const restaurantsRef = collection(db, 'restaurants');
    const q = query(restaurantsRef, limit(5));
    const querySnapshot = await getDocs(q);

    const restaurants = querySnapshot.docs.map(doc => ({
      id: doc.id,
      code: doc.data().code || 'NO CODE',
      name: doc.data().name || 'NO NAME',
      hasReservations: doc.data().reservationsThisMonth !== undefined
    }));

    res.status(200).json({
      count: querySnapshot.size,
      restaurants,
      message: 'First 5 restaurants in /restaurants collection'
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
