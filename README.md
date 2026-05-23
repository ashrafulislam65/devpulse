# DevPulse API

DevPulse is a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

https://your-live-link.com

## GitHub Repository

https://github.com/yourusername/devpulse

---

## Features

- User Registration & Login
- JWT Authentication & Authorization
- Role-based access control (Contributor / Maintainer)
- Create Issue (Bug / Feature Request)
- Get All Issues with Sorting & Filtering
- Get Single Issue Details
- Update Issue with Permission Rules
- Delete Issue (Maintainer Only)
- PostgreSQL Database Integration
- Raw SQL Queries using `pool.query()`

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- JWT (`jsonwebtoken`)
- bcrypt
- Raw SQL (`pg`)
- dotenv

---

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/devpulse.git
```

### 2. Move to Project Folder

```bash
cd devpulse
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### 5. Run the Server

Development Mode:

```bash
npm run dev
```

Production Build:

```bash
npm run build
npm start
```

---

## API Endpoints

### Authentication APIs

#### Register User

```http
POST /api/auth/signup
```

Request Body:

```json
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "12345678",
  "role": "contributor"
}
```

#### Login User

```http
POST /api/auth/login
```

Request Body:

```json
{
  "email": "john@test.com",
  "password": "12345678"
}
```

---

### Issue APIs

#### Create Issue

```http
POST /api/issues
```

Headers:

```txt
Authorization: JWT_TOKEN
```

Request Body:

```json
{
  "title": "Database issue",
  "description": "Database timeout issue under load",
  "type": "bug"
}
```

---

#### Get All Issues

```http
GET /api/issues
```

Query Parameters:

```txt
sort=newest | oldest
type=bug | feature_request
status=open | in_progress | resolved
```

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

---

#### Get Single Issue

```http
GET /api/issues/:id
```

Example:

```http
GET /api/issues/1
```

---

#### Update Issue

```http
PATCH /api/issues/:id
```

Headers:

```txt
Authorization: JWT_TOKEN
```

Request Body:

```json
{
  "title": "Updated issue title",
  "description": "Updated description",
  "type": "bug"
}
```

---

#### Delete Issue

```http
DELETE /api/issues/:id
```

Headers:

```txt
Authorization: JWT_TOKEN
```

---

## Database Schema Summary

### Users Table

| Field | Description |
|--------|-------------|
| id | Auto increment primary key |
| name | User full name |
| email | Unique email |
| password | Hashed password |
| role | contributor / maintainer |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

### Issues Table

| Field | Description |
|--------|-------------|
| id | Auto increment primary key |
| title | Issue title |
| description | Issue description |
| type | bug / feature_request |
| status | open / in_progress / resolved |
| reporter_id | Reporter user id |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

## Role Permissions

### Contributor

- Register & Login
- Create Issue
- View Issues
- Update Own Issue (only when status = open)

### Maintainer

- All contributor permissions
- Update Any Issue
- Delete Any Issue

---

## Author

**Md. Ashraful Islam**  
BSc in CSE, American International University-Bangladesh (AIUB)
