import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		res.status(400);
		throw new Error("All fields are required !!");
	}

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists !!");
	}

	const newUser = await User.create({ username, email, password });

	const salt = await bcrypt.genSalt(10);
	newUser.password = await bcrypt.hash(password, salt);

	try {
		await newUser.save();

		createToken(res, newUser._id);

		res.status(201).json({
			_id: newUser._id,
			username: newUser.username,
			email: newUser.email,
			isAdmin: newUser.isAdmin,
		});
	} catch (error) {
		res.status(400);
		throw new Error("Invalid user data !");
	}
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		res.status(400);
		throw new Error("All fields are required !!");
	}

	const existingUser = await User.findOne({ email });

	if (!existingUser) {
		res.status(400);
		throw new Error("Invalid credentials !!");
	} else {
		const isMatch = await bcrypt.compare(password, existingUser.password);

		if (!isMatch) {
			res.status(400);
			throw new Error("Invalid Passwprd !!");
		}

		createToken(res, existingUser._id);

		res.status(200).json({
			_id: existingUser._id,
			username: existingUser.username,
			email: existingUser.email,
			isAdmin: existingUser.isAdmin,
		});
	}
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const getAllUsers = asyncHandler(async (req, res) => {

    const allUsers = await User.find({});
    res.status(200).json(allUsers);

});

const updateUserProfile = asyncHandler(async (req, res) => {
	const newDetails = req.body;

	const user = await User.findById(req.user._id);

	if (user) {
		user.username = newDetails.username || user.username;
		user.email = newDetails.email || user.email;

		if (newDetails.password) {
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newDetails.password, salt);
		}

		const updatedUser = await user.save();

		createToken(res, updatedUser._id);

		res.status(200).json({
			_id: updatedUser._id,
			username: updatedUser.username,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
		});
	} else {
		res.status(404);
		throw new Error("User not found !!");
	}
});

const logoutUser = asyncHandler(async (req, res) => {
    if (req.cookies.token) {
        res.clearCookie('token');
        res.status(200).json({ message: "Logged out successfully" });
    } else {
        res.status(400);
        throw new Error("Not logged in !!");
    }
});

const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		await user.remove();
		res.status(200).json({ message: "User removed" });
	} else {
		res.status(404);
		
		throw new Error("User not found !!");
	}
});


export { createUser, loginUser, getUserProfile, updateUserProfile, deleteUser, logoutUser, getAllUsers };
