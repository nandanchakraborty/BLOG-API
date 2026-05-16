# Blog API Documentation

## 📘 Project Overview

The Blog API is a full-featured backend application built using Node.js, Express.js, and PostgreSQL. The project provides authentication, post management, comments, likes, saved posts, categories, image uploads, and search functionality.

This project was created to practice real-world backend development concepts including:

* REST API Design
* Authentication with JWT
* PostgreSQL Database Design
* File Upload Handling
* Middleware Usage
* CRUD Operations
* Pagination
* Search Systems
* Admin Route Management

---

# 🛠️ Tech Stack

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime Environment |
| Express.js | Backend Framework   |
| PostgreSQL | Database            |
| JWT        | Authentication      |
| Multer     | Image Upload        |
| bcrypt     | Password Hashing    |
| Postman    | API Testing         |

---

# 📂 Project Structure

```text
project/
│
├── public/
│   ├── uploads/
│   └── create-post.html
│
------ ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
├── server/
│  
│   │
│   ├── route/
│   │   ├── userHandler.js
│   │   ├── adminHandler.js
│   │   └── postHandler.js
│   │
│   ├── db.js
│   └── utils/
│
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=your_postgresql_connection_url
JWT_SECRET=your_secret_key
```

---

# ▶️ Running the Project

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
npm start
```

## Development Mode

```bash
npm run dev
```

---

# 🔐 Authentication System

The project uses JWT authentication.

## Login Flow

1. User logs in with email and password.
2. Backend verifies credentials.
3. JWT token is generated.
4. Token is returned to frontend.
5. Frontend sends token in Authorization header.

## Authorization Header

```text
Authorization: Bearer <token>
```

## Auth Middleware

The middleware:

* Verifies JWT token
* Extracts user information
* Adds user id to `req.id`
* Protects private routes

---

# 🗄️ Database Design

## Users Table

| Column     | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| username   | VARCHAR            |
| email      | VARCHAR            |
| password   | TEXT               |
| role       | VARCHAR            |
| created_at | TIMESTAMP          |

---

## Posts Table

| Column         | Type               |
| -------------- | ------------------ |
| id             | SERIAL PRIMARY KEY |
| user_id        | INTEGER            |
| title          | TEXT               |
| slug           | TEXT               |
| content        | TEXT               |
| status         | VARCHAR            |
| category_id    | INTEGER            |
| featured_image | TEXT               |
| like_count     | INTEGER            |
| comment_count  | INTEGER            |
| view_count     | INTEGER            |
| created_at     | TIMESTAMP          |
| updated_at     | TIMESTAMP          |

---

## Categories Table

| Column | Type               |
| ------ | ------------------ |
| id     | SERIAL PRIMARY KEY |
| name   | VARCHAR            |
| slug   | VARCHAR            |

---

## Comments Table

| Column     | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| user_id    | INTEGER            |
| post_id    | INTEGER            |
| content    | TEXT               |
| created_at | TIMESTAMP          |

---

## Post Likes Table

| Column     | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| user_id    | INTEGER            |
| post_id    | INTEGER            |
| created_at | TIMESTAMP          |

---

## Saved Posts Table

| Column   | Type               |
| -------- | ------------------ |
| id       | SERIAL PRIMARY KEY |
| user_id  | INTEGER            |
| post_id  | INTEGER            |
| saved_at | TIMESTAMP          |

---

# 📝 API Endpoints

# 👤 Authentication

## Register User

### Route

```http
POST /register
```

### Request Body

```json
{
  "username": "john",
  "email": "john@gmail.com",
  "password": "123456"
}
```

---

## Login User

### Route

```http
POST /login
```

### Request Body

```json
{
  "email": "john@gmail.com",
  "password": "123456"
}
```

---

# 📝 Posts API

## Create Post

### Route

```http
POST /user/posts
```

### Content Type

```text
multipart/form-data
```

### Fields

| Field       | Type |
| ----------- | ---- |
| title       | text |
| content     | text |
| status      | text |
| category_id | text |
| image       | file |

### Features

* Slug generation
* Image upload
* Count initialization
* JWT protected route

---

## Get All Posts

```http
GET /posts
```

---

## Get Single Post

```http
GET /posts/:id
```

---

## Update Post

```http
PATCH /posts/:id
```

---

## Delete Post

```http
DELETE /posts/:id
```

---

# 💬 Comments API

## Add Comment

```http
POST /comments/:postId
```

### Features

* Adds comment
* Automatically increases comment_count

---

## Get Comments

```http
GET /comments/:postId?page=1&limit=5
```

### Features

* Pagination
* Newest comments first

---

## Update Comment

```http
PATCH /comments/:id
```

---

## Delete Comment

```http
DELETE /comments/:id
```

---

# ❤️ Like System

## Like Post

```http
POST /like/:postId
```

### Features

* Adds mapping in post_likes table
* Increases like_count

---

## Unlike Post

```http
DELETE /like/:postId
```

### Features

* Removes mapping
* Decreases like_count

---

# 🔖 Saved Posts

## Save Post

```http
POST /save/:postId
```

---

## Unsave Post

```http
DELETE /save/:postId
```

---

## Get Saved Posts

```http
GET /saved-posts
```

---

# 📂 Categories API

## Get Categories

```http
GET /categories
```

---

## Create Category

```http
POST /admin/categories
```

---

## Update Category

```http
PATCH /admin/categories/:id
```

---

## Delete Category

```http
DELETE /admin/categories/:id
```

---

# 🔍 Search System

## Search Posts

```http
GET /search/:q
```

### Example

```http
/search/postgresql
```

### Features

* Searches title
* Searches content
* Uses PostgreSQL ILIKE
* Case-insensitive search

---

# 🖼️ Image Upload System

The project uses Multer for image uploads.

## Upload Folder

```text
/public/uploads/
```

## Image Validation

Allowed types:

* jpg
* jpeg
* png
* webp

## File Size Limit

```text
2MB
```

## Database Storage

Only image path is stored:

```text
/uploads/filename.jpg
```

---

# 📊 Counters System

The posts table automatically tracks:

* like_count
* comment_count
* view_count

## View Count Logic

Each time a post is viewed:

```sql
UPDATE posts
SET view_count = view_count + 1
WHERE id = $1;
```

---

# 🧠 Slug Generation

The slug is generated automatically from title.

## Example

```text
Building Blog API with Express
↓
building-blog-api-with-express
```

---

# 🛡️ Validation Rules

The project validates:

* Required fields
* Duplicate users
* Image types
* JWT tokens
* Authenticated access

---

# 🚀 Future Improvements

* Cloudinary image upload
* Redis caching
* Swagger documentation
* Role-based permissions
* Full-text search
* Notifications system
* Real-time comments
* Docker deployment
* Unit testing

---

# 👨‍💻 Learning Outcomes

This project helped practice:

* Express routing
* PostgreSQL queries
* Database relationships
* JWT authentication
* Middleware creation
* File handling
* REST API architecture
* Pagination and search
* Real-world backend workflow

---

# 📌 Conclusion

The Blog API project demonstrates a complete backend architecture for a modern blogging platform using Node.js, Express.js, and PostgreSQL. The project includes authentication, image uploads, CRUD operations, comments, likes, search, and database relationships commonly used in real-world applications.
