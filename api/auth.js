const express = require("express");
const router = express.Router();

// TODO: Import jwt and JWT_SECRET
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// TODO: createToken
// Define function that takes one parameter id
function createToken(id) {
  /*
  return jwt.sign method from jsonwebtoken library
  creates a new JWT
  Parameters of jwt.sign:
  payload {id}: the data we want to encode in the token
  JWT_SECRET: secret code to sign the token
  Options { expiresIn: "1d" }: optional setting for setting exp for 1 day
  */
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

const prisma = require("../prisma");

// This token-checking middleware should run before any other routes.
// It's the first in this file, and this router is imported first in `server.js`.
router.use(async (req, res, next) => {
  // Grab token from headers only if it exists
  const authHeader = req.headers.authorization;
  // Slice off the first 7 characters (Bearer ), leaving the token
  const token = authHeader?.slice(7); // "Bearer <token>"
  // If there is no token move on to the next middleware
  if (!token) return next();

  // TODO: Find customer with ID decrypted from the token and attach to the request
  try {
    // Decodes the id from the token, using the secret code in env
    // Assigns the id to variable id
    const { id } = jwt.verify(token, JWT_SECRET);
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id },
    });
    // Attach the found customer to the request object
    req.customer = customer;
    // Move to the next middleware
    next();
  } catch (error) {
    next(error);
  }
});

// TODO: POST /register
router.post("/register", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const customer = await prisma.customer.register(email, password);
    const token = createToken(customer.id);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

// TODO: POST /login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const customer = await prisma.customer.login(email, password);
    const token = createToken(customer.id);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

/** Checks the request for an authenticated customer. */
function authenticate(req, res, next) {
  if (req.customer) {
    next();
  } else {
    next({ status: 401, message: "You must be logged in." });
  }
}

// Notice how we export the router _and_ the `authenticate` middleware!
module.exports = {
  router,
  authenticate,
};
