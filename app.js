const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const path = require("path");
const { join } = require("path");
// const request = require("request");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/signup.html"));
    
});


app.post("/", (req, res) => {

    let firstName = req.body.fname;
    let lastName = req.body.lname;
    let email = req.body.email;

    console.log(firstName,lastName,email);
    
});

app.listen(3000, () => {
    console.log("3000 is good to go");
});



// API KEY 
// 5fa56c79d8d489460835c7da1dbed27e-us12
// Audience ID
// 8a35e2a557