const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

mongoose.connect("mongodb://localhost:27017/mindx");
// mongoose.connect("mongodb://127.0.0.1:27017/mindx");
// mongoose.connect("mongodb://0.0.0.0:27017/mindx");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const userModel = mongoose.model("users", userSchema);

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.post("/users", async (req, res) => {
  const body = req.body;
  const user = await userModel.create(body);
  res.status(200).send(user);
});

const validateAdmin = async (req, res, next) => {
  // Check header bearer
  const token = req.headers.authorization.split(" ")[1];
  // Verify token lấy từ header của req => lấy được payload là username, id
  const decoded = jwt.verify(token, "clgt");
  // Tìm trong db username này xem có phải admin không
  const user = await userModel.findOne({
    _id: new mongoose.Types.ObjectId(decoded.id),
  });

  if (!user.username !== "admin") {
    res.send("Not admin");
  }

  next();
};

app.get("/users", validateAdmin, async (req, res) => {
  const users = await userModel.find({}); // Tìm tất cả user
  res.status(200).send(users);
});

app.patch("/users/:id", async (req, res) => {
  // Tìm thằng user có id = id ở params => const user = await userModel.findById(....)
  const id = req.params.id; //6447d2e89cadd58c1b59e526
  const user = await userModel.findById(id);
  // Cập nhật data lấy từ req.body => user. = ...
  user.name = req.body.name;
  user.age = req.body.age;
  // Lưu lại user => user.save()
  await user.save();
  // Gửi lại user cho client
  res.status(200).send(user);
});

app.delete("/users/:id", async (req, res) => {
  // Tìm thằng user có id = id ở params => const user = await userModel.findById(....)
  const id = req.params.id; //6447d2e89cadd58c1b59e526
  const user = await userModel.findById(id);
  // Xoá user
  await userModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
  res.status(200).send("OK");
});

app.post("/login", async (req, res) => {
  try {
    const body = req.body;
    console.log("body", body);
    const user = await userModel.findOne({
      username: body.username,
      password: body.password,
    });

    if (user) {
      const token = jwt.sign({ id: user._id.toString() }, "clgt");
      res.json({ user: user, token: token });
    }

    if (!user) {
      res.send("Không tồn tại user");
    }
    // res.send("Không tồn tại user");
  } catch (error) {
    console.log(error);
    res.send("ERROR");
  }
});

app.listen(3000);
console.log("Server is running");
