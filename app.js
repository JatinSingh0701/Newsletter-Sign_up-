const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const path = require("path");

const app = express();

// Serve static files from the public folder

app.use(express.static(path.join(__dirname, 'public')));

// Parse request bodies encoded in urlencoded format

app.use(bodyParser.urlencoded({ extended: true }));

// Handle GET requests to the root URL

app.get("/", (req, res) => {
    // Send the signup.html file

    res.sendFile(path.join(__dirname + "/signup.html"));

});

// Handle POST requests to the root URL

app.post("/", (req, res) => {

    // Extract the first name, last name, and email from the request body

    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;

    // Construct the data object to send to the Mailchimp API

    const data = {

        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    }

    // Convert the data object to JSON

    const jsonData = JSON.stringify(data);

    // TODO: Send the JSON data to the Mailchimp API using an HTTPS request

});

// Start the server and listen on port 3000

app.listen(3000, () => {

    console.log("Server is running on port 3000");
    
});

// Mailchimp API Key

// TODO: Replace this with your Mailchimp API Key
// const apiKey = "5fa56c79d8d489460835c7da1dbed27e-us12";


// Mailchimp Audience ID

// TODO: Replace this with your Mailchimp Audience ID

// const audienceId = "8a35e2a557";

