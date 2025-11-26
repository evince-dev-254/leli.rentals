import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration  
const FROM_EMAIL = 'Leli Rentals <onboarding@resend.dev>'
const SUPPORT_EMAIL = 'lelirentalsmail@gmail.com'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

/**
 * Core email sending function
 */
export async function sendEmail(options: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email would be sent:', options.subject)
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || SUPPORT_EMAIL,
    })

    if (error) {
      console.error('❌ Email sending failed:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error: any) {
    console.error('❌ Email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 1. Welcome Email - Sent when user creates account
 */
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Leli Rentals</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Welcome to Leli Rentals! 🎉</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                      Welcome to Leli Rentals! We're thrilled to have you join our community of renters and owners.
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      Your account is now active, and you're ready to explore thousands of rental items or start listing your own!
                    </p>
                    
                    <!-- CTA Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9ff; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 15px; color: #667eea; font-size: 18px;">🚀 Get Started in 3 Easy Steps:</h3>
                          <ol style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                            <li>Choose your account type (Renter or Owner)</li>
                            <li>Complete your profile</li>
                            <li>Start browsing or listing items!</li>
                          </ol>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/get-started" 
                             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Complete Your Profile
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; color: #999999; text-align: center;">
                      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea;">${SUPPORT_EMAIL}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: '🎉 Welcome to Leli Rentals!',
    html,
  })
}

/**
 * 2. ID Verification Confirmation Email
 */
