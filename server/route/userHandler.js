const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/authMiddleware");

// //creating Database table
// router.get('/setup', async(req,res)=>{

//     try{

//         const query = `
//         CREATE TABLE IF NOT EXISTS users(
//             id SERIAL PRIMARY KEY,
//             username VARCHAR(50) NOT NULL,
//             email VARCHAR(100) NOT NULL UNIQUE,
//             password TEXT NOT NULL,
//             role VARCHAR(20) DEFAULT 'user',
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         );
//         `;

//         await pool.query(query);

//         res.status(200).json({
//             message : 'Users table created successfully'
//         });

//     }catch(err){

//         console.log(err);

//         res.status(500).json({
//             error : 'Setup failed'
//         });

//     }

// });

//======creating post table =========

// router.get('/setup-post', async(req,res)=>{

//     try{

//         const query = `
//         CREATE TABLE posts (

//     id SERIAL PRIMARY KEY,user_id INTEGER NOT NULL,  title VARCHAR(255) NOT NULL,

//     slug VARCHAR(255) UNIQUE NOT NULL, content TEXT NOT NULL,
//      status VARCHAR(20) DEFAULT 'draft',

//     like_count INTEGER DEFAULT 0,
//      view_count DEFAULT 0,

//     comment_count INTEGER DEFAULT 0,

//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//     CONSTRAINT fk_user
//         FOREIGN KEY(user_id)
//         REFERENCES users(id)
//         ON DELETE CASCADE

// );
//         `;

//         await pool.query(query);

//         res.status(200).json({
//             message : 'posts table created successfully'
//         });

//     }catch(err){

//         console.log(err);

//         res.status(500).json({
//             error : 'Setup failed'
//         });

//     }

// });============creating comments table========
// CREATE TABLE comments (

//     id SERIAL PRIMARY KEY,

//     user_id INTEGER NOT NULL,
//     post_id INTEGER NOT NULL,

//     content TEXT NOT NULL,

//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//     CONSTRAINT fk_comment_user
//         FOREIGN KEY (user_id)
//         REFERENCES users(id)
//         ON DELETE CASCADE,

//     CONSTRAINT fk_comment_post
//         FOREIGN KEY (post_id)
//         REFERENCES posts(id)
//         ON DELETE CASCADE

// );

//register route
router.post("/register", async (req, res) => {
	const password = await bcrypt.hash(req.body.password, 10);
	const { username, role, email } = req.body;

	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!regex.test(email)) {
		return res.status(400).json({
			error: "Invalid email format",
		});
	}
	const data = await pool.query("SELECT * FROM users WHERE email = $1", [
		email,
	]);
	if (data.rows.length > 0) {
		res.status(409).json({ error: "user already exist" });
	}

	try {
		await pool.query(
			"INSERT INTO users (username,email,password,role) VALUES ($1, $2,$3,$4)",
			[username, email, password, role],
		);
		res.status(200).send({ message: "User inserted successfully" });
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: "" });
	}
});

