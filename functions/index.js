const functions = require("firebase-functions/v2/https");
const { onRequest } = functions;
const admin = require("firebase-admin");

admin.initializeApp();

exports.generateCustomToken = onRequest(async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email parameter" });
  }

  try {
    // Get user by email or create if doesn't exist
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        user = await admin.auth().createUser({ email });
      } else {
        throw error;
      }
    }

    const customToken = await admin.auth().createCustomToken(user.uid);
    res.status(200).json({ token: customToken });

  } catch (err) {
    console.error("Error generating token:", err.code, err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
