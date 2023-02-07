const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  signin,
  signup,
  validateToken,
  userVerification,
  getUsers,
  sendVerificationMail,
} = require("../controllers/users");

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/validatetoken", validateToken);
router.post("/userverification", auth, userVerification);
router.get("/allusers", auth, getUsers);
router.get("/sendmail", sendVerificationMail);

module.exports = router;
