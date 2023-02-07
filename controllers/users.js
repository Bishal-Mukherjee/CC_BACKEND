const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();

// @route POST api/users/signup
// @desc create a new user
// @access Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const isExistingUser = await User.findOne({ email }).select("-password");
    if (isExistingUser) {
      return res.status(200).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = User({
      name,
      email,
      password: hashed,
    });
    await newUser.save();
    return res.status(200).json({ message: "User registered sucsessfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ message: "Error", error: JSON.stringify(err) });
  }
};

// @route POST api/users/signin
// @desc authentication and get token
// @access Public
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Inavlid Credentials");
    }

    if (user.verified) {
      const isMatch = await bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).send("Invalid Password");
      }
      //return jsonwentoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      user.password = undefined;
      //generating jwt Token
      const token = jwt.sign(payload, process.env.JWT_SCERET, {
        expiresIn: 100000,
      });
      res.cookie("token", token, { expiresIn: 100000 });
      return res.status(200).json({ token, user });
    } else {
      return res.status(200).json({ message: "Verification pending" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
};

exports.userVerification = async (req, res) => {
  try {
    const { email, verified } = req.body;
    // verified -> true / false

    const isAdmin = await User.findById({ _id: req.user.id }).select(
      "-password"
    );
    const { designation } = isAdmin;

    if (designation === "ADMIN") {
      let user = await User.findOne({ email }).select("-password");
      user.verified = verified;
      await user.save();
      return res.status(200).json({ message: "Permission changed" });
    } else {
      return res.status(200).json({ message: "Access denied" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const isAdmin = await User.findById({ _id: req.user.id }).select(
      "-password"
    );
    const { designation } = isAdmin;
    if (designation === "ADMIN") {
      const users = await User.find({}).select("-password");
      const tempUsers = users.filter((u) => u.designation !== "ADMIN");
      return res.status(200).json({ users: tempUsers });
    } else {
      return res.status(200).json({ message: "Access denied" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.validateToken = (req, res) => {
  const { token } = req.body;

  //check if no token
  if (!token) {
    return res.status(400).send("No token, authorization denied");
  }

  //verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SCERET, {
      expiresIn: 100000,
    });
    req.user = decoded.user;
    return res.status(200).json({ message: "valid_token" });
  } catch (err) {
    res.status(401).send("Invalid Token");
  }
};

exports.sendVerificationMail = async (req, res) => {
  try {
    // const { email } = req.body;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", // hostname
      secure: false, // TLS requires secureConnection to be false
      auth: {
        user: "admin@carboncompete.com", // generated ethereal user
        pass: "WhiteP@per1!", // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "bishal@zerotenergy.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.log(err);
  }
};
