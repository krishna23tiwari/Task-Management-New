const nodemailer = require('nodemailer');

const createTransporter = (email, mailkey) => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendOtpEmail = async (email, otp, firstname, senderEmail, mailkey) => {
  try {
    const transporter = createTransporter(senderEmail, mailkey);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${firstname},</h2>
          <p>Your verification code is:</p>
          <h1 style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

const sendCreationEmail = async (email, firstname, lastname, title, senderEmail, mailkey) => {
  try {
    const transporter = createTransporter(senderEmail, mailkey);
    const mailOptions = {
      from: "jangiddummy6375@gmail.com",
      to: email,
      subject: 'Task Created Successfully',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2>Hello ${firstname} ${lastname},</h2>
        <p>You got a new task title ${title}!</p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
        <p>You can view and manage your tasks from your dashboard.</p>
        </div>
        <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
        <p style="margin-top: 20px; color: #666;">Thank you for using our Task Manager!</p>
      </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
}

const sendStatusUpdateEmail = async (email, firstname, lastname, title, status, senderEmail, mailkey) => {
  try {
    const transporter = createTransporter(senderEmail, mailkey);
    const statusText = status === 'completed' ? 'completed' : 'marked as pending';
    const colorStyle = status === 'completed' ? '#4CAF50' : '#FFC107';

    const mailOptions = {
      from: "jangiddummy6375@gmail.com",
      to: email,
      subject: `Task ${statusText}: ${title}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2>Hello ${firstname} ${lastname},</h2>
        <p>The status of your task "${title}" has been <strong style="color: ${colorStyle};">${statusText}</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid ${colorStyle};">
          <p>You can view and manage your tasks from your dashboard.</p>
        </div>
        <p>If you have any questions or need assistance, please feel free to contact our support team.</p>
        <p style="margin-top: 20px; color: #666;">Thank you for using our Task Manager!</p>
      </div>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Status update email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending status update email: ', error);
    return false;
  }
};

module.exports = { sendOtpEmail, sendCreationEmail, sendStatusUpdateEmail };