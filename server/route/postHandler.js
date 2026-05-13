const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
const authMiddleware = require("../../middleware/authMiddleware");

//query for creating post_likes table AND SAVE POST
// CREATE TABLE post_likes (
//     id SERIAL PRIMARY KEY,

//     user_id INTEGER NOT NULL,
//     post_id INTEGER NOT NULL,

//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//     CONSTRAINT fk_user
//         FOREIGN KEY (user_id)
//         REFERENCES users(id)
//         ON DELETE CASCADE,

//     CONSTRAINT fk_post
//         FOREIGN KEY (post_id)
//         REFERENCES posts(id)
//         ON DELETE CASCADE,

//     CONSTRAINT unique_user_post_like
//         UNIQUE(user_id, post_id)
// );

//table for save post
// CREATE TABLE saved_posts (

//     id SERIAL PRIMARY KEY,

//     user_id INTEGER NOT NULL,
//     post_id INTEGER NOT NULL,

//     saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//     CONSTRAINT fk_saved_user
//         FOREIGN KEY (user_id)
//         REFERENCES users(id)
//         ON DELETE CASCADE,

//     CONSTRAINT fk_saved_post
//         FOREIGN KEY (post_id)
//         REFERENCES posts(id)
//         ON DELETE CASCADE,

//     CONSTRAINT unique_saved_post
//         UNIQUE(user_id, post_id)

// );

//getting all post
router.get("/blog-home", authMiddleware, async (req, res) => {
	try {
		const data = await pool.query(`SELECT * FROM posts;`);
		res.status(200).json({
			data: data.rows,
			message: "successfull",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

router.post("/view-count/:id", authMiddleware, async (req, res) => {
	const id = req.params.id;
	try {
		await pool.query(
			`UPDATE posts SET view_count = view_count + 1 WHERE id = $1;`,
			[id],
		);
		res.status(200).json({ message: "successfull" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

//like count route

router.post("/posts/:id/like", authMiddleware, async (req, res) => {
	const post_id = req.params.id;
	const user_id = req.id;

	try {
		// 1. insert like mapping
		await pool.query(
			`INSERT INTO post_likes (user_id, post_id)
         VALUES ($1, $2)`,
			[user_id, post_id],
		);

		// 2. increase like count
		await pool.query(
			`UPDATE posts
         SET like_count = like_count + 1
         WHERE id = $1`,
			[post_id],
		);

		res.status(200).json({
			message: "Post liked successfully",
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "internal server error",
		});
	}
});

// remove like route
router.delete("/posts/:id/like", authMiddleware, async (req, res) => {
	const post_id = req.params.id;
	const user_id = req.id;

	try {
		// 1. remove like mapping
		await pool.query(
			`DELETE FROM post_likes WHERE user_id =$1 AND post_id = $2`,
			[user_id, post_id],
		);

		// 2. increase like count
		await pool.query(
			`UPDATE posts
         SET like_count = GREATEST (like_count -1,0)
         WHERE id = $1`,
			[post_id],
		);

		res.status(200).json({
			message: "Post deleted successfully",
		});
	} catch (err) {
		console.log(err);

		res.status(500).json({
			error: "internal server error",
		});
	}
});

//save post route
router.post("/posts/:id/save", authMiddleware, async (req, res) => {
	const post_id = req.params.id;
	const user_id = req.id;
	try {
		const query = `INSERT INTO saved_posts( user_id,post_id) VALUES($1 ,$2)`;
		const values = [user_id, post_id];
		const data = await pool.query(query, values);
		if (data.length > 0) {
			res.status(200).json({ message: " save post removed" });
		} else {
			res.status(200).json({ message: " There was no data" });
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: "internal server error" });
	}
});

//delete save post
router.delete("/posts/:id/save", authMiddleware, async (req, res) => {
	const post_id = req.params.id;
	const user_id = req.id;
	try {
		const query =
			"DELETE FROM saved_posts WHERE post_id = $1 and user_id = $2";
		const values = [post_id, user_id];
		const data = await pool.query(query, values);
		if (data.length > 0) {
			res.status(200).json({ message: " save post removed" });
		} else {
			res.status(200).json({ message: " There was no data" });
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({ message: "internal server error" });
	}
});

//getting all saved post of a user
router.get("/me/saved-posts", authMiddleware, async (req, res) => {
	const user_id = req.id;
	try {
		const query = `SELECT posts.* FROM saved_posts JOIN posts ON posts.id = saved_posts.post_id
                        WHERE saved_posts.user_id = $1;`;
		const values = [user_id];
		const data = await pool.query(query, values);
		if (data.length > 0) {
			res.status(200).json({
				data: data.rows,
				message: " data fetch successfull",
			});
		} else {
			res.status(200).json({ message: "no data available" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "internal server error" });
	}
});

//save route not tested;

module.exports = router;
