import nodemailer from 'nodemailer';

export default async function handler(req, context) {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }

    const bodyText = await req.text();
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
      goals: extract('goals[]') || [],
      features: extract('features[]') || [],
      special_content: extract('special_content') || '',
      source: extract('source') || '',
      additional_notes: extract('additional_notes') || '',
    };

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const smtpTo = process.env.SMTP_TO || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('Missing SMTP configuration:', { smtpHost: !!smtpHost, smtpUser: !!smtpUser, smtpPass: !!smtpPass });
      return new Response('Server configuration error', { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const subject = `NEW CLIENT FORM SUBMISSION - AI Research Ready - ${data.business_name || ''}`;

    const text = `PRIORITY: NEW PAID CLIENT FORM SUBMISSION\n\n` +
      `===== BUSINESS INFORMATION =====\n` +
      `Business: ${data.business_name}\n` +
      `Contact: ${data.contact_name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Location: ${data.location}\n\n` +
      `===== AI RESEARCH INPUTS =====\n` +
      `Industry: ${data.industry}\n` +
      `Business Description: ${data.business_description}\n` +
      `Services: ${data.services}\n` +
      `Target Customers: ${data.target_customers}\n\n` +
      `===== CURRENT SETUP ANALYSIS =====\n` +
      `Current Website: ${data.current_website}\n` +
      `Domain Status: ${data.has_domain}\n` +
      `Domain Name: ${data.domain_name}\n` +
      `Hosting Status: ${data.has_hosting}\n\n` +
      `===== WEBSITE REQUIREMENTS =====\n` +
      `Primary Goals: ${Array.isArray(data.goals) ? data.goals.join(', ') : data.goals}\n` +
      `Requested Features: ${Array.isArray(data.features) ? data.features.join(', ') : data.features}\n` +
      `Special Content: ${data.special_content}\n\n` +
      `===== AI CONTENT GENERATION PROMPTS =====\n` +
      `Hero Section Prompt: "Create hero section for ${data.business_name}, a ${data.industry} business in ${data.location}. Target audience: ${data.target_customers}. Key message: ${data.business_description}"\n\n` +
      `Services Section Prompt: "Create services section for: ${data.services}. Make it conversion-focused for ${data.target_customers} in ${data.location}."\n\n` +
      `About Section Prompt: "Create compelling about section for ${data.business_name} highlighting: ${data.special_content}. Industry: ${data.industry}, Location: ${data.location}"\n\n` +
      `Competitor Research Prompt: "Research ${data.industry} businesses in ${data.location}. Find 3-5 main competitors and analyze their website messaging, services, and positioning."\n\n` +
      `===== PAYMENT STATUS =====\n` +
      `AWAITING DEPOSIT: R2,750\n` +
      `BALANCE DUE: R2,750 (on completion)\n` +
      `Banking details sent to client ✅\n\n` +
      `===== IMMEDIATE ACTIONS =====\n` +
      `1. SEND BANKING DETAILS EMAIL\n` +
      `2. START AI RESEARCH using prompts above\n` +
      `3. AWAIT PAYMENT CONFIRMATION\n` +
      `4. BEGIN DEVELOPMENT within 24hrs of payment\n` +
      `5. TARGET COMPLETION: [Date + 48hrs from payment]\n\n` +
      `Reference for payment: ${data.business_name} - ${new Date().toISOString().slice(0,10)}\n` +
      `Source: ${data.source}\n` +
      `Additional Notes: ${data.additional_notes}`;

    await transporter.sendMail({
      from: smtpFrom,
      to: smtpTo,
      replyTo: data.email || smtpFrom,
      subject,
      text,
    });

    return new Response(null, {
      status: 302,
      headers: { Location: '/thank-you' },
    });
  } catch (err) {
    console.error('send-intake error:', err);
    console.error('Error details:', err.message, err.stack);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};

export const config = {
  path: '/intake/submit'
};

