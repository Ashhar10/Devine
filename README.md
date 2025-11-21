# Devine Water — Water Delivery Management System

A full-stack water delivery management system with authentication, order tracking, delivery management, and payment recording.

## 🚀 Quick Start

### Backend Setup

1. **Prerequisites**
   - Node.js 18+ installed
   - MySQL 8+ installed (or access to a cloud MySQL instance)

2. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE devine_water;
   
   # Import schema
   mysql -u root -p devine_water < server/sql/schema.sql
   ```

3. **Environment Configuration**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DB_PASSWORD`: Your MySQL password
   - `JWT_SECRET`: Generate a strong secret (min 32 chars):
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `ALLOW_ORIGINS`: Your frontend URL(s)

4. **Install Dependencies & Start**
   ```bash
   npm install
   npm run dev  # Development mode
   # OR
   npm start    # Production mode
   ```

### Frontend Setup

1. **Local Development**
   ```bash
   # Serve from project root
   python -m http.server 8000
   # OR
   npx serve -p 8000
   ```
   
   Navigate to: `http://localhost:8000/pages/login.html`

2. **Production (GitHub Pages)**
   - Push code to GitHub
   - Enable GitHub Pages in repository settings
   - Update `config.js` with your backend URL

## 🔑 Default Credentials

**Admin Login**
- Username: `admin`
- Password: `Admin123`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## 🔒 Security Features

- JWT-based authentication with 7-day expiry
- Bcrypt password hashing (10 rounds)
- Rate limiting (5 login attempts per 15 minutes)
- Input validation using Zod schemas
- SQL injection protection via prepared statements
- CORS configuration for cross-origin security
- Helmet.js security headers
- Request size limiting (100kb max)

## 📚 API Documentation

See [`docs/api.md`](docs/api.md) for complete API reference.

## 🧪 Testing

```bash
cd server
npm test
```

## 📦 Deployment

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for step-by-step deployment instructions.

**Quick Deploy:**
- **Backend**: Render.com, Railway.app, or Fly.io
- **Frontend**: GitHub Pages
- **Database**: Render MySQL, PlanetScale, or Railway

## 🏗️ Project Structure

```
├── server/              # Backend Express API
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── middleware/ # Auth, validation, error handling
│   │   └── config.js   # Configuration with validation
│   └── sql/            # Database schema
├── pages/              # Frontend HTML pages
├── assets/             # CSS and JavaScript
│   ├── css/
│   └── js/
└── docs/               # Documentation
```

## 📄 License

Private project - All rights reserved