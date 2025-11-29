const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  console.log('Checkout function called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONSリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // POSTリクエストのみ許可
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Processing checkout request');
    
    // リクエストボディの解析
    let items;
    try {
      const body = JSON.parse(event.body);
      items = body.items;
      console.log('Received items:', items);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No items in cart' })
      };
    }

    // Stripe Checkoutセッションを作成
    console.log('Creating Stripe checkout session...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: 'https://www.kanjitales.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.kanjitales.com/cart',
      shipping_address_collection: {
        allowed_countries: ['CH', 'FR', 'DE', 'JP', 'US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'chf',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
    });

    console.log('Checkout session created:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        id: session.id,
        message: 'Checkout session created successfully'
      })
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: 'Failed to create checkout session',
        type: error.type
      })
    };
  }
};
