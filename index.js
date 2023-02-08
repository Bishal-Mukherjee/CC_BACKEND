const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(express.json({ extended: false }));
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DATABASE CONNECTED"))
  .catch((err) => {
    console.log("DATABASE CONNECTION ERROR");
    console.log(err);
  });
mongoose.set("strictQuery", true);

app.get("/", (req, res) => {
  res.status(200).send("<h1>Server Working!</h1>");
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

app.use("/api/users", require("./routes/users"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`SERVER WORKING: ${PORT}`);
});
