const express = require('express');
const axios = require('axios');
const { DateTime } = require('luxon');

const app = express();
const PORT = process.env.PORT || 3000;

const OWNER_NAME = "ZEXX_OWNER";
const JOIN_REPLACE = "@zexx_owner";

// 🔑 Keys Database
const KEYS_DB = {
  "ZEXX@_VIP": { expiry: "2026-12-31" },
  "OWNER_TEST": { expiry: "2035-12-30" },
  "ZEXX_@TRY": { expiry: "2026-04-15" },
  "ZEXX_P@ID": { expiry: "2026-07-01" }
};

app.use(express.json());

/* ===============================
   🔎 SEARCH ROUTE
================================ */
app.get('/search', async (req, res) => {
  const { key, type, value } = req.query;

  // 🔐 Key Validation
  if (!key || !KEYS_DB[key]) {
    return res.status(401).json({
      success: false,
      message: "Invalid Key!",
      owner: OWNER_NAME
    });
  }

  // 📅 Expiry Check
  const today = DateTime.local();
  const expiryDate = DateTime.fromISO(KEYS_DB[key].expiry);

  if (today > expiryDate) {
    return res.status(403).json({
      success: false,
      message: "Key Expired!",
      owner: OWNER_NAME
    });
  }

  // 📌 Parameter Check
  if (!type || !value) {
    return res.status(400).json({
      success: false,
      message: "Type and value parameter required",
      owner: OWNER_NAME
    });
  }

  try {
    let response;

    /* ===============================
       📱 PHONE
    ================================ */
    if (type === "phone") {
      if (!/^\d{10}$/.test(value)) {
        return res.status(400).json({ success: false, message: "Invalid Phone Number", owner: OWNER_NAME });
      }

      response = await axios.get("https://abbas-apis.vercel.app/api/num-name", {
        params: { number: value },
        timeout: 10000
      });
    }

    /* ===============================
       🪪 PAN
    ================================ */
    else if (type === "pan") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
        return res.status(400).json({ success: false, message: "Invalid PAN Format", owner: OWNER_NAME });
      }

      response = await axios.get("https://pan2info-shatirownerrr.vercel.app/pan", {
        params: { key: "demo&term", term: value },
        timeout: 10000
      });
    }

    /* ===============================
       🏢 GST (NEW API + join replace)
    ================================ */
    else if (type === "gst") {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]{3}$/.test(value)) {
        return res.status(400).json({ success: false, message: "Invalid GST Format", owner: OWNER_NAME });
      }

      response = await axios.get("https://gstlookup.hideme.eu.org/", {
        params: { gstNumber: value },
        timeout: 10000
      });

      // 🔁 Replace join field if present
      if (response?.data?.data?.join) {
        response.data.data.join = JOIN_REPLACE;
      }
    }

    /* ===============================
       📮 PINCODE
    ================================ */
    else if (type === "pincode") {
      if (!/^\d{6}$/.test(value)) {
        return res.status(400).json({ success: false, message: "Invalid PIN Code", owner: OWNER_NAME });
      }

      response = await axios.get(`https://api.postalpincode.in/pincode/${value}`, {
        timeout: 10000
      });
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid type! Use phone, pan, gst, or pincode",
        owner: OWNER_NAME
      });
    }

    // ✅ Final Response
    return res.json({
      success: true,
      owner: OWNER_NAME,
      type,
      data: response.data || {}
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "External API Error",
      error: error.message,
      owner: OWNER_NAME
    });
  }
});

/* ===============================
   🏠 HOME ROUTE
================================ */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "API Running Successfully 🚀",
    owner: OWNER_NAME
  });
});

/* ===============================
   🚀 SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
