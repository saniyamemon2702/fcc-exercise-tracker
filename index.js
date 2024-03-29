const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// Body Parser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Cors

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Mongoose
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://admin:admin@saniyacluster.xrzit.mongodb.net/excerciseDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })

// Schema
const Schema = mongoose.Schema
const userSchema = new Schema({
  username: { type: String },
  excercises: [{ description: String, duration: Number, date: String }]
})

// Model
const User = mongoose.model('User', userSchema)

// get all the users
app.get("/api/users", (req, res) => {
  User.find().then((docs) => {
    const users = docs.map((doc) => {
      return { "_id": doc._id, "username": doc.username, "__v": doc.__v }
    })
    res.send(users)
  }).catch(err => console.log(err))
})

// /api/users post request
app.post("/api/users", (req, res) => {

  let newUser = new User({ username: req.body.username });
  newUser.save().then((doc) => {
    res.json({ username: doc.username, _id: doc.id });
  }).catch((err) => console.log(err.message, err.code));
})

// /api/users/:id/exercise post request
app.post("/api/users/:id/exercises", (req, res) => {

  // res.json(req.body);
  const userId = req.params.id;
  // console.log("body ID",req.body._id);
  const newExcercise = {
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
  };
  // console.log(newExcercise);

  // find the user by id and add the excercise
  User.findById(userId).then((doc) => {
    if (!doc) return res.send("User not found")
    else {
      console.log("User found");
      // console.log("username",doc.username);
      doc.excercises.push(newExcercise);
      doc.save().then((doc) => {
        console.log("Excercise added!");
        res.json({ _id: doc._id, username: doc.username, date: doc.excercises[doc.excercises.length - 1].date, duration: doc.excercises[doc.excercises.length - 1].duration, description: doc.excercises[doc.excercises.length - 1].description });
        // res.json({_id:doc._id,username:doc.username, date:new Date(newExcercise.date).toDateString(), duration:newExcercise.duration, description:newExcercise.description});
      }).catch(err => console.log(err.message))
    }
  }).catch(err => console.log(err.message))
})

// /api/users/:id/log get request
app.get("/api/users/:id/logs", (req, res) => {
  const userId = req.params.id;
  console.log(req.query.from, req.query.to, req.query.limit);
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const limit = req.query.limit;
  User.findById(userId).then((doc) => {
    if (!doc) return res.send("User not found")
    else {
      console.log("User found");
      if (fromDate || toDate || limit) {
        console.log("from", fromDate, "to", toDate, "limit", limit);
        const log = [];
        doc.excercises.forEach((excercise) => {

          if (fromDate && toDate) {
            if (new Date(excercise.date).getTime() >= new Date(fromDate).getTime() && new Date(excercise.date).getTime() <= new Date(toDate).getTime()) {
              log.push(excercise);
            }
          }
          else if (fromDate) {
            if (new Date(excercise.date).getTime() >= new Date(fromDate).getTime()) {
              log.push(excercise);
            }
          }
          else if (toDate) {
            if (new Date(excercise.date).getTime() <= new Date(toDate).getTime()) {
              log.push(excercise);
            }
          }
          else {
            log.push(excercise);
          }
        })
        if (limit) {
         log.splice(limit);
        }
        res.json({ _id: doc._id, username: doc.username, count: log.length, log: log });

      }
      else {
        console.log("No date range");
        res.json({ _id: doc._id, username: doc.username, count: doc.excercises.length, log: doc.excercises });
      }
      // res.json({ _id: doc._id, username: doc.username, count: doc.excercises.length, log: doc.excercises});
    }
  })
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

