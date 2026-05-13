const express = require("express");
const router = express.Router();
const pool = require("../../Database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminMiddleware = require("../../middleware/adminMiddleware");
const Users = require("./userHandler");
const authMiddleware = require("../../middleware/authMiddleware");
//categories table create
// router.get('/setup', async(req,res)=>{

//     try{

//         const query = `
//     CREATE TABLE categories (id SERIAL PRIMARY KEY,name VARCHAR(100) UNIQUE NOT NULL,
//     slug VARCHAR(120) UNIQUE NOT NULL);`;

//         await pool.query(query);

//         res.status(200).json({
//             message : 'Category table created successfully'
//         });

//     }catch(err){

//         console.log(err);

//         res.status(500).json({
//             error : 'Setup failed'
//         });

//     }

// });
router.post("/admin-register", async (req, res) => {
	const password = await bcrypt.hash(req.body.password, 10);
	const { username, role, email } = req.body;

	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!regex.test(email)) {
		return res.status(500).json({
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
		res.status(200).send({ message: "admin inserted successfully" });
	} catch (err) {
		console.log(err);
		res.status(500).send({ message: "" });
	}
});
router.post("/admin-login", async (req, res) => {
	const { role, password } = req.body;
	console.log(req.body);
	const result = await pool.query("SELECT * FROM users WHERE role = $1", [
		role,
	]);

	const user = result.rows[0];

	// check user exists
	if (!role) {
		return res.status(404).json({
			error: "authentication failed",
		});
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (isMatch) {
		const token = jwt.sign(
			{
				role: role,
				id: user.id,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "2h",
			},
		);
		res.status(200).json({
			access_token: token,
			message: "login successfull",
		});
	} else {
		res.status(401).json({ error: "authentication failed" });
	}
});
router.post("/create-categories", adminMiddleware, async (req, res) => {
	const { name, slug } = req.body;
	try {
		await pool.query(
			`INSERT INTO categories (name, slug)
VALUES ($1, $2);`,
			[name, slug],
		);
		res.status(200).json({ message: "category inserted successfull" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});
router.get("/categories", adminMiddleware, async (req, res) => {
	try {
		const data = await pool.query(
			`SELECT * FROM categories ORDER BY id DESC;`,
		);
		res.status(200).json({
			data: data.rows,
			message: "data fetch successfull",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});

router.post("/patch-category/:id", adminMiddleware, async (req, res) => {
	const { name, slug } = req.body;
	const id = req.params.id;
	try {
		const query = `UPDATE categories SET  name = $1, slug = $2 WHERE id = $3;`;
		const values = [name, slug, id];
		await pool.query(query, values);

		res.status(200).json({ message: "updated successfull" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});
router.delete("/delete-category/:id", adminMiddleware, async (req, res) => {
	const id = req.params.id;

	try {
		const query = `DELETE FROM categories WHERE id = $1;`;
		const values = [id];
		await pool.query(query, values);

		res.status(200).json({ message: "Deleted successfull" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "internal server error" });
	}
});
//admin getting all post
router.get("/view-posts", adminMiddleware, async (req, res) => {
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
router.patch("/admin/posts/:id", adminMiddleware, async (req, res) => {
	try {
		const { id } = req.params;
		const { title, content, slug, status } = req.body;

		const query = `
            UPDATE posts
            SET title = $1,
                content = $2,
                slug = $3,
                status = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
        `;

		const values = [title, content, slug, status, id];

		const result = await pool.query(query, values);

		if (result.rowCount === 0) {
			return res.status(404).json({
				error: "Post not found",
			});
		}

		res.status(200).json({
			message: "Post updated successfully",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			error: "internal server error",
		});
	}
});
router.get("/admin/post/:category", adminMiddleware, async (req, res) => {
	const categories = req.params.category;
	try {
		const query = `SELECT posts.* FROM posts
                    JOIN categories ON posts.category_id = categories.id WHERE categories.name = $1 `;

		const values = [categories];

		const data = await pool.query(query, values);
		if (data.length > 0) {
			res.status(200).json({
				data: data.rows,
				message: "data fetch successfull",
			});
		} else {
			res.status(200).json("No data available");
		}
	} catch (err) {}
});

module.exports = router;
