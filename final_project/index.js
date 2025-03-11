const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Authentication middleware for routes under /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the token is present in the session
    const token = req.session.token;
  
    // If there's no token, send a 401 Unauthorized response
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    // Verify the token using JWT
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        // If verification fails, send a 403 Forbidden response
        return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
      }
  
      // If token is valid, attach the decoded user info to the request
      req.user = decoded;
  
      // Proceed to the next middleware/route handler
      next();
    });
  }); 
  
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
