const db = require("../../db");
const multer = require("multer");
const { getUserIdFromRefreshToken } = require("../utils/helpers");

// Getting all posts from the db
const getPosts = async (req, res) => {
  const sqlQuery = `
  SELECT * FROM authdb.users
  LEFT JOIN authdb.posts ON users.id = posts.author;
`;
  db.query(sqlQuery, (err, results) => {
    if (err) return res.status(401).json(err.message);
    console.log(results);
    const newData = results.map((result) => {
      const { password, email, fullName, author, ...newobj } = result;
      return { ...newobj, author: { fullName, email, author_id: author } };
    });
    res.status(200).json({ message: "success", result: newData });
  });
};

// Getting specified post from the db
const getPost = async (req, res) => {
  const { id } = req.params;
  const sqlQuery = `SELECT * FROM authdb.users
  LEFT JOIN authdb.posts ON users.id = posts.author WHERE posts.id = ?`;

  db.query(sqlQuery, [id], (err, results) => {
    if (err) return res.status(401).json(err.message);
    const newData = results.map((result) => {
      const { password, email, fullName, author, ...newobj } = result;
      return { ...newobj, author: { fullName, email, author_id: author } };
    });
    res.status(200).json({ message: "success", data: newData });
  });
};

// Creating new post

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./src/uploads`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const createPost = async (req, res) => {
  const userId = await getUserIdFromRefreshToken(req.cookies.jwt);
  const { title, description } = req.body;
  const file = req.file;
  const sqlQuery = "INSERT INTO posts SET ?";
  const data = {
    title,
    description,
    image: `./src/uploads/${file.originalname}`,
    author: userId,
    createdAt: new Date().getTime(),
  };

  db.query(sqlQuery, [data], (err, result) => {
    if (err) return res.status(401).json(err.message);
    let q = "SELECT * FROM posts";
    db.query(q, [userId], (err, result) => {
      if (err) return res.status(401).json(err.message);
      return res
        .status(200)
        .json({ message: "Post was created successfully", result });
    });
  });
};

// Deleting specified post
const removePost = async (req, res) => {
  const { id } = req.params;
  const sqlQuery = "DELETE FROM posts WHERE id = ?";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) return res.status(401).json(err.message);
    res.status(200).json({ message: "successfuly deleted" });
  });
};

// updating post
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const file = req.file;
  const image = `./src/uploads/${file.originalname}`;
  console.log(title, description, image);
  const sqlQuery = `UPDATE posts SET title = ?, description = ?, image = ? WHERE id = ?`;
  const q = `
  SELECT * FROM authdb.posts LEFT JOIN authdb.users ON posts.author = users.id WHERE posts.id = ?;
`;
  db.query(sqlQuery, [title, description, image, id], async (err, result) => {
    if (err) return res.status(401).json(err.message);

    db.query(q, [id], (err, results) => {
      const newData = results.map((result) => {
        const { password, email, fullName, author, ...newobj } = result;
        return { ...newobj, author: { fullName, email, author_id: author } };
      });
      if (err) return res.status(401).json(err.message);
      return res
        .status(200)
        .json({ message: "Update Successful", result: newData });
    });
  });
};

module.exports = {
  getPosts,
  getPost,
  removePost,
  updatePost,
  createPost,
  upload,
};
