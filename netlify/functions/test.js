export default async (req, context) => {
  console.log('Test function called with method:', req.method);
  
  if (req.method === 'GET') {
    return new Response('Test function is working!', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  if (req.method === 'POST') {
    return new Response('POST received successfully!', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  return new Response('Method not supported', { status: 405 });
};