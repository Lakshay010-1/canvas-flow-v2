# Canvas Flow V2

A backend-only social media API for artists, built with **Node.js, Express.js, and PostgreSQL**. It allows users to create and share canvases, interact through likes and comments, and subscribe to creators.

## Features

- **Authentication**
  - User registration and login
  - Session-based authentication
  - OAuth authentication
  - Secure password hashing with bcrypt

- **User Management**
  - User profiles
  - Profile images using Cloudinary
  - User-related APIs

- **Canvas Management**
  - Upload and update canvases
  - Canvas images stored as `BYTEA` in PostgreSQL
  - View counts, timestamps, and ownership

- **Likes & Comments**
  - Like/unlike canvases and comments
  - Create and manage comments
  - Fetch liked canvases and comments

- **Subscriptions**
  - Subscribe/unsubscribe to users
  - View subscribers and subscriptions
  - Check subscription status

- **Security & Middleware**
  - Protected routes with authentication middleware
  - CORS support
  - Centralized error handling
  - Custom API response and error classes

- **Logging**
  - HTTP request logging with Morgan
  - Structured logging with Winston

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JavaScript
- bcrypt
- Passport.js
- OAuth 2.0
- Cloudinary
- Morgan
- Winston

## Run Locally

```bash
npm install
npm start
```

Configure the required environment variables and make sure PostgreSQL is running before starting the backend.
