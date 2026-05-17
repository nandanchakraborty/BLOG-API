# 📘 Blog API (Express + PostgreSQL)

A full-featured backend blog API built with Node.js, Express, and PostgreSQL. It includes authentication, posts, comments, likes, saves, categories, search, pagination, and image upload.

---

## 🚀 Features

- JWT Authentication (login/register)
- CRUD for posts
- Image upload using Multer
- SEO-friendly slug generation
- Comments with pagination
- Like / Unlike system
- Save / Unsave posts
- Category system
- Search posts (title + content)
- View count tracking
- Admin routes support

---

## 🛠️ Tech Stack

Node.js, Express.js, PostgreSQL, JWT, Multer

---

## 📌 Base URL

http://localhost:3000

---

## 🔐 Authentication

All protected routes require:

Authorization: Bearer <token>

---

## 📌 API Endpoints

### Auth
POST /register  
POST /login  

### Posts
POST /user/posts (create post with image)  
GET /posts  
GET /posts/:id  
DELETE /posts/:id  

### Comments
POST /comments/:postId  
GET /comments/:postId?page=&limit=  
PATCH /comments/:id  
DELETE /comments/:id  

### Likes
POST /like/:postId  
DELETE /like/:postId  

### Saved Posts
POST /save/:postId  
DELETE /save/:postId  

### Search
GET /search/:q  

### Categories
GET /categories  
POST /admin/categories  

---

## 🖼️ Image Upload

Stored in: /public/uploads  

DB stores path like:  
/uploads/filename.jpg  

---

## 🧠 Key Logic

Slug example:  
"Hello World Post" → "hello-world-post"

Counters:
- like_count
- comment_count
- view_count

---

## ⚙️ Environment Variables

PORT=3000  
DATABASE_URL=your_postgres_url  
JWT_SECRET=your_secret  

---

## ▶️ Run Project
install all the dependencies from package.json Then:

npm install  
npm start  

---
# Blog API Project

A production-ready RESTful Blog API built using Node.js, Express, and PostgreSQL, fully containerized with Docker and deployed on Render.

## 🚀 Live Production Links
* **API Base URL:** `https://blog-api-bbqz.onrender.com`
* **Interactive API Documentation (Swagger):** `https://blog-api-bbqz.onrender.com/api-docs`

---

## 🛠️ Testing the API via Swagger UI

You do not need Postman or Thunder Client to test this API. You can perform all requests (Register, Login, Create, View) directly from your web browser using the live Swagger documentation.

### 1. Access the Dashboard
Open your browser and navigate to:
👉 [https://blog-api-bbqz.onrender.com/api-docs](https://blog-api-bbqz.onrender.com/api-docs)

### 2. Register a New User (`POST /users/register`)
1. Expand the **`POST /users/register`** section.
2. Click the **"Try it out"** button on the right.
3. Edit the request body JSON with your registration data:
   ```json
   {
     "username": "nandan_dev",
     "email": "nandan@example.com",
     "password": "securepassword123"
   }

## 👨‍💻 Author
Nandan chakraborty(CSE, BUBT)

Built for learning full-stack backend development with Express + PostgreSQL.