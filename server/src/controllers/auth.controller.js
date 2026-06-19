const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../config/jwt");
const { sendResetPasswordEmail } = require("../services/email.service");
const crypto= require("crypto");

const registerUser= async(req, res) => {
    try {
        const { name, email, password } = req.body;

        const validations = [
            {
                condition: !name || !email || !password,
                message: "Please provide name, email and password"
            },
            {
                condition: name?.trim().length < 2,
                message: "Name must be at least 2 characters"
            },
            {
                condition: !/\S+@\S+\.\S+/.test(email),
                message: "Invalid email address"
            },
            {
                condition: password?.length < 8,
                message: "Password must be at least 8 characters"
            },
            {
                condition: !/(?=.*[A-Z])/.test(password),
                message: "Password must contain at least one uppercase letter"
            },
            {
                condition: !/(?=.*[a-z])/.test(password),
                message: "Password must contain at least one lowercase letter"
            },
            {
                condition: !/(?=.*[0-9])/.test(password),
                message: "Password must contain at least one number"
            },
            {
                condition: !/(?=.*[@$!%*?&])/.test(password),
                message: "Password must contain at least one special character"
            }
        ];

        const validationError = validations.find(validation => validation.condition);

        if (validationError) {
            return res.status(400).json({success: false, message: validationError.message});
        }

        const existingUser= await User.findOne({ email: email.toLowerCase() });

        if(existingUser) {
            return res.status(400).json({ success: false, message: "User already exists"});
        } 

        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password, salt);

        const user= await User.create({ name, email, password: hashedPassword});

        res.status(201).json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email }});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const loginUser= async(req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password"});
        }

        const emailRegex = /^\S+@\S+\.\S+$/;

        if(!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address"});
        }

        const user= await User.findOne({ email }).select("+password");

        if(!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials"});
        }

        const isMatch= await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials"});
        }

        const token = generateToken(user._id.toString());

        res.status(200).json({ success: true, message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email }});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({success: false, message: "User not found"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendResetPasswordEmail({ email: user.email, userName: user.name, resetUrl})

        return res.status(200).json({success: true, message: "Password reset link has been sent to your email"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "Failed to process forgot password request"});
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({success: false, message: "Invalid or expired token"});
        }

        user.password = await bcrypt.hash(password,10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(200).json({ success: true, message: "Password reset successful"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "Failed to reset password"
        });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };