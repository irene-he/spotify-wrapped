import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import querystring from "querystring";

// Get variables stored in .env file
dotenv.config({ path: ".env" });
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const port = process.env.PORT || 5000;

// Create an instance of the express application
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Generates a random string for the application state
const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

// https://developer.spotify.com/documentation/web-api/tutorials/code-flow
// Step 1: Request user authorization
app.get("/login", (req, res) => {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: clientId,
        scope:
          "user-read-private user-read-email user-top-read user-read-recently-played",
        redirect_uri: redirectUri,
        state: generateRandomString(16),
      })
  );
});

let accessToken;

// Step 2: Obtain an access token after successful user authorization
app.get("/callback", async (req, res) => {
  // Check proper state was returned
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!state) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        {
          code: code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
          },
        }
      );
      accessToken = response.data.access_token;
      res.redirect("http://localhost:3000/");
    } catch {
      res
        .status(500)
        .json({ error: "Failed to exchange authorization code for tokens" });
    }
  }
});

app.get("/accessToken", (req, res) => {
  if (accessToken) {
    res.json({
      accessToken: accessToken,
    });
  }
});

// Start the express server
app.listen(port, () => {});
