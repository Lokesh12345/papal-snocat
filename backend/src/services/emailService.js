import nodemailer from 'nodemailer';
import { getAllComponents } from './componentService.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const sendTestEmail = async (template, testRecipient) => {
  const testData = {
    'user.name': 'lokesh',
    'user.email': 'lloke63@gmail.com',
    'transaction.amount': '$50.00',
    'transaction.id': 'TXN-123456',
    'unsubscribe_link': 'https://paypal.com/unsubscribe',
    'greeting': 'Hello',
    'payment_success': 'Your payment was successful',
    'payment_amount': 'Amount',
    'transaction_id': 'Transaction ID',
    'footer': 'Thank you for using PayPal',
    'unsubscribe': 'Unsubscribe from emails',
    'customer_support': 'Need help? Contact support'
  };

  const renderTemplate = async (text) => {
    let rendered = text;

    // Load and replace components first ({{temp.component_id}})
    try {
      const components = await getAllComponents();
      components.forEach(component => {
        const regex = new RegExp(`\\{\\{temp\\.${component.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
        rendered = rendered.replace(regex, component.html);
      });
    } catch (error) {
      console.error('Error loading components for email:', error);
    }

    // Then replace test data placeholders
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    return rendered;
  };

  try {
    const renderedSubject = await renderTemplate(template.subject);
    const renderedText = await renderTemplate(template.text);
    const renderedHtml = await renderTemplate(template.body);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testRecipient,
      subject: `[TEST] ${renderedSubject}`,
      text: renderedText,
      html: renderedHtml
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      message: `Test email sent successfully to ${testRecipient}`
    };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
