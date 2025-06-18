const userModel = require("../Models/UserModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET  // Using the same secret key as in auth.js


exports.Signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body

    const isMailExists = await userModel.findOne({ email })

    if (isMailExists) {
      return res.status(409).json({ status: false, message: "Email already exists" })
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt)

    const signData = new userModel({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: 'admin' // Set role to admin
    })
    const saveData = await signData.save()

    return res.status(201).json({ success: true, message: "Admin sign up successfully", data: saveData })
  } catch (error) {
    console.log("Admin sign up failed :", error);
    return res.status(400).json({ success: false, message: "Sign up failed" })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email, role: 'admin' })

    if (!user) {
      return res.status(404).json({ message: "Admin account not found" })
    }

    if (user.isDisabled) {
      return res.status(404).json({ message: "Access revoked" })
    }

    const dbPassword = user.password;
    const isMatch = bcrypt.compareSync(password, dbPassword)

    if (!isMatch) {
      return res.status(404).json({ success: false, message: "Password is incorrect" })
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    }
    const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

    return res.status(201).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      }
    })
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}


exports.count = async (req, res) => {
  try {
    const totalAdmin = await userModel.countDocuments({ role: 'admin' });
    return res.status(200).json({ status: true, count: totalAdmin });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to count admins", error: error.message });
  }
}

exports.getAdmins = async (req, res) => {
  try {
    const admins = await userModel.find({ role: 'admin' })

    return res.status(200).json({
      success: true,
      message: "Admins data fetched successfully",
      AdminData: admins
    });
  } catch (error) {
    console.log("--------get admins---------", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Admins" });
  }
}

exports.toggleAccess = async (req, res) => {
  try {
    const { adminId, isDisabled } = req.body;

    if (!adminId) {
      return res.status(400).json({ success: false, message: "Admin ID is required" });
    }

    const updatedAdmin = await userModel.findByIdAndUpdate(
      adminId,
      { isDisabled },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const status = isDisabled ? "disabled" : "enabled";

    return res.status(200).json({
      success: true,
      message: `Admin access ${status} successfully`,
      admin: updatedAdmin
    });
  } catch (error) {
    console.log("--------toggle admin access---------", error);
    return res.status(500).json({ success: false, message: "Failed to toggle admin access" });
  }
}