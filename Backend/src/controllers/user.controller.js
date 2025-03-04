import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import validateMongoDbID from "../utils/validateMongoDBId.js";
import generateRefreshToken from "../config/refreshToken.js";
import generateToken from "../config/jwtToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"


const createUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1️⃣ Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields (firstName, lastName, email, password) are required" });
    }

    // 2️⃣ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 3️⃣ Enforce password strength
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // 4️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // 5️⃣ Create new user
    const newUser = await User.create({ firstName, lastName, email, password });

    return res.status(201).json({
      success: true,
      message: "New User Created Successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error in createUser:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate key error: Email already exists" });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const findUser = await User.findOne({ email });

  if (!findUser) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, findUser.password);

  if (isMatch) {
    const refreshToken = await generateRefreshToken(findUser.id);

    // Update refreshToken in database
    await User.findByIdAndUpdate(findUser._id, { refreshToken }, { new: true });

    // Set refreshToken in cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 days
    });

    // Send complete user info (excluding password)
    res.json({
      _id: findUser._id,
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      email: findUser.email,
      token: generateToken(findUser._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});


const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const userId = req.user.id; // Assuming authentication middleware sets req.user

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user details
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;

  // If password is provided, hash it before saving
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    message: "User updated successfully",
  });
});




// Get ALL the Users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json({ getUsers, message: "All Users Fetched" });
  } catch (error) {
    console.log("Error in getAllUsers Controller");
    throw new Error(error);
  }
});





const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  // console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error(" No Refresh token present in db or not matched");
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    console.log(decoded);
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });

  res.json(user);
});

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.json(204, { message: "User Logged Out Successfully" }); // forbidden
});

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure `req.user.id` exists
    console.log(userId)

    // If userId doesn't exist, return a bad request error
    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    // Optional: Delete any related data (e.g., URLs associated with the user)
    const deleteUrls = await MongoURL.deleteOne({ userId });

    // Now delete the user from the database
    const user = await User.findByIdAndDelete(userId);

    if (user) {
      // Optionally log out the user and clear their session data if necessary
      res.status(200).json({ message: "User and related data deleted successfully" });
    } else {
      res.status(400).json({ error: "Failed to delete user, user not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export {
  createUser,
  loginUser,
  updateUser,
  getAllUsers,
  logout,
  deleteUser,
  handleRefreshToken,
};
