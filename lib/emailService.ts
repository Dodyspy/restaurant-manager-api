// EmailJS configuration for Restaurant Manager Pro
const EMAILJS_SERVICE_ID = 'service_smftwtd';
const EMAILJS_USER_ID = 'drn4SQLCpT6XDIU6o';

// Template IDs
const WELCOME_TEMPLATE_ID = 'template_welcome'; // We'll create this template
const CONFIRMATION_TEMPLATE_ID = 'template_jqxutxh';

interface WelcomeEmailParams {
  restaurantName: string;
  ownerEmail: string;
  restaurantCode: string;
  backofficeUrl: string;
  widgetUrl: string;
  trialEndDate: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  try {
    const emailParams = {
      service_id: EMAILJS_SERVICE_ID,
      user_id: EMAILJS_USER_ID,
      template_id: WELCOME_TEMPLATE_ID,
      template_params: {
        restaurant_name: params.restaurantName,
        owner_email: params.ownerEmail,
        restaurant_code: params.restaurantCode,
        backoffice_url: params.backofficeUrl,
        widget_url: params.widgetUrl,
        trial_end_date: new Date(params.trialEndDate).toLocaleDateString('fr-FR'),
        to_email: params.ownerEmail,
        to_name: params.restaurantName,
        
        // Widget integration code snippet
        widget_code: `<!-- Bouton de réservation -->
<button onclick="openReservationModal()">
  Réserver une table
</button>

<!-- Configuration du widget -->
<script>
  window.RESTAURANT_CONFIG = {
    code: '${params.restaurantCode}',
    primaryColor: '#D4AF37',
    backgroundColor: '#2C2C2C'
  };
</script>
<script src="${params.widgetUrl}"></script>`,
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS error:', errorText);
      return false;
    }

    console.log('✅ Welcome email sent successfully to:', params.ownerEmail);
    return true;

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
    const emailParams = {
      service_id: EMAILJS_SERVICE_ID,
      user_id: EMAILJS_USER_ID,
      template_id: CONFIRMATION_TEMPLATE_ID,
      template_params: {
        to_email: customerEmail,
        to_name: customerName,
        name: customerName,
        email: customerEmail,
        ...reservationDetails,
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('EmailJS error:', errorText);
      return false;
    }

    console.log('✅ Confirmation email sent successfully to:', customerEmail);
    return true;

  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    return false;
  }
}
