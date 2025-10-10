import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const sendTestEmail = async (template, testRecipient) => {
  const testData = {
    'user.name': 'John Doe',
    'user.email': 'john@example.com',
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

  const renderTemplate = (text) => {
    let rendered = text;
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });
    return rendered;
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: testRecipient,
    subject: `[TEST] ${renderTemplate(template.subject)}`,
    text: renderTemplate(template.text),
    html: renderTemplate(template.body)
  };

  try {
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
