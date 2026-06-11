const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../config/jwt");

const registerUser= async(req, res) => {
    try {
        console.log(req.body);
        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide name, email and password"});
        }

        if(name.length < 2) {
            return res.status(400).json({ success: false, message: "Name must be at least 2 characters"});
        }

        if(!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address"});
        }

        if(!/(?=.*[A-Z])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one uppercase letter"});
        }
        if(!/(?=.*[a-z])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one lowercase letter"});
        }
        if(!/(?=.*[0-9])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one number"});
        }
        if(!/(?=.*[@$!%*?&])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one special character"});
        }

        if(password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters"});
        }

        const existingUser= await User.findOne({ email });

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

        if(!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address"});
        }

        if(password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters"});
        }
        if(!/(?=.*[A-Z])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one uppercase letter"});
        }
        if(!/(?=.*[a-z])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one lowercase letter"});
        }
        if(!/(?=.*[0-9])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one number"});
        }
        if(!/(?=.*[@$!%*?&])/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain at least one special character"});
        }

        const user= await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials"});
        }

        const isMatch= await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials"});
        }

        res.status(200).json({ success: true, token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email }});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { registerUser, loginUser };