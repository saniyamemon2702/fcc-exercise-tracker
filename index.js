const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// Body Parser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Mongoose
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://admin:admin@saniyacluster.xrzit.mongodb.net/excerciseDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })

// Schema
const Schema = mongoose.Schema
const userSchema = new Schema({
  username: {type: String, required: true},
  excercises: [{description: String, duration: Number, date: Date}]
})

// Model
const User = mongoose.model('User', userSchema)

// get all the users
app.get("/api/users", (req, res) => {
  User.find().then((docs) => {
    const users = docs.map((doc) => {
      return { _id: doc._id, username: doc.username, __v: doc.__v }
    })
    res.send(users)
  }).catch(err => console.log(err))
})

// /api/users post request
app.post("/api/users", (req, res) => {

  let newUser = new User({ username: req.body.username });
  newUser.save().then((doc) => {
    res.json({ username: doc.username, _id: doc.id });
  }).catch((err) => console.log(err));
})


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
