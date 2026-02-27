import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import AssessmentPdfReport from '@/app/AssessmentPdfReport'; // UPDATE THIS PATH to where your PDF component is

// --- Initialize Stripe ---
const stripe = new Stripe("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");
const webhookSecret = "whsec_SsiYddzBjXdtjvqC0nimmPu3gnYLpiBK";

// --- Initialize Resend ---
const resend = new Resend("re_byoxH49C_LYxFqguCaWjjNaYTjtEEo5Uw");

// --- Initialize Firebase Admin ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
            "type": "service_account",
            "project_id": "martial-peter",
            "private_key_id": "b3133fbd7b8df497eb630b4a69f12e22a64a3b08",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAUBCoRF1XSsPb\nctVkzuHXtKEbZtIyHYUNPYbYYQE3p76/pe06EZesGHXgRPwEWBSOixGF/t0JypPu\nlq2USSKxKulxdZIoCv7Rb0gRxzxRMaQp0lHLGbma6cfQdvxUNBvCfd8DhkZ/QvO6\nFHk9PKOSi/U6hMQXR0GBL63rFo+V4/pH/v4vnus+Cx1MCKQwoKxnkpz1WJq7GOlh\nZoXapRfCk9aGP0FdOrPg5eDhLYyuWtZ98YoTFl4gJg/5hZpHgVeM7BTQKgV4hiHh\nCDNJRhQMZdHrcx9stM0+NOzhG9KqK3Hziarb4951Wpf5o+fKJH40kvVpOeWM9HqW\n6+ovvv6ZAgMBAAECggEAT77jqWLv8cqm/NDZfDvtmqzkQaCZeP6UtbDVwdQ31QRS\nLNZ5UKMK6eoatyzj9Ekx/Qnd8lqE/hJq1XzV7a+GG0FYHBxMxx4IHICwue6MLH8R\nO+Zi1H2OYZafrOoqKCCTgkr/t05u3Ua+GmNzAtmqWpJ+1g1H4v9BQniq/dkVIWn2\nxsSolOlzcyh+YWJjRbv0AMXbsRXq1rpub/zrW3Vj1h7HttZ8ikN2h780MVLtw8Vo\nRMBqbW7ui/aIXwxsnnp3WSam7EqzC5FdTXj3YpEJHZbEl8puv8ozt3v4vCI4bUlm\n7Zo7hr5lV+A4fJSEqDDYXOqDFrnUzPT/Cw64opUloQKBgQD21FxBTnqIuvwN+/tQ\nodXkplRJ2H3rfauHYDYZ7/NHBUMnN1vxDiT5x2KJq8QX9VqddlbLqeC3XdKhlixN\nvGfDEJQnH5mOB4g3fAonPOq/oc+4dPsYO1wONqiaMEmENAmyKBSHUwCiAJiOOSNM\nGjUdHIop/Fe7PJig81wXxq6yOwKBgQDHdS+XyYj84eaToNTWYfW4L6EUksdHppS/\nbdPY4nkmnhdbE9J5+e1my8MiTO7HB1iVLObKVpUr0ZOFsoH1jMQ3iDGlA6v6vGLj\n//M5iGV3/+B1t72GOtVIxdYsofKX3glxgSQdknC5kivqlTK/vZlP7sj20kXCQJds\nNvz8EpIROwKBgARNEwZ4TZ5QU9ASkgCHsWh4lYNr6FXQLMsBHDA7hCu6pb7rMgjz\nTCWmGct4WMRqHBgeVcjavvWzBtaV/VOlctFtWoeL/2sAKpl86dhhMV4BfdMjBrUX\nY7VDspBtQvqwxXJ7TFBHW/12sTHZQQo0crR9KNMueIDkv2wekX5Akg69AoGBAJwS\nDTCXSTKfTP39Xi12L4B0/HUNuRNOvJvhw1+1LplSIPJqW0qIjwPdsw3W5wwjqmPn\n45s2Drlf3zBBksFh6XOOhVIawmqLGFJRx68gFE3GkYtrP8iVpqiv7Tu1aQ7+daM0\nKt9c5AnA385J+pDgOeO689N2i5FJW3MYv/I6UcNbAoGBANiN89IMrlU2sV/l8WWp\n+de3Z79n7uEQ+k/2k9ksT/CakhOsbP6rg0wHBM1BUszl6LYkcn+8MyUaG3U+Q5lt\n2hx4AD4JZSwwiAk3h/zxjGh1HnAvWaUt1yIVFRQd+zV7RljsPKlXlPgDrPHcw+5h\nfLeJBH8BiYnwCdqkxI+1YJ6w\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-fbsvc@martial-peter.iam.gserviceaccount.com",
            "client_id": "109875140222250381910",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40martial-peter.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
        })
    })
}
const db = admin.firestore();

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const customerEmail = session.customer_details?.email?.toLowerCase().trim();
      const customerName = session.customer_details?.name || 'A Customer';
      const amountTotal = (session.amount_total / 100).toFixed(2);
      const currency = session.currency.toUpperCase();
      
      console.log(`Successful payment received from ${customerEmail}`);

      let pdfBuffer = null;

      // --- 1. FETCH FIREBASE DATA & GENERATE PDF ---
      if (customerEmail) {
        try {
          // Fetch the submission from Firestore by email
          const snapshot = await db.collection('submissions').where('email', '==', customerEmail).get();
          
          if (!snapshot.empty) {
            // Sort locally to avoid needing a complex Firestore index for the demo, grab the latest one
            const docs = snapshot.docs.map(doc => doc.data()).sort((a, b) => {
              const timeA = a.submittedAt ? a.submittedAt.toMillis() : 0;
              const timeB = b.submittedAt ? b.submittedAt.toMillis() : 0;
              return timeB - timeA;
            });
            
            let submissionData = docs[0];

            // Fetch AI content
            console.log("Fetching AI Report Content...");
            const aiResponse = await fetch("https://success.martialpeter.com/api/reports", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ strategyData: submissionData }),
            });
            
            const aiData = await aiResponse.json();
            
            // Combine data for the PDF
            const fullReportData = { 
              ...submissionData, 
              aiInsights: aiData.insights 
            };

            // Generate PDF Buffer on the server
            console.log("Generating PDF Buffer...");
            pdfBuffer = await renderToBuffer(<AssessmentPdfReport submission={fullReportData} />);
          } else {
            console.log(`No assessment found in Firebase for email: ${customerEmail}`);
          }
        } catch (dbError) {
          console.error("Error fetching data or generating PDF:", dbError);
        }
      }

      // --- 2. SEND EMAIL TO ADMIN ---
      await resend.emails.send({
        from: 'Stripe Notification <notifications@digitaldaze.com.au>',
        to: ["webmaster@martialpeter.com"], // Removed PA email as requested
        subject: `New Successful Transaction! ($${amountTotal} ${currency})`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">🎉 New Sale Notification</h2>
            <p>A new payment has been successfully processed on your website.</p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <h3 style="color: #555;">Customer Details</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p><strong>Amount:</strong> <strong>${amountTotal} ${currency}</strong></p>
            <p><strong>Payment Status:</strong> ${session.payment_status}</p>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #777;">Stripe Session ID: ${session.id}</p>
          </div>
        `,
      });
      console.log('Admin notification email sent successfully.');

      // --- 3. SEND BLACK & GOLD EMAIL TO CUSTOMER WITH PDF ---
      if (customerEmail) {
        
        // Setup email options
        const customerEmailOptions = {
          from: 'Success Potential Quiz by Martial Peter <notifications@digitaldaze.com.au>', 
          to: [customerEmail],
          subject: `Your Premium Success Profile Analysis`,
          html: `
            <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <div style="max-w-2xl mx-auto bg-[#0a0a0a] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
                
                <div style="background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #000000; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Success Potential Unlocked</h1>
                </div>

                <div style="padding: 40px 30px; color: #ffffff;">
                  <h2 style="color: #fbbf24; font-size: 22px; margin-top: 0;">Thank you, ${customerName}.</h2>
                  
                  <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                    Your payment of <strong style="color: #fbbf24;">$${amountTotal} ${currency}</strong> was successfully processed. 
                  </p>

                  <div style="background-color: #111111; border-left: 4px solid #fbbf24; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #e5e5e5; font-size: 16px; line-height: 1.5;">
                      ${pdfBuffer 
                        ? 'We have attached your <strong>Premium Success Profile Report</strong> to this email. This includes your deep-dive psychological analysis and AI insights.' 
                        : 'Your Premium Success Profile Report is currently being processed and will be sent to you shortly.'}
                    </p>
                  </div>

                  <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                    Use the insights inside to map your performance engines and adjust your course. The real work begins now.
                  </p>
                </div>

                <div style="border-top: 1px solid #222222; padding: 20px 30px; background-color: #050505; text-align: center;">
                  <p style="color: #52525b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                    Secure & Private Analysis | Digital Daze
                  </p>
                </div>
              </div>
            </div>
          `,
        };

        // Attach PDF if it was successfully generated
        if (pdfBuffer) {
          customerEmailOptions.attachments = [
            {
              filename: `Success_Profile_${customerEmail}.pdf`,
              content: pdfBuffer,
            }
          ];
        }

        await resend.emails.send(customerEmailOptions);
        console.log(`Customer email sent successfully to ${customerEmail}.`);
      }

    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing webhook.' },
      { status: 500 }
    );
  }
}