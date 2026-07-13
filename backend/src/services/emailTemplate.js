const wrapEmail = ({ title, contentHtml }) => `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #022b3a; padding: 20px 24px;">
        <span style="color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">NAVIGATE</span>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #022b3a; margin-top: 0;">${title}</h2>
        ${contentHtml}
      </div>
      <div style="background-color: #f4f6f8; padding: 16px 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">Questa è un'email automatica inviata da NAVIGATE.</p>
      </div>
    </div>
  </div>
`;

module.exports = { wrapEmail };
