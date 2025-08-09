// Create this file: netlify/functions/webhook-proxy.js
// Upload to your Netlify site

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://hoteldilley.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the incoming data
    const data = JSON.parse(event.body);
    
    // Validate email exists
    if (!data.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email' })
      };
    }

    // Your Make.com webhook URL - UPDATE THIS
    const makeWebhookUrl = 'https://hook.us2.make.com/3hr0u2462nx4bnpbp859meyserinmays';
    
    // Forward to Make.com
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const makeResponse = await response.text();
    
    console.log('Make.com response:', response.status, makeResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: 'Lead forwarded to Make.com',
        make_status: response.status
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};