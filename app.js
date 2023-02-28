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

    // Send the JSON data to the Mailchimp API using an HTTPS request

    const apiKey = "5fa56c79d8d489460835c7da1dbed27e-us12";
    const audienceId = "8a35e2a557";

    const url = `https://us12.api.mailchimp.com/3.0/lists/${audienceId}`;

    const options = {
        method: "POST",
        auth: `jatin1:${apiKey}`
    };

    const request = https.request(url, options, (response) => {

        // Handle response from the Mailchimp API

        if (response.statusCode === 200) {
            // If successful, send the success.html file

            res.sendFile(path.join(__dirname + "/success.html"));
        } else {
            // If not successful, send the failure.html file

            res.sendFile(path.join(__dirname + "/failure.html"));
        }
        // Log the response data to the console

        response.on("data", (data) => {

            console.log(JSON.parse(data));

        });

    });
    // Write the JSON data to the request body and end the request

    request.write(jsonData);
    request.end();

});

// Handle POST requests to the failure and success URLs by redirecting to the root URL

app.post("/failure", (req, res) => {

res.redirect("/")

})

app.post("/success", (req, res) => {

res.redirect("/")

})

// Start the server and listen on port 3000

app.listen(3000, () => {

console.log("Server is running on port 3000");

});




