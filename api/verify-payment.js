export default async function handler(req, res) {
  // CORS — allow requests from your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', 'https://shaibujonathan4-cmyk.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ success: false, message: 'Missing payment reference' });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackRes.json();

    if (!data.status || data.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    // Paystack amounts are in kobo — convert back to naira
    const amountInNaira = data.data.amount / 100;

    return res.status(200).json({
      success: true,
      amount: amountInNaira,
      reference: data.data.reference,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}