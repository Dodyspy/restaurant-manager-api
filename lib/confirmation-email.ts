// Direct EmailJS confirmation email function
// This bypasses the failing Vercel API endpoints

export interface ReservationData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

export async function sendConfirmationEmailDirect(reservation: ReservationData): Promise<boolean> {
  try {
    console.log('Sending confirmation email directly via EmailJS for reservation:', reservation.id);
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: 'service_smftwtd',
        template_id: 'template_jqxutxh',
        user_id: 'drn4SQLCpT6XDIU6o',
        template_params: {
          name: reservation.name,
          email: reservation.email,
          phone: reservation.phone || 'Non fourni',
          date: reservation.date,
          time: reservation.time,
          guests: reservation.guests === 1 ? '1 personne' : `${reservation.guests} personnes`,
          notes: reservation.notes || 'Aucune note',
          reservation_id: reservation.id,
          status: 'confirmed',
          restaurant_name: 'Casanova d\'Issy',
          restaurant_address: '12 Rue de la République, 92130 Issy-les-Moulineaux',
          restaurant_phone: '01 41 08 00 00',
          restaurant_email: 'contact@casanovadissy.fr',
          confirmation_message: 'Votre réservation a été confirmée! Nous vous attendons avec plaisir.',
          // Add confirmation-specific details
          confirmation_title: 'Réservation Confirmée',
          confirmation_subtitle: 'Votre table vous attend chez Casanova d\'Issy'
        }
      })
    });
    
    if (response.ok) {
      console.log('Confirmation email sent successfully for reservation:', reservation.id);
      return true;
    } else {
      const errorText = await response.text();
      console.error('EmailJS confirmation error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

// Function to be called from external systems (like iOS app via webhook)
export async function triggerConfirmationEmail(reservationId: string): Promise<boolean> {
  try {
    // Import Firebase client-side (not admin)
    const { db } = await import('./firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    
    // Get reservation data from Firestore
    const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
    
    if (!reservationDoc.exists()) {
      console.error('Reservation not found:', reservationId);
      return false;
    }
    
    const data = reservationDoc.data();
    const reservation: ReservationData = {
      id: reservationId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      time: data.time,
      guests: data.guests,
      notes: data.notes
    };
    
    return await sendConfirmationEmailDirect(reservation);
  } catch (error) {
    console.error('Error triggering confirmation email:', error);
    return false;
  }
}
