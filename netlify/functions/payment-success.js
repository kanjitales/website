const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { session_id } = event.queryStringParameters;
    
    if (!session_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' })
      };
    }

    // セッションを取得して詳細を確認
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'customer']
    });

    // ここで注文処理や在庫管理などを行う
    console.log('Payment successful for session:', session_id);
    console.log('Amount total:', session.amount_total);
    console.log('Customer:', session.customer_details);

    // 成功ページにリダイレクト
    return {
      statusCode: 302,
      headers: {
        'Location': 'https://www.kanjitales.com/success',
        ...headers
      },
      body: ''
    };

  } catch (error) {
    console.error('Error processing payment success:', error);
    
    return {
      statusCode: 302,
      headers: {
        'Location': 'https://www.kanjitales.com/error',
        ...headers
      },
      body: ''
    };
  }
};
