import { NextResponse } from "next/server";

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------
const GHL_CUSTOM_OBJECT_ID = "69a6d83eb206eb7c36275bd5";
const GHL_LOCATION_ID = "Dm5yFSciFNH7tur70UZU";

const getGhlHeaders = () => ({
  Authorization: `Bearer ${process.env.GROWTHMODE_ACCESS_TOKEN}`,
  Version: "2021-07-28",
  "Location-Id": GHL_LOCATION_ID,
  "Content-Type": "application/json",
});

// ----------------------------------------------------------------------
// POST: Search Contact
// ----------------------------------------------------------------------
export async function POST(request) {
  try {
    const payload = await request.json();
    const email = payload.email;
    const firstName = payload.firstName;
    const lastName = payload.lastName;
    const phone = payload.phone;
    const interestedPackage = payload.interestedPackage;
    const hourlyRate = payload.hourlyRate;
    const manualHoursPerWeek = payload.manualHoursPerWeek;
    const workingWeeks = payload.workingWeeks;
    const employeeCount = payload.employeeCount;
    const annualCost = payload.annualCost;
    const anualSavings = payload.anualSavings;
    const hoursReclaimed = payload.hoursReclaimed;
    const roi = payload.roi;
    const paybackPeriod = payload.paybackPeriod;

    const body = {
      query: email,
      locationId: GHL_LOCATION_ID,
      page: 1,
      pageLimit: 1,
    };
    //Fetch contact info from ghl
    const ghlResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search`,
      {
        method: "POST",
        headers: getGhlHeaders(),
        body: JSON.stringify(body),
      },
    );
    const data = await ghlResponse.json();
    const htmlBody = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; font-family:Arial, sans-serif; font-size:14px; color:#222222; line-height:1.7;">

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px 0 24px;">

              <p style="margin:0 0 16px 0;">Hi ${firstName} ${lastName},</p>

              <p style="margin:0 0 5px 0;">Your ROI results are here — based on what you submitted, you can see exactly where time and money are being left on the table in your current Tekla workflow.</p>
              <table style="border-collapse: collapse;">
                <tr>
                  <th style="border: 1px solid black;padding: 8px 12px;">Hourly Rate</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">Manual Hours/Week</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">Working Weeks</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">Employee Count</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">Annual Cost Before</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">Annual Savings</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">Hours Reclaimed</th>
                  <th style="border: 1px solid black;padding: 8px 12px;">ROI</th>
                </tr>
                <tr>
                  <td style="border: 1px solid black;padding: 8px 12px;">${hourlyRate}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${manualHoursPerWeek}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${workingWeeks}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${employeeCount}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${annualCost}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${anualSavings}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${hoursReclaimed}</td>
                  <td style="border: 1px solid black;padding: 8px 12px;">${roi}</td>
                </tr>
              </table>
              
              <p style="margin:0 0 16px 0;">Most Tekla users are surprised by how much time they are losing to tasks that can be fully automated.</p>

              <p style="margin:0 0 16px 0;">The IBim Automation Tools package was built specifically for that — 60+ tools covering drawing outputs, model automation, and repetitive workflow tasks your team deals with every day. You get results from day one, without any custom development work.</p>

              <p style="margin:0 0 16px 0;">
                Get the package here:
                <a href="https://shop.ibimconsulting.com.au/packages" target="_blank" style="color:#1a73e8; text-decoration:underline;">https://shop.ibimconsulting.com.au/packages</a>
              </p>

              <p style="margin:0 0 16px 0;">And if you want to see how these tools actually work inside a live Tekla model — and talk through what is costing your business the most — book a 30-minute session directly:<br>
                <a href="https://calendly.com/ibimconsulting" target="_blank" style="color:#1a73e8; text-decoration:underline;">https://calendly.com/ibimconsulting</a>
              </p>

              <p style="margin:0 0 16px 0;">No pitch. Just a look at what is possible for your specific setup.</p>

              <p style="margin:0 0 6px 0;">In the meantime, here is a free GA Drawing Index tool :</p>

              <p style="margin:0 0 6px 0;">
                Download here:
                <a href="https://workdrive.zoho.com.au/folder/turk409895d38fa2d488caceaf488212e5c67" target="_blank" style="color:#1a73e8; text-decoration:underline;">https://workdrive.zoho.com.au/folder/turk409895d38fa2d488caceaf488212e5c67</a>
              </p>

              <p style="margin:0 0 8px 0;">Video link :</p>

            </td>
          </tr>

          <!-- YouTube Thumbnail -->
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <a href="https://youtu.be/yXmJovzr_Wg" target="_blank" style="display:block; position:relative; text-decoration:none;">
                <!-- Thumbnail -->
                <img src="https://img.youtube.com/vi/yXmJovzr_Wg/hqdefault.jpg"
                     width="552"
                     alt="Watch: GA Drawing Index Tool Demo"
                     style="display:block; width:100%; max-width:552px; border:0; border-radius:4px;">
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 24px;">
              <hr style="border:none; border-top:1px solid #e2e8f0; margin:0;">
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:20px 24px 16px 24px;">

              <p style="margin:0 0 2px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">Regards,</p>
              <p style="margin:0 0 2px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060; font-weight:bold;">Sriram Santhanam</p>
              <p style="margin:0 0 8px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">Founder of IBim Consulting</p>

              <!-- Logo between Founder title and Mobile No -->
              <img style="width:110px;height:auto;" src="https://assets.cdn.filesafe.space/Dm5yFSciFNH7tur70UZU/media/68b7f55ef9afe99adef4fb6e.png">

              <p style="margin:0 0 2px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">Mobile No : 0406860078</p>
              <p style="margin:0 0 2px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">
                <a href="http://www.ibimconsulting.com.au/" target="_blank" style="color:#002060; text-decoration:underline;">www.ibimconsulting.com.au</a>
              </p>
              <p style="margin:0 0 2px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">
                Mail : <a href="mailto:sriram@ibimconsulting.com.au" style="color:#002060; text-decoration:underline;">sriram@ibimconsulting.com.au</a>
              </p>
              <p style="margin:0 0 2px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">We are a community of Tekla OpenAPI Developers,</p>
              <p style="margin:0 0 16px 0; font-family:Arial, sans-serif; font-size:13px; color:#002060;">Consultants and Detailers with many satisfying clients.</p>

            </td>
          </tr>

          <!-- Banner image -->
          <tr>
            <td style="padding:0 24px 32px 24px;">
            <img style="width:552px;height:auto;" src="https://assets.cdn.filesafe.space/Dm5yFSciFNH7tur70UZU/media/6a130cdfe05851175c6690a1.png">
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `.trim();

    if (data.contacts.length === 0) {
      const contactBody = {
        locationId: GHL_LOCATION_ID,
        gender: "male",
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        phone: phone,
        email: email,
      };

      try {
        //Create new contact in GHL
        const createRes = await fetch(
          `https://services.leadconnectorhq.com/contacts/`,
          {
            method: "POST",
            headers: getGhlHeaders(),
            body: JSON.stringify(contactBody),
          },
        );
        const createData = await createRes.json();
        const contact = createData.contact;
        const body = {
          type: "Email",
          contactId: contact.id,
          locationId: GHL_LOCATION_ID,
          subject: "Your ROI Results Are Here",
          html: htmlBody,
          from: "pa@ibimconsulting.com.au",
          to: email,
        };
        const sendRes = await fetch(
          `https://services.leadconnectorhq.com/conversations/messages`,
          {
            method: "POST",
            headers: getGhlHeaders(),
            body: JSON.stringify(body),
          },
        );

        const result = await sendRes.json();
        return NextResponse.json({
          success: true,
          message: "Send roi results successfully!",
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: "Failed to send roi results!",
          error: error,
        });
      }
    } else {
      const body = {
        type: "Email",
        contactId: data.contacts[0].id,
        locationId: GHL_LOCATION_ID,
        subject: "Your ROI Results Are Here",
        html: htmlBody,
        from: "pa@ibimconsulting.com.au",
        to: email,
      };
      const sendRes = await fetch(
        `https://services.leadconnectorhq.com/conversations/messages`,
        {
          method: "POST",
          headers: getGhlHeaders(),
          body: JSON.stringify(body),
        },
      );

      const result = await sendRes.json();
      return NextResponse.json({
        success: true,
        message: "Send roi results successfully!",
      });
    }
  } catch (error) {
    console.error("CRM Fetch Error:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      message: error,
      status: 500,
    });
  }
}
