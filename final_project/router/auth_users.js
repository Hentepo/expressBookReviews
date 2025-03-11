const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if the username exists in the users array
  return users.some(user => user.username === username);
};

const isAuthenticated = (username, password) => {
  // Check if the username and password match any user in the users array
  return users.some(user => user.username === username && user.password === password);
};

// Customer login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    // Validate if the user exists and the password is correct
    if (isValid(username)) {
      if (isAuthenticated(username, password)) {
        // Generate a JWT token for the user
        const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
  
        // Save the token to the session or send it in the response
        return res.status(200).json({
          message: "Login successful",
          token: token
        });
      } else {
        return res.status(401).json({ message: "Invalid username or password" });
      }
    } else {
      return res.status(401).json({ message: "User not found" });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  // Find the book by ISBN
  const book = books[isbn]; // or use books.find(b => b.isbn === isbn) if books is an array
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // If the book has a reviews object, add the new review
  if (!book.reviews) {
    book.reviews = [];
  }

  // Add the new review
  book.reviews.push(review);

  return res.status(200).json({
    message: "Review added successfully",
    book
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn/:reviewIndex", (req, res) => {
  const { isbn, reviewIndex } = req.params;  // Get ISBN and review index from params

  // Find the book by ISBN
  const book = books.find(b => b.isbn === isbn); // or use books[isbn] if books is an object with ISBN as keys
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has a reviews array
  if (!book.reviews || book.reviews.length === 0) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }

  // Ensure the review index is valid
  const index = parseInt(reviewIndex, 10); // Convert the index from string to integer
  if (isNaN(index) || index < 0 || index >= book.reviews.length) {
    return res.status(400).json({ message: "Invalid review index" });
  }

  // Remove the review from the reviews array
  book.reviews.splice(index, 1);  // This will remove one element at the specified index

  return res.status(200).json({
    message: "Review deleted successfully",
    book
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
