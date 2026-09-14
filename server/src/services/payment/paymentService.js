/**
 * Mock Payment Service simulating Telebirr, Chapa, and Card payments.
 */

export const processMockPayment = async (amount, method) => {
  return new Promise((resolve, reject) => {
    // Simulate API network latency
    setTimeout(() => {
      // 95% success rate for payment processing
      const isSuccess = Math.random() < 0.95;

      if (isSuccess) {
        // Generate a random transaction ID prefixed with payment method
        const transactionId = `${method.toUpperCase()}_TX_${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}`;

        resolve({
          success: true,
          transactionId,
          message: 'Payment completed successfully via mock gateway',
        });
      } else {
        reject(new Error('Transaction declined by issuing bank/service provider'));
      }
    }, 1500);
  });
};

/**
 * Initialize payment with Chapa payment gateway.
 */
export const initializeChapaPayment = async (booking, amount, txRef) => {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  const apiUrl = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';

  // If mock mode is on, bypass Chapa network calls
  if (!secretKey || secretKey === 'mock' || secretKey.startsWith('mock_')) {
    console.log(`[Chapa Mock] Initializing payment for booking: ${booking._id}, tx_ref: ${txRef}`);
    return {
      status: 'success',
      message: 'Hosted link generated (mock)',
      data: {
        checkout_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/booking?chapa_verify=true&bookingId=${booking._id}&tx_ref=${txRef}`
      }
    };
  }

  const names = booking.fullName ? booking.fullName.split(' ') : ['Guest', 'User'];
  const firstName = names[0] || 'Guest';
  const lastName = names.slice(1).join(' ') || 'User';

  // Clean phone number format for Chapa (ensure valid 10-digit Ethiopian number)
  let sanitizedPhone = booking.phone ? booking.phone.replace(/[^0-9]/g, '') : '0911000000';
  if (sanitizedPhone.startsWith('251')) {
    sanitizedPhone = '0' + sanitizedPhone.slice(3);
  }
  if (!sanitizedPhone.startsWith('0')) {
    sanitizedPhone = '0' + sanitizedPhone;
  }
  if (sanitizedPhone.length < 10) {
    sanitizedPhone = sanitizedPhone.padEnd(10, '0');
  } else if (sanitizedPhone.length > 10) {
    sanitizedPhone = sanitizedPhone.slice(0, 10);
  }

  const body = {
    amount: Number(amount).toFixed(2),
    currency: 'ETB',
    email: booking.email || 'guest@example.com',
    first_name: firstName,
    last_name: lastName,
    phone_number: sanitizedPhone,
    tx_ref: txRef,
    callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/chapa-webhook`,
    return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/booking?chapa_verify=true&bookingId=${booking._id}&tx_ref=${txRef}`,
    customization: {
      title: 'Tsedeke Grand',       // Chapa: max 16 chars
      description: 'Room reservation'
    }
  };

  try {
    const response = await fetch(`${apiUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      console.error('Chapa API Rejected Initialization:', {
        body,
        responseStatus: response.status,
        responseData: data
      });
      const errorMsg = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
      throw new Error(errorMsg || 'Chapa initialization failed');
    }

    return data;
  } catch (error) {
    console.error('Chapa Initialization Error Details:', error);
    throw new Error(error.message || 'Failed to connect to Chapa payment gateway');
  }
};

/**
 * Verify payment with Chapa payment gateway.
 */
export const verifyChapaPayment = async (txRef) => {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  const apiUrl = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';

  // If mock mode is on, bypass Chapa network calls
  if (!secretKey || secretKey === 'mock' || secretKey.startsWith('mock_')) {
    console.log(`[Chapa Mock] Verifying payment for tx_ref: ${txRef}`);
    return {
      status: 'success',
      message: 'Payment verified successfully (mock)',
      data: {
        status: 'success',
        tx_ref: txRef
      }
    };
  }

  try {
    const response = await fetch(`${apiUrl}/transaction/verify/${txRef}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      console.error('Chapa API Rejected Verification:', {
        txRef,
        responseStatus: response.status,
        responseData: data
      });
      const errorMsg = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
      throw new Error(errorMsg || 'Chapa verification failed');
    }

    return data;
  } catch (error) {
    console.error('Chapa Verification Error Details:', error);
    throw new Error(error.message || 'Failed to verify transaction with Chapa');
  }
};
