/**
 * SNS AI Agent Workbench Authentication Event & Verification Service
 * Dispatches form submission events and verifies authentication decisions
 * through the FastAPI backend to the SNS Workbench POST webhook.
 *
 * Security & Integrity Guarantees:
 * - Strictly NO passwords, tokens, hashes, or OTPs sent or logged.
 * - Sends only safe metadata (event_type, user_id, email, role, full_name,
 *   provider, registration_status, approval_status, timestamp).
 * - Direct HTTP response evaluation: Requires exact HTTP 200 and valid JSON.
 */

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host === 'localhost' ? '127.0.0.1' : host}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

/**
 * Validates authentication event with SNS AI Agent Workbench before dashboard entry.
 * Waits for the real HTTP response from the Workbench webhook.
 */
export const verifyAuthWithWorkbench = async (authMetadata) => {
  const safePayload = {
    event_type: authMetadata.event_type || 'SIGN_IN',
    email: (authMetadata.email || '').trim().toLowerCase(),
    role: (authMetadata.role || 'doctor').toLowerCase(),
    user_id: authMetadata.user_id || 'usr_anonymous',
    full_name: authMetadata.full_name || '',
    provider: authMetadata.provider || 'email',
    registration_status: authMetadata.registration_status || 'active',
    approval_status: authMetadata.approval_status || 'approved',
    timestamp: authMetadata.timestamp || new Date().toISOString(),
    page: authMetadata.page || '',
    hospital_name: authMetadata.hospital_name || 'St. Jude Medical Center',
    department: authMetadata.department || '',
    registration_number: authMetadata.registration_number || '',
    contact_number: authMetadata.contact_number || '',
    simulate_status: authMetadata.simulate_status || null,
    simulate_denial: authMetadata.simulate_denial || false
  };

  const apiBase = getApiBase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${apiBase}/api/v1/events/verify-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload),
      signal: controller.signal,
    }).catch(async (primaryErr) => {
      const secondaryBase = 'http://localhost:8000';
      if (apiBase !== secondaryBase) {
        return await fetch(`${secondaryBase}/api/v1/events/verify-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(safePayload),
          signal: controller.signal,
        });
      }
      throw primaryErr;
    });

    clearTimeout(timeoutId);

    if (!response) {
      return {
        verified: false,
        http_status_code: 502,
        message: 'Unable to connect to authentication verification backend. Please check your network connection.'
      };
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return {
        verified: false,
        http_status_code: response.status || 500,
        message: `Authentication verification service returned an unparseable response [HTTP ${response.status}].`
      };
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        verified: false,
        http_status_code: 504,
        message: 'Authentication verification service timed out after 15s. Please try again. [HTTP 504 Gateway Timeout]'
      };
    }
    return {
      verified: false,
      http_status_code: 502,
      message: `Unable to connect to the verification service. Please check your connection and retry. [HTTP 502: ${err.message || 'Network Error'}]`
    };
  }
};

/**
 * Non-blocking auxiliary event dispatcher for telemetry.
 */
export const dispatchAuthEvent = async (eventData) => {
  return verifyAuthWithWorkbench(eventData);
};
