const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { checkRecordExists, insertRecord, selectRecord, updateRecord } = require("../utils/sqlFunctions");
const { customResponse } = require("../utils/customResponse");
const crypto = require("crypto");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/emailService");
// const { getRecordByField } = require("../utils/profileHepler");

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET);
};

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdBy = name;

    const user = {
        uuid: uuidv4(),
        name,
        email,
        password: hashedPassword,
        created_by: createdBy,
    };

    try {
        const userAlreadyExists = await checkRecordExists("users", "email", email);
        if (userAlreadyExists) {
            customResponse("Email already exists", 409, false)(req, res);
        } else {
            await insertRecord("users", user);

            // Send welcome email (optional - don't block registration if email fails)
            try {
                await sendWelcomeEmail(email, name);
            } catch (emailError) {
                console.log("Welcome email failed, but registration successful:", emailError.message);
            }

            customResponse("User created successfully", 201, true)(req, res);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await checkRecordExists("users", "email", email);

        if (existingUser) {
            if (!existingUser.password) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, existingUser.password);

            if (passwordMatch) {
                const payload = {
                    uuid: existingUser.uuid,
                    user_id: existingUser.id,
                };
                res.status(200).json({
                    uuid: existingUser.uuid,
                    user_id: existingUser.id,
                    email: existingUser.email,
                    access_token: generateAccessToken(payload),
                });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const existingUser = await checkRecordExists("users", "email", email);
        if (!existingUser) {
            // Don't reveal if email exists or not for security
            return customResponse("If the email exists, an OTP has been sent", 200, true)(req, res);
        }

        // Generate 6-digit OTP
        const otpCode = generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

        // Update user with OTP details
        await updateRecord(
            "users",
            {
                otp_code: otpCode,
                otp_expires_at: expiresAt,
                otp_verified: 0,
                reset_token: null, // Clear any existing reset token
            },
            "uuid",
            existingUser.uuid
        );

        // Send OTP email using nodemailer
        const emailResult = await sendOTPEmail(email, otpCode, existingUser.name);

        if (emailResult.success) {
            console.log(`✓ OTP sent successfully to ${email}`);
            return customResponse("OTP sent to your email address", 200, true)(req, res);
        } else {
            console.error(`✗ Failed to send OTP to ${email}:`, emailResult.message);
            return customResponse("Failed to send OTP email. Please try again.", 500, false)(req, res);
        }
    } catch (error) {
        console.error("Forgot password error:", error);
        return customResponse("Failed to process forgot password request", 500, false)(req, res);
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp_code } = req.body;

        // Find user with valid OTP
        const user = await selectRecord(
            `SELECT * FROM users 
       WHERE email = ? AND otp_code = ? AND otp_expires_at > NOW() AND is_deleted = 0
       LIMIT 1`,
            [email, otp_code]
        );

        if (user.length === 0) {
            return customResponse("Invalid or expired OTP", 400, false)(req, res);
        }

        const userRecord = user[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Update user with reset token and mark OTP as verified
        await updateRecord(
            "users",
            {
                reset_token: resetToken,
                otp_verified: 1,
            },
            "uuid",
            userRecord.uuid
        );

        return res.status(200).json({
            message: "OTP verified successfully",
            status: 200,
            success: true,
            data: {
                reset_token: resetToken,
            },
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return customResponse("Failed to verify OTP", 500, false)(req, res);
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { reset_token, new_password } = req.body;

        // Find user with valid reset token
        const user = await selectRecord(
            `SELECT * FROM users 
            WHERE reset_token = ? AND otp_verified = 1 AND otp_expires_at > NOW() AND is_deleted = 0
            LIMIT 1`,
            [reset_token]
        );

        if (user.length === 0) {
            return customResponse("Invalid or expired reset token", 400, false)(req, res);
        }

        const userRecord = user[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        // Update user password and clear reset fields
        await updateRecord(
            "users",
            {
                password: hashedPassword,
                otp_code: null,
                otp_expires_at: null,
                reset_token: null,
                otp_verified: 0,
            },
            "uuid",
            userRecord.uuid
        );

        return customResponse("Password reset successfully", 200, true)(req, res);
    } catch (error) {
        console.error("Reset password error:", error);
        return customResponse("Failed to reset password", 500, false)(req, res);
    }
};


const logout = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    // Just respond with success — token remains valid until it expires
    return res.status(200).json({ message: "Logged out successfully" });
};

//get profile
const getProfile = async (req, res) => {
    const uuid = req.user.uuid; // Assumes JWT middleware sets req.user

    const query = `
        SELECT JSON_OBJECT(
        'uuid', u.uuid,
        'name', u.name,
        'email', u.email,
        'contact', u.contact,
        'address', u.address,
        'country', u.country,
        'dob', u.dob,
        'account_status', u.account_status,
        'avatar_path', u.avatar_path,
        'created_at', u.created_at,
        'updated_at', u.updated_at,
        'end_date', us.end_date,
        'current_plan', us.plan_id,
        'subscription_status', us.status,
        'open_Ai_searches', us.searches_used,
        'open_Ai_total_searches', us.total,
        'searches_remaining', us.searches_remaining,
        'total_searches_made', COALESCE(sh.total_searches, 0),
        'plan_details', JSON_OBJECT(
            'id', p.id,
            'name', p.name,
            'price', p.price,
            'duration_days', p.duration_days,
            'search_limit', p.search_limit,
            'features', p.features
        )
        ) AS profile
        FROM users u
        LEFT JOIN (
        SELECT us1.*, us2.total
        FROM user_subscriptions us1
        INNER JOIN (
            SELECT user_uuid, MAX(created_at) AS max_created_at, SUM(searches_used) AS total
            FROM user_subscriptions
            GROUP BY user_uuid
        ) us2 ON us1.user_uuid = us2.user_uuid AND us1.created_at = us2.max_created_at
        ) us ON u.uuid = us.user_uuid
        LEFT JOIN subscription_plans p ON us.plan_id = p.id
        LEFT JOIN (
        SELECT user_uuid, COUNT(*) AS total_searches
        FROM search_history
        GROUP BY user_uuid
        ) sh ON u.uuid = sh.user_uuid
        WHERE u.uuid = ?
        AND u.is_deleted = 0
        LIMIT 1;
    `

    try {
        // Pass uuid as parameter to the query
        const results = await selectRecord(query, [uuid]);

        if (!results || results.length === 0 || !results[0].profile) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
        }

        // Parse the JSON_OBJECT result
        const profileData = typeof results[0].profile === 'string'
            ? JSON.parse(results[0].profile)
            : results[0].profile;

        return res.status(200).json({
            status: 200,
            success: true,
            data: profileData,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};

// update profile

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.uuid; // ✅ Fixed here
        const updateData = { ...req.body };

        const existingUser = await checkRecordExists("users", "uuid", userId, "is_deleted = 0");
        if (!existingUser) {
            return customResponse("User not found", 404, false)(req, res);
        }

        // Check for duplicate contact number if updating contact
        if (updateData.contact && updateData.contact !== existingUser.contact) {
            const duplicateContact = await checkRecordExists("users", "contact", updateData.contact, "is_deleted = 0 AND uuid != ?", [userId]);
            if (duplicateContact) {
                return customResponse("Contact number already exists", 409, false)(req, res);
            }
        }

        await updateRecord("users", updateData, "uuid", userId);

        return customResponse("Profile updated successfully", 200, true)(req, res);
    } catch (error) {
        console.error("Update profile error:", error);
        return customResponse("Failed to update profile", 500, false)(req, res);
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    updateProfile,
    getProfile,
};
