exports.handler = async (event, context) => {
  console.log('Test function called with method:', event.httpMethod);
  
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Test function is working!'
    };
  }
  
  if (event.httpMethod === 'POST') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'POST received successfully!'
    };
  }
  
  return {
    statusCode: 405,
    body: 'Method not supported'
  };
};