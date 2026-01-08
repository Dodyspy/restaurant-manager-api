// Email service using Firebase Cloud Functions with Nodemailer
const CLOUD_FUNCTION_URL = 'https://us-central1-casanova-dissy-reservations.cloudfunctions.net';

interface WelcomeEmailParams {
  restaurantName: string;
  ownerEmail: string;
  restaurantCode: string;
  backofficeUrl: string;
  widgetUrl: string;
  trialEndDate: string;
  verificationLink?: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  try {
    // Call Firebase Cloud Function to send welcome email
    const response = await fetch(`${CLOUD_FUNCTION_URL}/sendWelcomeEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        restaurantName: params.restaurantName,
        ownerEmail: params.ownerEmail,
        restaurantCode: params.restaurantCode,
        backofficeUrl: params.backofficeUrl,
        widgetUrl: params.widgetUrl,
        trialEndDate: params.trialEndDate,
        verificationLink: params.verificationLink,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloud Function error:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Welcome email sent successfully to:', params.ownerEmail);
    return result.success || true;

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
}

export async function sendReservationConfirmation(
  customerEmail: string,
  customerName: string,
  reservationDetails: any
): Promise<boolean> {
  try {
    // This uses the existing Cloud Function
    const response = await fetch(`${CLOUD_FUNCTION_URL}/sendConfirmationEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerEmail,
        customerName,
        ...reservationDetails,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloud Function error:', errorText);
      return false;
    }

    console.log('✅ Confirmation email sent successfully to:', customerEmail);
    return true;

  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    return false;
  }
}
