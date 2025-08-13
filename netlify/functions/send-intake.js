exports.handler = async (event, context) => {
  try {
    console.log('Function called with method:', event.httpMethod);
    console.log('Headers:', event.headers);
    
    if (event.httpMethod !== 'POST') {
      console.log('Rejecting non-POST method:', event.httpMethod);
      return {
        statusCode: 405,
        body: 'Method Not Allowed'
      };
    }

    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return {
        statusCode: 415,
        body: 'Unsupported Media Type'
      };
    }

    const bodyText = event.body || '';
    const params = new URLSearchParams(bodyText);

    const extract = (name) => params.getAll(name).length > 1 ? params.getAll(name) : params.get(name);

    const data = {
      business_name: extract('business_name') || '',
      contact_name: extract('contact_name') || '',
      email: extract('email') || '',
      phone: extract('phone') || '',
      location: extract('location') || '',
      industry: extract('industry') || '',
      business_description: extract('business_description') || '',
      services: extract('services') || '',
      target_customers: extract('target_customers') || '',
      current_website: extract('current_website') || '',
      has_domain: extract('has_domain') || '',
      domain_name: extract('domain_name') || '',
      has_hosting: extract('has_hosting') || '',
      goals: Array.isArray(extract('goals[]')) ? extract('goals[]').join(', ') : (extract('goals[]') || 'N/A'),
      features: Array.isArray(extract('features[]')) ? extract('features[]').join(', ') : (extract('features[]') || 'N/A'),
      special_content: extract('special_content') || '',
      source: extract('source') || '',
      additional_notes: extract('additional_notes') || ''
    };

    // Honeypot check
    if (extract('bot-field')) {
      return {
        statusCode: 422,
        body: 'Bot detected'
      };
    }

    // Use Resend to send email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY');
      return {
        statusCode: 500,
        body: 'Server configuration error'
      };
    }

    const emailPayload = {
      from: 'rapidsites@reminders.nexevo.io',
      to: 'hello@rapidsites.co.za',
      replyTo: data.email,
      subject: `NEW CLIENT FORM SUBMISSION - Rapid Sites - ${data.business_name}`,
      html: `
        <p>🚨 PRIORITY: NEW PAID CLIENT FORM SUBMISSION</p>
        <hr>
        <h3>===== BUSINESS INFORMATION =====</h3>
        <p><strong>Business:</strong> ${data.business_name}</p>
        <p><strong>Contact:</strong> ${data.contact_name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <hr>
        <h3>===== AI RESEARCH INPUTS =====</h3>
        <p><strong>Industry:</strong> ${data.industry}</p>
        <p><strong>Business Description:</strong> ${data.business_description}</p>
        <p><strong>Services:</strong> ${data.services}</p>
        <p><strong>Target Customers:</strong> ${data.target_customers}</p>
        <hr>
        <h3>===== CURRENT SETUP ANALYSIS =====</h3>
        <p><strong>Current Website:</strong> ${data.current_website || 'N/A'}</p>
        <p><strong>Domain Status:</strong> ${data.has_domain}</p>
        <p><strong>Domain Name:</strong> ${data.domain_name || 'N/A'}</p>
        <p><strong>Hosting Status:</strong> ${data.has_hosting}</p>
        <hr>
        <h3>===== WEBSITE REQUIREMENTS =====</h3>
        <p><strong>Primary Goals:</strong> ${data.goals}</p>
        <p><strong>Requested Features:</strong> ${data.features}</p>
        <p><strong>Special Content:</strong> ${data.special_content || 'N/A'}</p>
        <hr>
        <h3>===== PAYMENT STATUS =====</h3>
        <p><strong>AWAITING DEPOSIT:</strong> R2,750</p>
        <p><strong>BALANCE DUE:</strong> R2,750 (on completion)</p>
        <p>Banking details sent to client ✅</p>
        <hr>
        <h3>===== IMMEDIATE ACTIONS =====</h3>
        <ol>
            <li>📧 SEND BANKING DETAILS EMAIL</li>
            <li>🤖 START AI RESEARCH using prompts above</li>
            <li>⏰ AWAIT PAYMENT CONFIRMATION</li>
            <li>🏗️ BEGIN DEVELOPMENT within 24hrs of payment</li>
            <li>📋 TARGET COMPLETION: [Date + 48hrs from payment]</li>
        </ol>
        <p><strong>Reference for payment:</strong> ${data.business_name}-${new Date().toISOString().slice(0, 10)}</p>
        <p><strong>Source:</strong> ${data.source || 'N/A'}</p>
        <p><strong>Additional Notes:</strong> ${data.additional_notes || 'N/A'}</p>
      `,
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', errorText);
      return {
        statusCode: 500,
        body: `Email service error: ${errorText}`
      };
    }

    return {
      statusCode: 303,
      headers: {
        'Location': '/thank-you',
      },
      body: ''
    };

  } catch (err) {
    console.error('send-intake error:', err);
    console.error('Error details:', err.message, err.stack);
    return {
      statusCode: 500,
      body: `Error: ${err.message}`
    };
  }
};