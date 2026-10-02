const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://day17user:vajeehpochu378707@ac-y8vvtjd-shard-00-00.lesyemr.mongodb.net:27017,ac-y8vvtjd-shard-00-01.lesyemr.mongodb.net:27017,ac-y8vvtjd-shard-00-02.lesyemr.mongodb.net:27017/day17db?ssl=true&replicaSet=atlas-kirwml-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";

const JWT_SECRET =
    process.env.JWT_SECRET || "secretkey";

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err);
    });


app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                msg: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            msg: "User created successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                msg: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                msg: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            msg: "Login successful",
            token
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


function auth(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({
            msg: "No token, access denied"
        });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);

        req.user = verified;

        next();
    } catch (err) {
        res.status(400).json({
            msg: "Invalid token"
        });
    }
}


app.get("/users", auth, async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.json(users);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


app.post("/users", auth, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                msg: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user"
        });

        await newUser.save();

        res.status(201).json({
            msg: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


app.put("/users/:id", auth, async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                role
            },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        res.json({
            msg: "User updated successfully",
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


app.delete("/users/:id", auth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        res.json({
            msg: "User deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});