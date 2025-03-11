const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // If username is available, add the new user to the users array
  const newUser = {
    username,
    password // In a real-world application, the password should be hashed before saving.
  };

  // Save the new user (push into the users array)
  users.push(newUser);

  // Respond with a success message
  return res.status(201).json({ message: "User registered successfully", user: newUser });
});

public_users.get('/', function (req, res) {
  // Create a promise to check if books are available
  const checkBooksAvailability = new Promise((resolve, reject) => {
    if (books && books.length > 0) {
      resolve(books);  // Resolve the promise with the books data if available
    } else {
      reject("No books available");  // Reject the promise if no books are found
    }
  });

  // Handle the promise
  checkBooksAvailability
    .then((books) => {
      // If resolved, send the books as a JSON response
      return res.status(200).json({ message: "Books fetched successfully", books });
    })
    .catch((error) => {
      // If rejected, send an error message
      return res.status(404).json({ message: error });
    });
});

public_users.get('/isbn/:isbn', function (req, res) {
  // Extract ISBN from the request parameters
  const isbn = req.params.isbn;

  // Create a promise to find the book by ISBN
  const findBookByIsbn = new Promise((resolve, reject) => {
    // Find the book in the books array or database based on the ISBN
    const book = books.find(b => b.isbn === isbn);

    if (book) {
      resolve(book);  // Resolve the promise if the book is found
    } else {
      reject("Book not found");  // Reject the promise if the book is not found
    }
  });

  // Handle the promise
  findBookByIsbn
    .then((book) => {
      // If resolved, return the book details as a JSON response
      return res.status(200).json(book);
    })
    .catch((error) => {
      // If rejected, return an error message
      return res.status(404).json({ message: error });
    });
});


// Get all books based on title
// public_users.get('/title/:title', function (req, res) {
//   // Extract title from the request parameters
//   const title = req.params.title.toLowerCase();  // Make the search case-insensitive

//   // Filter the books array based on the title
//   const booksByTitle = books.filter(b => b.title.toLowerCase().includes(title));

//   // If books are found, return them
//   if (booksByTitle.length > 0) {
//     return res.status(200).json(booksByTitle);
//   } else {
//     // If no books are found, return a 404 Not Found response
//     return res.status(404).json({ message: "No books found with this title" });
//   }
// });


 public_users.get('/title/:title', function (req, res) {
  // Extract title from the request parameters
  const title = req.params.title.toLocaleLowerCase();

  // Create a promise to filter the request parameters
  const findBooksByTitle = new Promise((resolve, reject) => {
    // Filter the books array based on the title
    const booksByTitle = books.filter(b => b.title.toLowerCase().includes(title));

    // If title found, resolve the promise with the books
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      // If no books are found, reject the promise with error message
      reject("No books found by this title")
    }
    });

    // Handle the promis
    findBooksByTitle
      .then((booksByTitle) => {
        // If resolver, return the books as a JSON response
        return res.status(200).json({booksByTitle})
      })
      .catch((error) => {
        // If rejected, return an error message
        return res.status(404).json({ message: error })        
      });
  });


public_users.get('/author/:author', function (req, res) {
  // Extract author from the request parameters
  const author = req.params.author.toLowerCase();  // Make the search case-insensitive

  // Create a promise to filter books by the author
  const findBooksByAuthor = new Promise((resolve, reject) => {
    // Filter the books array based on the author's name
    const booksByAuthor = books.filter(b => b.author.toLowerCase().includes(author));

    // If books are found, resolve the promise with the books
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      // If no books are found, reject the promise with an error message
      reject("No books found by this author");
    }
  });

  // Handle the promise
  findBooksByAuthor
    .then((booksByAuthor) => {
      // If resolved, return the books as a JSON response
      return res.status(200).json(booksByAuthor);
    })
    .catch((error) => {
      // If rejected, return an error message
      return res.status(404).json({ message: error });
    });
});


//  Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  // Extract ISBN from the request parameters
  const isbn = req.params.isbn;

  // Find the book in the books array based on the ISBN
  const book = books.find(b => b.isbn === isbn);

  // If the book is found
  if (book) {
    // If the book has reviews, return them
    if (book.reviews && book.reviews.length > 0) {
      return res.status(200).json({ reviews: book.reviews });
    } else {
      // If there are no reviews for this book
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  } else {
    // If the book is not found, return a 404 Not Found error
    return res.status(404).json({ message: "Book not found" });
  }
});

// POST route to add a new book
public_users.post('/add', (req, res) => {
  const { isbn, title, author, reviews } = req.body;
  console.log(books);  // Check the value of books  

  // Validate the input
  if (!isbn || !title || !author || !reviews) {
    return res.status(400).json({ message: "All fields (ISBN, title, author, reviews) are required" });
  }

  // Check if the book already exists based on ISBN
  const existingBook = books.find(book => book.isbn === isbn);
  if (existingBook) {
    return res.status(400).json({ message: "Book with this ISBN already exists" });
  }

  // Create a new book object
  const newBook = { isbn, title, author, reviews };

  // Add the new book to the books array
  books.push(newBook);

  // Respond with a success message and the added book
  return res.status(201).json({ message: "Book added successfully", book: newBook });
});

// Delete a book review
public_users.delete("/auth/review/:isbn/:reviewIndex", (req, res) => {
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

  // Remove the review from the reviews array1
  book.reviews.splice(index, 1);  // This will remove one element at the specified index

  return res.status(200).json({
    message: "Review deleted successfully",
    book
  });
});

// Add a book review
public_users.put("/auth/review/:isbn", (req, res) => {
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

module.exports.general = public_users;
