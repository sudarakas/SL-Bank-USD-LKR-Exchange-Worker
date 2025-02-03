export default {
  async fetch(request, env, ctx) {
    // Get current date in GMT+5:30
    const now = new Date();
    const gmt530Offset = 5.5 * 60 * 60 * 1000;
    const gmt530Date = new Date(now.getTime() + gmt530Offset);
    
    const formattedDate = gmt530Date.toISOString().split("T")[0]; 

    // Construct API URL with today's date
    const API_URL = `env.EXCHNAGE_END_POINT?currency=USD&date=${formattedDate}&latest=true`;

    try {
      // Fetch exchange rate data
      const response = await fetch(API_URL);
      const jsonData = await response.json();
      const banksToMonitor = ["CBSL", "COMMERCIAL", "HNB", "SAMPATH"];
      
      let changedBanks = [];

      for (const bankData of jsonData.data) {
        if (banksToMonitor.includes(bankData.bank)) {
          const currentRate = parseFloat(bankData.buying_currency);
          const lastRate = await env.EXCHANGE_KV.get(`last_rate_${bankData.bank}`);

          if (lastRate && parseFloat(lastRate) !== currentRate) {
            changedBanks.push({
              bank: bankData.bank,
              oldRate: lastRate,
              newRate: currentRate,
            });
          }

          // Update KV storage
          await env.EXCHANGE_KV.put(`last_rate_${bankData.bank}`, currentRate.toString());
        }
      }
      // Send email if any changes are detected
      if (changedBanks.length > 0) {
        console.log("Email sent call:")
        await sendEmail(env, changedBanks, formattedDate);
      }

      return new Response(`Checked exchange rates for ${formattedDate}. Changes detected: ${changedBanks.length}`, { status: 200 });

    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};

// Function to send an email notification
async function sendEmail(env, changedBanks, date) {
  console.log("Email sent call inside:")
  const EMAIL_API_URL = "https://api.resend.com/emails";
  const API_KEY = env.EMAIL_API_KEY;

  let emailBody = `Exchange rate changes detected on ${date} (GMT+5:30) for the following banks:\n\n`;
  changedBanks.forEach(bank => {
    emailBody += `Bank: ${bank.bank}\nOld Rate: ${bank.oldRate}\nNew Rate: ${bank.newRate}\n\n`;
  });

  const emailData = {
    from: "usd-alert-worker@email.com",
    to: "your-email@email.com",
    subject: `Exchange Rate Alert - ${date}`,
    text: emailBody,
  };

  try {
    const response = await fetch(EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email. Status: ${response.status} - ${response.statusText}`);
    }
    
    console.log("Email sent successfully:", await response.json());
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

