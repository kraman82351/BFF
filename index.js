const express = require("express");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001; // BFF port number

app.use(cors());
app.use(express.json());

const backendBaseUrl = "https://claim-management-system.onrender.com"; // Your backend URL

// Middleware to add API key to backend requests
const addApiKey = async (req, res, next) => {
  req.headers["x-api-key"] = process.env.API_KEY;
  next();
};

// Function to proxy request
const proxyRequest = async (req, res, addApiKey = false) => {
  const apiKeyHeader = addApiKey ? { "x-api-key": process.env.API_KEY } : {};
  const url = `${backendBaseUrl}${req.originalUrl}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: { ...apiKeyHeader },
    });
    res.send(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || "Error");
  }
};

// Routes that require API key
app.get("/home/add_insurance", (req, res) => proxyRequest(req, res, true));
app.post("/home/add_insurance", (req, res) => proxyRequest(req, res, true));
app.post("/admin/add_policy", (req, res) =>
  proxyRequest(req, res, true)
);
app.get("/admin/getcount", (req, res) => proxyRequest(req, res, true));
app.post("/home/claim_insurance", (req, res) => proxyRequest(req, res, true));
app.get("/admin/pending_claims", (req, res) => proxyRequest(req, res, true));
app.post("/admin/pending_claims", (req, res) => proxyRequest(req, res, true));

// New routes for proxying requests to the specified backend URLs
app.get("/user/:emailId", (req, res) => proxyRequest(req, res, true));
app.get("/user/policies/:userId", (req, res) => proxyRequest(req, res, true));
app.get("/user/claims/:userId", (req, res) => proxyRequest(req, res, true));
app.get("/user/policies/:userId", (req, res) => proxyRequest(req, res, true));

// Routes that do not require API key
app.post("/adminlogin", (req, res) => proxyRequest(req, res));
app.post("/userlogin", (req, res) => proxyRequest(req, res));
app.post("/register", (req, res) => proxyRequest(req, res));

app.listen(PORT, () => {
  console.log(`BFF running on http://localhost:${PORT}`);
});
