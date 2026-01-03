import type { NextApiRequest, NextApiResponse } from 'next';

const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL || 'https://us-central1-casanova-dissy-reservations.cloudfunctions.net';
const RESERVATION_API_KEY = process.env.RESERVATION_API_KEY || 'casanova-reserve-app-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const payload = {
    restaurantCode: req.body?.restaurantCode || process.env.NEXT_PUBLIC_RESTAURANT_CODE || 'CASANOVA2024',
    ...req.body,
  };

  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/checkAvailability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RESERVATION_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Error calling checkAvailability function:', error);
    res.status(500).json({ success: false, message: 'Failed to check availability', error: error?.message });
  }
}
