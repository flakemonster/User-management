const express = require('express');
const User = require('./model/userSchema');
const bcrypt = require("bcrypt");
const router = express.Router();
const saltRounds = 10;

// Create a new user
router.post('/users', async (req, res) => {
  var { firstName, lastName, email, password } = req.body;
  password = await bcrypt.hash(password, saltRounds)
                    .then(hash => {
                        console.log('Hash ', hash);
                    return hash;})
  .catch(err => console.error(err.message))
  try {
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

//login a user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.find({email: { $eq: email}});
        const hashed_pass = user[0].password;

        console.log("password = "+password);
        console.log("hashed password from db = "+hashed_pass);
        const isVerified = validateUser(password, hashed_pass);
        console.log("isVerified = "+isVerified);
        if(!isVerified) {
            res.send("incorrect email/password");
        } else {
            res.sendStatus(200);
        }
    } catch(error) {
        console.error(error);

        res.status(500).send(error);
    }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update a user
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { firstName, lastName, email, password }, { new: true });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

async function validateUser(password, hash) {
    await bcrypt
            .compare(password, hash)
            .then(res => {
                console.log(res)  
                return true;
            })
            .catch(err => console.error(err.message))        
}

module.exports = router;