export async function sendVerificationConfirmationEmail(
  userEmail: string,
  userName: string,
  status: 'submitted' | 'approved' | 'rejected',
  rejectionReason?: string
) {
  const statusConfig = {
    submitted: {
      title: 'ID Verification Received ✓',
      message: 'We\'ve received your verification documents and they\'re currently under review.',
      color: '#f59e0b',
      cta: 'View Status',
      ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
    approved: {
      title: 'ID Verification Approved! 🎉',
      message: 'Congratulations! Your identity has been verified successfully.',
      color: '#10b981',
      cta: 'Explore Features',
      ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
    rejected: {
      title: 'ID Verification - Action Required ⚠️',
      message: `We couldn't verify your documents. Reason: ${rejectionReason || 'Information unclear'}`,
      color: '#ef4444',
      cta: 'Resubmit Documents',
      ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/verification`,
    },
  }

  const config = statusConfig[status]

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background-color: ${config.color}; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">${config.title}</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      ${config.message}
                    </p>
                    
                    ${status === 'submitted' ? `
                      <p style="margin: 0 0 20px; font-size: 16px; color: #666666;">
                        <strong>Review Time:</strong> Typically 24-48 hours<br>
                        <strong>Status:</strong> Under Review
                      </p>
                    ` : ''}
                    
                    ${status === 'approved' ? `
                      <p style="margin: 0 0 20px; font-size: 16px; color: #666666;">
                        You now have access to all premium features including listing items and renting.
                      </p>
                    ` : ''}
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${config.ctaLink}" 
                             style="display: inline-block; background-color: ${config.color}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            ${config.cta}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

  return sendEmail({
    to: userEmail,
    subject: config.title,
    html,
  })
}

/**
 * 3. Account Type Reminder - For users who haven't selected account type
 */
export async function sendAccountTypeReminderEmail(userEmail: string, userName: string, daysWaiting: number) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Complete Your Account Setup</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">You're Almost There! 🎯</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                      We noticed you created your account ${daysWaiting} days ago, but haven't selected your account type yet.
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      Choose your path to unlock all features:
                    </p>
                    
                    <!-- Account Types -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td width="48%" style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px solid #10b981;">
                          <h3 style="margin: 0 0 10px; color: #10b981; font-size: 18px;">🔑 Renter</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px;">
                            <li>Browse thousands of items</li>
                            <li>Book instantly</li>
                            <li>Save favorites</li>
                          </ul>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="background-color: #fef3f2; padding: 20px; border-radius: 8px; border: 2px solid #667eea;">
                          <h3 style="margin: 0 0 10px; color: #667eea; font-size: 18px;">💼 Owner</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px;">
                            <li>List unlimited items</li>
                            <li>Earn passive income</li>
                            <li>Manage bookings</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/get-started" 
                             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Choose Your Account Type
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; color: #999999; text-align: center;">
                      This takes less than 30 seconds!
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `${userName}, Complete Your Account Setup - Choose Renter or Owner`,
    html,
  })
}

/**
 * 4. We Miss You Email - For inactive users
 */
export async function sendWeMissYouEmail(userEmail: string, userName: string, daysInactive: number) {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>We Miss You!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px;">We Miss You! 💙</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                      It's been ${daysInactive} days since we last saw you, and we wanted to check in!
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      A lot has happened since you've been away:
                    </p>
                    
                    <!-- What's New Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3f2 0%, #f0f9ff 100%); border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 15px; color: #667eea; font-size: 18px;">✨ What's New:</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                            <li><strong>500+</strong> new items added this month</li>
                            <li><strong>Verified owners</strong> with secure payments</li>
                            <li><strong>Instant booking</strong> on popular items</li>
                            <li><strong>Better prices</strong> across all categories</li>
            </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/listings" 
                             style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Explore New Listings
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; color: #999999; text-align: center;">
                      We'd love to have you back! 💜
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

  return sendEmail({
    to: userEmail,
    subject: `${userName}, We Miss You! Come Back for Exclusive Deals 💙`,
    html,
  })
}

/**
 * 5. New Booking Confirmation Email
 */
export async function sendBookingConfirmationEmail(
  userEmail: string,
  userName: string,
  booking: {
    id: string
    itemName: string
    itemImage?: string
    startDate: string
    endDate: string
    totalPrice: number
    ownerName: string
    ownerEmail: string
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Booking Confirmed! ✓</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      Great news! Your booking has been confirmed. Here are the details:
                    </p>
                    
                    <!-- Booking Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          ${booking.itemImage ? `
                            <img src="${booking.itemImage}" alt="${booking.itemName}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                          ` : ''}
                          
                          <h3 style="margin: 0 0 20px; color: #333333; font-size: 20px;">${booking.itemName}</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Booking ID:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">#${booking.id}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Start Date:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${new Date(booking.startDate).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>End Date:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${new Date(booking.endDate).toLocaleDateString()}</td>
                            </tr>
                            <tr style="border-top: 2px solid #e0e0e0;">
                              <td style="color: #333333; font-size: 16px; padding-top: 15px;"><strong>Total Price:</strong></td>
                              <td style="color: #10b981; font-size: 20px; font-weight: bold; text-align: right; padding-top: 15px;">$${booking.totalPrice}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Owner Contact -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3f2; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <h4 style="margin: 0 0 10px; color: #667eea; font-size: 16px;">Owner Contact:</h4>
                          <p style="margin: 0; color: #666666; font-size: 14px;">
                            <strong>${booking.ownerName}</strong><br>
                            ${booking.ownerEmail}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile/bookings" 
                             style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            View Booking Details
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `Booking Confirmed: ${booking.itemName}`,
    html,
  })
}

/**
 * 6. Payment Receipt Email
 */
export async function sendPaymentReceiptEmail(
  userEmail: string,
  userName: string,
  payment: {
    id: string
    amount: number
    method: string
    date: string
    description: string
    invoiceUrl?: string
  }
) {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background-color: #1f2937; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Payment Receipt 💳</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      Thank you for your payment. Here's your receipt:
                    </p>
                    
                    <!-- Payment Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <table width="100%" cellpadding="10" cellspacing="0">
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Transaction ID:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${payment.id}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Date:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${new Date(payment.date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Payment Method:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${payment.method}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Description:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${payment.description}</td>
                            </tr>
                            <tr style="border-top: 2px solid #e0e0e0;">
                              <td style="color: #333333; font-size: 18px; padding-top: 15px;"><strong>Amount Paid:</strong></td>
                              <td style="color: #10b981; font-size: 24px; font-weight: bold; text-align: right; padding-top: 15px;">$${payment.amount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    ${payment.invoiceUrl ? `
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${payment.invoiceUrl}" 
                               style="display: inline-block; background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                              Download Invoice
                            </a>
                          </td>
                        </tr>
                      </table>
                    ` : ''}
                    
                    <p style="margin: 30px 0 0; font-size: 14px; color: #999999; text-align: center;">
                      Questions? Contact us at ${SUPPORT_EMAIL}
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

  return sendEmail({
    to: userEmail,
    subject: `Payment Receipt - $${payment.amount}`,
    html,
  })
}

/**
 * 7. Support Ticket Email
 */
export async function sendSupportTicketEmail(
  userEmail: string,
  userName: string,
  ticket: {
    id: string
    subject: string
    category: string
    priority: string
    message: string
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Support Ticket Created</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Support Ticket Created 🎫</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      We've received your support request and our team will get back to you within 24 hours.
                    </p>
                    
                    <!-- Ticket Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <table width="100%" cellpadding="10" cellspacing="0">
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Ticket ID:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">#${ticket.id}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Subject:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${ticket.subject}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Category:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${ticket.category}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;"><strong>Priority:</strong></td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${ticket.priority}</td>
                            </tr>
                          </table>
                          
                          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            <h4 style="margin: 0 0 10px; color: #333333; font-size: 14px;">Your Message:</h4>
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                              ${ticket.message}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" 
                             style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            View Ticket Status
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; color: #999999; text-align: center;">
                      Response time: Usually within 24 hours
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `Support Ticket #${ticket.id} - ${ticket.subject}`,
    html,
  })
}

/**
 * 8. General Inquiry Email
 */
export async function sendInquiryResponseEmail(
  userEmail: string,
  userName: string,
  inquirySubject: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Thank You for Your Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Thank You for Reaching Out! 💬</h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">Hi ${userName},</p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                      Thank you for your inquiry about: <strong>${inquirySubject}</strong>
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #666666;">
                      We've received your message and our team will respond within 24-48 hours.
                    </p>
                    
                    <!-- Quick Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 15px; color: #8b5cf6; font-size: 18px;">In the meantime:</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #666666; line-height: 1.8;">
                            <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/help" style="color: #8b5cf6; text-decoration: none;">Browse our FAQ</a></li>
                            <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/listings" style="color: #8b5cf6; text-decoration: none;">Explore rental listings</a></li>
                            <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/about" style="color: #8b5cf6; text-decoration: none;">Learn more about us</a></li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; color: #999999; text-align: center;">
                      Need urgent help? Email us at ${SUPPORT_EMAIL}
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © ${new Date().getFullYear()} Leli Rentals
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: `Re: ${inquirySubject}`,
    html,
  })
}

/**
 * Send contact form email
 */
export async function sendContactFormEmail(
  name: string,
  email: string,
  subject: string,
  category: string,
  message: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Contact Form Submission</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="margin-bottom: 25px;">
                      <strong style="color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">From:</strong>
                      <p style="margin: 5px 0 0; font-size: 16px; color: #333333;">${name}</p>
                      <p style="margin: 5px 0 0; font-size: 16px; color: #666666;">${email}</p>
                    </div>
                    <div style="margin-bottom: 25px;">
                      <strong style="color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Category:</strong>
                      <p style="margin: 5px 0 0; font-size: 16px; color: #333333;">${category}</p>
                    </div>
                    <div style="margin-bottom: 25px;">
                      <strong style="color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Subject:</strong>
                      <p style="margin: 5px 0 0; font-size: 16px; color: #333333;">${subject}</p>
                    </div>
                    <div style="margin-bottom: 25px;">
                      <strong style="color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Message:</strong>
                      <p style="margin: 10px 0 0; font-size: 16px; color: #333333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; font-size: 14px; color: #666666;">
                        You can reply directly to this email to respond to ${name}.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return await sendEmail({
    to: SUPPORT_EMAIL,
    subject: `Contact Form: ${subject}`,
    html,
    replyTo: email,
  })
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(email: string) {
  // Send confirmation email to user
  const userHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Newsletter Subscription Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 You're Subscribed!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">
                      Thank you for subscribing to the Leli Rentals newsletter!
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; color: #666666; line-height: 1.6;">
                      You'll now receive the latest rental deals, new listings, and platform updates delivered directly to your inbox.
                    </p>
                    <p style="margin: 20px 0 0; font-size: 14px; color: #999999;">
                      If you didn't subscribe, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  // Send notification to admin
  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Newsletter Subscription</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Newsletter Subscription</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #333333;">
                      A new user has subscribed to the newsletter:
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; color: #666666;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin: 20px 0 0; font-size: 14px; color: #999999;">
                      Subscription date: ${new Date().toLocaleString()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  // Send confirmation to user
  const userResult = await sendEmail({
    to: email,
    subject: 'Welcome to Leli Rentals Newsletter! 🎉',
    html: userHtml,
  })

  // Send notification to admin
  const adminResult = await sendEmail({
    to: SUPPORT_EMAIL,
    subject: 'New Newsletter Subscription',
    html: adminHtml,
  })

  if (userResult.success || adminResult.success) {
    return { success: true }
  } else {
    return { success: false, error: userResult.error || adminResult.error }
  }
}

export const emailService = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationConfirmationEmail,
  sendAccountTypeReminderEmail,
  sendWeMissYouEmail,
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendSupportTicketEmail,
  sendInquiryResponseEmail,
  sendContactFormEmail,
  subscribeToNewsletter,
}
