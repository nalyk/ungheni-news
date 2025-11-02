/**
 * Cloudflare Function: Newsletter Signup for Prut Brief
 *
 * Integrates with Buttondown email service API
 * Handles email validation, subscription, and error responses
 *
 * Environment Variables Required:
 *   BUTTONDOWN_API_KEY - Your Buttondown API token
 *
 * Setup Instructions:
 *   1. Create Buttondown account at https://buttondown.email
 *   2. Get API key from Settings → Programming
 *   3. Add to Cloudflare Pages:
 *      - Settings → Environment variables
 *      - Add BUTTONDOWN_API_KEY with your token
 *
 * API Endpoint: POST /api/newsletter
 * Body: { "email": "user@example.com" }
 */

// CORS headers for local development and production
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Buttondown API endpoint
const BUTTONDOWN_API_URL = 'https://api.buttondown.email/v1/subscribers';

/**
 * Handle OPTIONS request for CORS preflight
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Validate email address format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email este obligatoriu' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Adresă de email invalidă' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Adresa de email este prea lungă' };
  }

  return { valid: true, email: trimmedEmail };
}

/**
 * Subscribe email to Buttondown newsletter
 */
async function subscribeToButtondown(email, apiKey) {
  try {
    const response = await fetch(BUTTONDOWN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        // Optional: Add metadata
        metadata: {
          source: 'triunghi.md',
          newsletter: 'prut-brief',
          subscribed_at: new Date().toISOString(),
        },
        // Optional: Add tags
        tags: ['prut-brief', 'ungheni'],
      }),
    });

    const data = await response.json();

    // Handle different response codes
    if (response.status === 201) {
      // Successfully created
      return { success: true, message: 'Abonare realizată cu succes!' };
    } else if (response.status === 200) {
      // Already exists - Buttondown returns 200 for existing subscribers
      return { success: true, message: 'Ești deja abonat la Prut Brief!' };
    } else if (response.status === 400) {
      // Invalid request
      return {
        success: false,
        error: data.error || 'Date invalide. Verificați adresa de email.'
      };
    } else if (response.status === 401) {
      // API key invalid
      console.error('Buttondown API authentication failed');
      return {
        success: false,
        error: 'Eroare de configurare. Contactați administratorul.'
      };
    } else {
      // Other errors
      console.error('Buttondown API error:', response.status, data);
      return {
        success: false,
        error: 'Eroare temporară. Încercați din nou mai târziu.'
      };
    }
  } catch (error) {
    console.error('Network error subscribing to Buttondown:', error);
    return {
      success: false,
      error: 'Eroare de conexiune. Verificați conexiunea la internet.'
    };
  }
}

/**
 * Main handler function
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
          },
        }
      );
    }

    // Check for API key
    const apiKey = env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      console.error('BUTTONDOWN_API_KEY environment variable not set');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Serviciul de newsletter nu este configurat. Contactați administratorul.'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
          },
        }
      );
    }

    // Subscribe to Buttondown
    const result = await subscribeToButtondown(validation.email, apiKey);

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );

  } catch (error) {
    console.error('Error processing newsletter signup:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Eroare la procesarea cererii. Încercați din nou.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function onRequestOptions() {
  return handleOptions();
}
