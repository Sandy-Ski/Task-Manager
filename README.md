# Task Manager REST API 🚀

A secure and scalable REST API for managing personal tasks, built with **Node.js, Express.js, MongoDB, and JWT authentication**.

## ✨ Features

- 🔐 JWT authentication & authorization
- 👤 User-specific task ownership
- 📝 Task CRUD operations
- 🔎 Search, sorting & pagination
- 📊 Task statistics
- 🔑 Password reset via email
- 🛡️ Input validation & rate limiting
- ⚡ MongoDB indexing & query optimization
- 🧯 Centralized error handling
- 🧪 Automated API testing with Jest & Supertest
- 🆔 Request ID tracking & structured logging
- 🔄 Refresh token management

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcrypt  
**Email:** Nodemailer / SMTP  
**Testing:** Jest, Supertest

## 🚀 Getting Started

Follow the steps below to run the project locally.

###  Prerequisites

Make sure the following are installed on your system:

### 1. [Node.js](https://nodejs.org/) — preferably the latest LTS version
### 2. A MongoDB database (MongoDB Atlas or local MongoDB)

### 3. Install Dependencies

   
  npm install

- **express** — Web framework for building the REST API
- **mongoose** — MongoDB ODM for database operations and schemas
- **dotenv** — Loads environment variables from `.env`
- **bcrypt** — Password hashing
- **jsonwebtoken** — JWT authentication
- **nodemailer** — Password reset email delivery
- **cors** — Cross-Origin Resource Sharing
- **helmet** — HTTP security headers
- **express-rate-limit** — API rate limiting
- **swagger-jsdoc** — Generates OpenAPI/Swagger documentation
- **swagger-ui-express** — Serves Swagger API documentation


### Development Dependencies

- **jest** — Automated testing framework
- **supertest** — HTTP/API endpoint testing


### 4. Create a .env file in the project root:
   Add the required variables:

  - MONGODB_URI=your_mongodb_connection_string
  - JWT_SECRET=your_jwt_secret

  - PORT=5000
  - CORS_ORIGIN=http://localhost:5173

  - SMTP_HOST=your_smtp_host
  - SMTP_PORT=your_smtp_port
  - SMTP_SECURE=false
  - SMTP_USER=your_smtp_username
  - SMTP_PASSWORD=your_smtp_password
  - EMAIL_FROM=your_email

## 📁 Project Structure

```text
task-manager-api/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │   ├── main.controller.js
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   │
│   ├── docs/
│   │   ├── main.swagger.js
│   │   ├── task.swagger.js
│   │   └── user.swagger.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── logger.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   ├── request-id.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── models/
│   │   ├── task.model.js
│   │   ├── user.model.js
│   │   ├── refresh-token.model.js
│   │   └── password-reset-token.model.js
│   │
│   ├── routes/
│   │   ├── main.routes.js
│   │   ├── task.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/
│   │   ├── email.service.js
│   │   ├── task.service.js
│   │   └── user.service.js
│   │
│   ├── utils/
│   │   ├── api-error.js
│   │   ├── api-response.js
│   │   ├── async-handler.js
│   │   ├── jwt.js
│   │   ├── password-reset-token.js
│   │   └── refresh-token.js
│   │
│   ├── validators/
│   │   ├── task.validator.js
│   │   └── user.validator.js
│   │
│   └── app.js
│
├── tests/
│   ├── main.test.js
│   └── setup.js
│
├── .env
├── .env.test
├── .gitignore
├── jest.config.js
├── package.json
└── server.js
