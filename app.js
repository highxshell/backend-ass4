const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const UserData = require("./models/UserData");
const Item = require("./models/Item");
import("node-fetch");

const app = express();
const port = 3000;

mongoose
  .connect(
    "mongodb+srv://artempopov:mongodb123@cluster0.rbt8icq.mongodb.net/?retryWrites=true&w=majority",
    {}
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err.message);
  });
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

const nasaApodApiKey = "Rreq2D2tsHmKYfBdxoeEa5m48d1Fc15YUIgFfXOu";

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const hash = await bcrypt.hash(password, 10);
    if (!user || !bcrypt.compare(hash, user.password)) {
      return res
        .status(401)
        .render("login", { error: "Invalid username or password" });
    }
    req.session.user = user;
    res.redirect("/items");
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).render("error");
  }
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    req.session.user = newUser;
    res.render("login");
  } catch (error) {
    console.error("Error during sign up:", error.message);
    res.status(500).render("error");
  }
});

app.get("/items", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    const items = await Item.find();
    res.render("main", { items: items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/main", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.render("main", { user: req.session.user });
});

app.get("/apod", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    const userDataEntry = new UserData({
      username: req.session.user.username,
      accessHistory: Date.now(),
    });
    await userDataEntry.save();
    const apodResponse = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${nasaApodApiKey}`
    );
    const apodData = await apodResponse.json();
    res.render("apod", { apodData: apodData });
  } catch (error) {
    console.error("Error fetching APOD data:", error);
    res.render("apod", { apodData: null });
  }
});

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.status(403).render("error", { message: "Access denied" });
  }
};

app.get("/admin", isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    const items = await Item.find();
    res.render("admin", { users: users, items: items });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    res.status(500).render("error");
  }
});

app.post("/admin/user/add", async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, isAdmin });
    await newUser.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).render("error");
  }
});

app.get("/admin/user/edit/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    res.render("edit_user", { user: user });
  } catch (error) {
    console.error("Error retrieving user for editing:", error.message);
    res.status(500).render("error");
  }
});

app.post("/admin/user/edit/:userId", async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    user.isAdmin = isAdmin;
    user.updatedAt = Date.now();
    await user.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error editing user:", error.message);
    res.status(500).render("error");
  }
});

app.post("/admin/user/delete/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await User.findByIdAndDelete(userId);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).render("error");
  }
});

app.post("/admin/item/add", async (req, res) => {
  try {
    const {
      itemName,
      itemNameLocalized,
      description,
      descriptionLocalized,
      image1,
      image2,
      image3,
    } = req.body;
    const newItem = new Item({
      itemName,
      itemNameLocalized,
      description,
      descriptionLocalized,
      image1,
      image2,
      image3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newItem.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/item/edit/:itemId", async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).render("error", { message: "Item not found" });
    }
    res.render("edit_item", { item: item });
  } catch (error) {
    console.error("Error retrieving item for editing:", error.message);
    res.status(500).render("error");
  }
});

app.post("/admin/item/edit/:itemId", async (req, res) => {
  const {
    itemName,
    itemNameLocalized,
    description,
    descriptionLocalized,
    image1,
    image2,
    image3,
  } = req.body;
  const { itemId } = req.params;
  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).render("error", { message: "Item not found" });
    }
    item.itemName = itemName;
    item.itemNameLocalized = itemNameLocalized;
    item.description = description;
    item.descriptionLocalized = descriptionLocalized;
    item.image1 = image1;
    item.image2 = image2;
    item.image3 = image3;
    item.updatedAt = Date.now();
    await item.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error editing item:", error.message);
    res.status(500).render("error");
  }
});

app.post("/admin/item/delete/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    await Item.findByIdAndDelete(itemId);
    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/currency", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    res.render("currency");
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/crypto", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    res.render("crypto");
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