//login routes
router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const result = await pool.query("SELECT * FROM users WHERE username = $1", [
		username,
	]);

	const user = result.rows[0];

	// check user exists
	if (!user) {
		console.log(user);

		return res.status(404).json({
			error: "authentication failed",
		});
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (isMatch) {
		const token = jwt.sign(
			{
				username: username,
				id: user.id,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "1h",
			},
		);
		res.status(200).json({
			access_token: token,
			message: "login successfull",
		});
	} else {
		console.log(err);
		res.status(400).json({ error: "authentication failed" });
	}
});
//function for generating slug
function generateSlug(title) {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

//add post by user
router.post("/add-post", authMiddleware, async (req, res) => {
	// console.log("req body",req.body);
	const { title, content, status } = req.body;
	const user_id = req.id;
	//console.log("id  now ",user_id);
	const slug = generateSlug(title);
	if (title === null || content === null) {
		res.send(400).json({ message: "invalid credentials" });
	}

	try {
		await pool.query(
			"INSERT INTO posts (user_id,title,slug,content,status) VALUES ($1, $2,$3,$4,$5)",
			[user_id, title, slug, content, status],
		);
		res.status(201).json({ message: "post created successfully" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "internal server error" });
	}
});

//view all post by a user

router.get("/view-owner-posts", authMiddleware, async (req, res) => {
	try {
		const user_id = req.id;

		const data = await pool.query(
			"SELECT * FROM posts WHERE user_id = $1",
			[user_id],
		);
		res.status(200).json({
			data: data.rows,
			message: "successfull",
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500).json({ error: "internal server error" });
	}
});

//edit post:
router.post("/edit-post/:id", authMiddleware, async (req, res) => {
	const id = req.params.id;
	const user_id = req.id;
	const { title, content, status } = req.body; // title mustbe changed
	const slug = generateSlug(title);
	try {
		const query = `
        UPDATE posts SET title = $1, content = $2, slug = $3,
    status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5  and user_id = $6
`;

		const values = [title, content, slug, status, id, user_id];

		await pool.query(query, values);
		res.status(200).json({ message: "post updated" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

router.post("/delete-post/:id", authMiddleware, async (req, res) => {
	const id = req.params.id;
	const user_id = req.id;
	try {
		const query = `DELETE FROM posts WHERE id = $1 and  user_id = $2`;
		const values = [id, user_id];
		await pool.query(query, values);
		res.status(200).json({ message: "post deleted successfull" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

//profile update

router.patch("/update-profile", authMiddleware, async (req, res) => {
	const id = req.id;
	const { username, email } = req.body;

	if (!username || !email) {
		res.sendStatus(400);
	}
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!regex.test(email)) {
		return res.status(400).json({
			error: "Invalid email format",
		});
	}
	const password = await bcrypt.hash(req.body.password, 10);
	try {
		const query = `UPDATE users SET  username = $1, email = $2, password = $3, updated_at = CURRENT_TIMESTAMP
                  WHERE id = $4`;

		const values = [username, email, password, id];
		await pool.query(query, values);
		res.send(200).json({ message: "profile updated " });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

//comments handler routes
router.post("/posts/:id/comments", authMiddleware, async (req, res) => {
	const user_id = req.id;
	const post_id = req.params.id;
	const { content } = req.body;
	try {
		await pool.query(
			`INSERT INTO comments (user_id, post_id, content)
     VALUES ($1, $2, $3)`,
			[user_id, post_id, content],
		);

		await pool.query(
			`UPDATE posts
     SET comment_count = comment_count + 1
     WHERE id = $1`,
			[post_id],
		);

		res.status(200).json({ message: "comment added" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

router.get("/posts/:id/comments", authMiddleware, async (req, res) => {
	const user_id = req.id;
	const post_id = req.params.id;
	try {
		const limit = 5;
		const page = 1;

		const offset = (page - 1) * limit;

		const data = await pool.query(
			`SELECT *
     FROM comments
     WHERE post_id = $1
     ORDER BY created_at DESC
     LIMIT $2
     OFFSET $3`,
			[post_id, limit, offset],
		);
		if (data.rows.length > 0) {
			res.status(200).json({
				data: data.rows,
				message: "data fetch",
			});
		} else {
			res.status(200).json({ message: "No data available" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

// UPDATE COMMENT
router.patch("/comments/:id", authMiddleware, async (req, res) => {
	const user_id = req.id;
	const comment_id = req.params.id;
	const { content } = req.body;

	try {
		const query = `
            UPDATE comments
            SET content = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            AND user_id = $3
        `;

		const values = [content, comment_id, user_id];

		const data = await pool.query(query, values);

		if (data.rowCount === 0) {
			return res.status(404).json({
				error: "comment not found",
			});
		}

		res.status(200).json({
			message: "comment updated successfully",
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "internal server error",
		});
	}
});

// DELETE COMMENT
router.delete("/comments/:id", authMiddleware, async (req, res) => {
	const user_id = req.id;
	const comment_id = req.params.id;

	try {
		// 1. delete comment
		const data = await pool.query(
			`DELETE FROM comments
             WHERE id = $1
             AND user_id = $2`,
			[comment_id, user_id],
		);

		if (data.rowCount === 0) {
			return res.status(404).json({
				error: "comment not found",
			});
		}

		// 2. decrease comment count
		await pool.query(
			`UPDATE posts
             SET comment_count = GREATEST(comment_count - 1, 0)
             WHERE id = (
                SELECT post_id
                FROM comments
                WHERE id = $1
             )`,
			[comment_id],
		);

		res.status(200).json({
			message: "comment deleted successfully",
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "internal server error",
		});
	}
});

router.get("/search/:q", async (req, res) => {
	const q = req.params.q;
    console.log(q);
	try {
        const limit = 5;
		const page = 1;

		const offset = (page - 1) * limit;

		const data = await pool.query(
			`SELECT *
     FROM posts
     WHERE title ILIKE $1
     OR content ILIKE $1
     ORDER BY created_at DESC`,
			[`%${q}%`,limit,offset],
		);

		if (data.rows.length > 0) {
			res.status(200).json({
				data: data.rows,
				message: "successfull",
			});
		} else {
			res.status(200).json({ message: "No data available" });
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({ error: "Internal server error" });
	}
});



router.get("/view-posts",  async (req, res) => {
	try {
		const user_id = req.id;

		const data = await pool.query(
			"SELECT * FROM posts "
		);
		res.status(200).json({
			data: data.rows,
			message: "successfull",
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500).json({ error: "internal server error" });
	}
});
module.exports = router;
