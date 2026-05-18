const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const {generateOTP,sendOTPEmail,verifyOTP} = require('./userHandler');
const pool = require("../../Database/db");

router.post("/forgot-password", async (req, res) => {
	const { email } = req.body;

	try {
		const userCheck = await pool.query(
			`SELECT * FROM users WHERE email = $1`,
			[email],
		);

		if (userCheck.rows.length === 0) {
			return res.status(200).json({
				message:
					"If that email exists in our system, an OTP has been sent.",
			});
		}

		const otp = generateOTP(email);

		await sendOTPEmail(email, otp);

		return res.status(200).json({
			message:
				"If that email exists in our system, an OTP has been sent.",
		});
	} catch (err) {
		console.error("Forgot Password Error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/reset-password", async (req, res) => {
	const { email, otp, newPassword } = req.body;

	if (!email || !otp || !newPassword) {
		return res.status(400).json({
			error: "Email, OTP, and new password are required.",
		});
	}

	try {
		const isVerified = verifyOTP(email, otp);

		if (!isVerified) {
			return res.status(400).json({
				error: "Invalid or expired OTP code.",
			});
		}

		const userCheck = await pool.query(
			`SELECT * FROM users WHERE email = $1`,
			[email],
		);

		if (userCheck.rows.length === 0) {
			return res.status(404).json({
				error: "User with this email does not exist.",
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await pool.query(
			`UPDATE users 
             SET password = $1 
             WHERE email = $2`,
			[hashedPassword, email],
		);

		return res.status(200).json({
			message:
				"Password reset successful! You can now log in with your new password.",
		});
	} catch (err) {
		console.error("Reset Password Error:", err);
		return res.status(500).json({
			error: "Internal server error",
		});
	}
});

module.exports = router;
