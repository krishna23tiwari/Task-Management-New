# Task Manager Pro

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing tasks with user authentication, admin panel, and task assignment features.

## Features

- User and Admin authentication (with optional OTP email verification)
- Admin dashboard to manage users, admins, and tasks
- Assign tasks to users, track status (pending/completed), and soft-delete tasks
- Toggle access for users and admins
- Responsive UI built with React, Vite, and Tailwind CSS

## Project Structure

```
Backend/
  Controllers/
  Middleware/
  Models/
  Routes/
  Utils/
  Index.js
  package.json

Frontend/
  src/
    Components/
    api.js
    App.jsx
    main.jsx
    ...
  public/
  index.html
  package.json
  vite.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- npm

### Backend Setup

1. Install dependencies:

   ```sh
   cd Backend
   npm install
   ```

2. Start MongoDB locally (or update `mongoURL` in `Index.js` for Atlas).

3. Start the backend server:

   ```sh
   npm start
   ```

   The backend runs on [http://localhost:5000](http://localhost:5000).

### Frontend Setup

1. Install dependencies:

   ```sh
   cd Frontend
   npm install
   ```

2. Start the frontend dev server:

   ```sh
   npm run dev
   ```

   The frontend runs on [http://localhost:5173](http://localhost:5173) (default Vite port).

### Environment Variables

- Update email credentials in [`Backend/Utils/emailService.js`](Backend/Utils/emailService.js) for OTP functionality.
- Update MongoDB connection string in [`Backend/Index.js`](Backend/Index.js) if needed.

## Usage

- Visit the frontend URL to sign up as a user or log in as an admin.
- Admins can access the dashboard to manage users, admins, and tasks.
- Users can log in and manage their assigned tasks.

## API Endpoints

See the route files in [`Backend/Routes/`](Backend/Routes/) for all available endpoints.

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, Mongoose, JWT, Nodemailer, Moment.js, Bcrypt
- **Database:** MongoDB

## License

This project is for educational purposes.

---

Author: Devesh Jangid
