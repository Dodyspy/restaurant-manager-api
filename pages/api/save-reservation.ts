import type { NextApiRequest, NextApiResponse } from 'next';
import { applyRateLimit } from '../../lib/rateLimit';
import { validateEmail, validatePhone, validateName, validateNotes, sanitizeInput } from '../../lib/validation';

const DEFAULT_RESTAURANT_CODE = process.env.DEFAULT_RESTAURANT_CODE ?? 'CASANOVA2024';
const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_BASE_URL ?? 'https://us-central1-casanova-dissy-reservations.cloudfunctions.net';
const RESERVATION_API_KEY = process.env.RESERVATION_API_KEY ?? 'casanova-reserve-app-key';

function resolveRestaurantCode(value?: string) {
  if (!value) {
    return DEFAULT_RESTAURANT_CODE;
  }

  const trimmed = value.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : DEFAULT_RESTAURANT_CODE;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Apply rate limiting: 5 reservations per 15 minutes per IP
  try {
    await applyRateLimit(req, res, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    });
  } catch (error) {
    return; // Rate limit response already sent
  }

  try {
    const payload = req.body ?? {};
    
    // Validate required fields
    const nameValidation = validateName(payload.name);
    if (!nameValidation.isValid) {
      return res.status(400).json({ success: false, message: nameValidation.error });
    }
    
    const emailValidation = validateEmail(payload.email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: emailValidation.error });
    }
    
    const phoneValidation = validatePhone(payload.phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ success: false, message: phoneValidation.error });
    }
    
    const notesValidation = validateNotes(payload.notes);
    if (!notesValidation.isValid) {
      return res.status(400).json({ success: false, message: notesValidation.error });
    }
    
    // Sanitize inputs to prevent XSS
    const sanitizedPayload = {
      ...payload,
      name: sanitizeInput(payload.name),
      email: sanitizeInput(payload.email),
      notes: payload.notes ? sanitizeInput(payload.notes) : '',
    };
    const restaurantCode = resolveRestaurantCode(payload.restaurantCode);

    const response = await fetch(`${FUNCTIONS_BASE_URL}/saveReservation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': RESERVATION_API_KEY
      },
      body: JSON.stringify({
        ...sanitizedPayload,
        restaurantCode
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Error proxying reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message ?? 'unknown'
    });
  }
}
