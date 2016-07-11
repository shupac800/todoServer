"use strict";

const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const firebase = require("firebase");

app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

firebase.initializeApp({
  apiKey: "AIzaSyAZPHuMoKrlNOvY6bszaBX4yrityBrsHaw",
  authDomain: "todo-dss-520b0.firebaseapp.com",
  databaseURL: "https://todo-dss-520b0.firebaseio.com",
  storageBucket: ""
});

const ref = firebase.database().ref();

router.route("/")
  .get((req, res) => {
    res.send("Waking up Heroku API server...")
  })

router.route("/api")
  .get((req,res) => {
    ref.child("task").on("value", snapshot => {
      res.json(snapshot.val());
    }, (err) => {
      res.json({"message" : "error: " + err});
    });
  })
  .post((req, res) => {
    // create a new empty record and get its key
    const key = firebase.database().ref().child("task").push().key;
    // update new record with k:v pairs in req.body
    ref.child("task").child(key).update(req.body, err => {
      if (!err) {
        let returnObj = req.body;
        returnObj.key = key;
        res.json(returnObj);
      } else {
        res.json({"message" : "error: " + err});
      }
    });
  })
  .put((req, res) => {
    let thisRecord = ref.child("task").child(req.query.key);
    // convert string to boolean
    const flag = req.query.isDone === "true" ? true : false;
    thisRecord.update({isDone: flag}, err => {
      if (!err) {
        res.json({"data" : flag});
      } else {
        res.json({"message" : "error: " + err});
      }
    });
  })
  .delete((req, res) => {
    console.log("deleting...");
    ref.child("task").child(req.query.key).remove(err => {
    if (!err) {
        console.log("deleted",req.query.key);
        res.json({"message" : "delete OK!"});
      } else {
        res.json({"message" : "error: " + err});
      }
    });
  })

app.use('/', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port",port);
});