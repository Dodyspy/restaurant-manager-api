import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { validateEmail, validatePhone, validateName, sanitizeInput } from '@/lib/validation';
import { sendWelcomeEmail } from '@/lib/emailService';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

// Helper to generate unique restaurant code
function generateRestaurantCode(restaurantName: string): string {
  const cleanName = restaurantName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);
  
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomSuffix}`;
}

// Helper to check if code already exists
async function isCodeUnique(code: string): Promise<boolean> {
  const q = query(collection(db, 'restaurants'), where('code', '==', code));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

// Helper to generate unique code
async function generateUniqueCode(restaurantName: string): Promise<string> {
  let attempts = 0;
  let code = generateRestaurantCode(restaurantName);
  
  while (!await isCodeUnique(code) && attempts < 10) {
    code = generateRestaurantCode(restaurantName);
    attempts++;
  }
  
  if (attempts >= 10) {
    throw new Error('Unable to generate unique restaurant code');
  }
  
  return code;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { restaurantName, email, phone, password } = req.body;

    // Validate inputs
    const nameValidation = validateName(restaurantName);
    if (!nameValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: nameValidation.error 
      });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: emailValidation.error 
      });
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: phoneValidation.error 
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Check if email already exists
    const existingRestaurantQuery = query(
      collection(db, 'restaurants'),
      where('ownerEmail', '==', email.toLowerCase())
    );
    const existingSnapshot = await getDocs(existingRestaurantQuery);
    
    if (!existingSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        error: 'Un compte existe déjà avec cet email' 
      });
    }

    // Generate unique restaurant code
    const restaurantCode = await generateUniqueCode(restaurantName);

    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(restaurantName),
      ownerEmail: sanitizeInput(email.toLowerCase()),
      ownerPhone: sanitizeInput(phone),
      code: restaurantCode,
    };

    // Create restaurant document
    const restaurantData: any = {
      ...sanitizedData,
      
      // Subscription info
      subscriptionStatus: 'trial',
      subscriptionTier: 'free',
      trialStartDate: serverTimestamp(),
      trialEndDate: trialEndDate.toISOString(),
      paymentStatus: 'trial',
      
      // Usage limits
      reservationsThisMonth: 0,
      reservationLimit: 200,
      
      // Status flags
      temporarilyClosed: false,
      isFull: false,
      
      // Branding
      primaryColor: '#D4AF37',
      backgroundColor: '#2C2C2C',
      
      // Default settings
      serviceDuration: 90,
      maxGuestsPerReservation: 10,
      closedDates: [],
      
      // Opening hours (default - restaurant can customize)
      openingHours: {
        monday: { isOpen: true, lunch: '12:00-14:30', dinner: '19:00-22:30' },
        tuesday: { isOpen: true, lunch: '12:00-14:30', dinner: '19:00-22:30' },
        wednesday: { isOpen: true, lunch: '12:00-14:30', dinner: '19:00-22:30' },
        thursday: { isOpen: true, lunch: '12:00-14:30', dinner: '19:00-22:30' },
        friday: { isOpen: true, lunch: '12:00-14:30', dinner: '19:00-22:30' },
        saturday: { isOpen: true, lunch: '12:00-14:30', dinner: '19:00-22:30' },
        sunday: { isOpen: false, lunch: '', dinner: '' }
      },
      
      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Create Firebase Auth user account
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email: sanitizedData.ownerEmail,
        password: password,
        displayName: sanitizedData.name,
        emailVerified: false,
      });
      console.log('✅ Firebase Auth user created:', userRecord.uid);
      
      // Generate email verification link
      try {
        const verificationLink = await adminAuth.generateEmailVerificationLink(
          sanitizedData.ownerEmail,
          {
            url: 'https://app.restaurantmanagerpro.fr/login?verified=true',
          }
        );
        console.log('✅ Email verification link generated');
        
        // Store verification link to send in welcome email
        restaurantData.verificationLink = verificationLink;
      } catch (linkError) {
        console.error('⚠️ Failed to generate verification link:', linkError);
        // Continue without verification link
      }
    } catch (authError: any) {
      console.error('❌ Failed to create Firebase Auth user:', authError);
      if (authError.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          error: 'Un compte existe déjà avec cet email'
        });
      }
      throw authError;
    }

    // Add ownerId to restaurant data
    restaurantData.ownerId = userRecord.uid;

    // Save restaurant to Firestore
    const docRef = await addDoc(collection(db, 'restaurants'), restaurantData);
    
    // Create user document in /users collection for backoffice access
    try {
      await adminDb.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: sanitizedData.ownerEmail,
        name: sanitizedData.name,
        role: 'restaurant_owner',
        restaurantId: docRef.id,
        restaurantCode: restaurantCode,
        permissions: ['manage_reservations', 'manage_settings', 'view_analytics'],
        restaurants: [docRef.id],
        createdAt: new Date().toISOString(),
        subscriptionStatus: 'trial',
        trialEndDate: trialEndDate.toISOString(),
      });
      console.log('✅ User document created in /users collection');
    } catch (userDocError) {
      console.error('❌ Failed to create user document:', userDocError);
      // Don't fail the signup if user doc creation fails
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({
        restaurantName: sanitizedData.name,
        ownerEmail: sanitizedData.ownerEmail,
        restaurantCode: restaurantCode,
        backofficeUrl: 'https://app.restaurantmanagerpro.fr',
        widgetUrl: 'https://widget.restaurantmanagerpro.fr/widget.js',
        trialEndDate: trialEndDate.toISOString(),
        verificationLink: restaurantData.verificationLink,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    // Return success
    return res.status(201).json({
      success: true,
      message: 'Restaurant créé avec succès',
      data: {
        restaurantId: docRef.id,
        restaurantCode: restaurantCode,
        restaurantName: sanitizedData.name,
        email: sanitizedData.ownerEmail,
        trialEndDate: trialEndDate.toISOString(),
        backofficeUrl: 'https://app.restaurantmanagerpro.fr',
        widgetUrl: 'https://widget.restaurantmanagerpro.fr/widget.js',
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la création du compte'
    });
  }
}
