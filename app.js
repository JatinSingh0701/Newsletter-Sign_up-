const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const path = require("path");

// Load Mailchimp API credentials from a separate file or environment variables
const { apiKey, audienceId } = require("./mailchimp");

const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse request bodies encoded in urlencoded format
app.use(bodyParser.urlencoded({ extended: true }));

// Handle GET requests to the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/signup.html"));
});

// Handle POST requests to the root URL
app.post("/", (req, res) => {

    // Validate request body
    const { fname, lname, email } = req.body;
    if (!fname || !lname || !email) {
        res.status(400).send("Missing required fields");
        return;
    }

    // Construct the data object to send to the Mailchimp API
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname,
                }
            }
        ]
    }

    // Convert the data object to JSON
    const jsonData = JSON.stringify(data);

    // Send the JSON data to the Mailchimp API using an HTTPS request
    const url = `https://us12.api.mailchimp.com/3.0/lists/${audienceId}`;
    const options = {
        method: "POST",
        auth: `jatin1:${apiKey}`
    };

    const request = https.request(url, options, (response) => {

        // Handle response from the Mailchimp API
        let responseData = "";
        response.on("data", (data) => {
            responseData += data;
        });

        response.on("end", () => {
            const result = JSON.parse(responseData);
            if (response.statusCode === 200) {
                // If successful, send the success.html file
                res.sendFile(path.join(__dirname + "/success.html"));
            } else {
                // If not successful, send the failure.html file
                res.sendFile(path.join(__dirname + "/failure.html"));
            }
        });
    });

    // Add error handling for network errors or errors returned by the Mailchimp API
    request.on("error", (error) => {
        console.error(error);
        res.status(500).send("An error occurred");
    });

    // Write the JSON data to the request body and end the request
    request.write(jsonData);
    request.end();
});

// Handle POST requests to the failure and success URLs by redirecting to the root URL
app.post("/failure", (req, res) => {
    res.redirect("/");
});

app.post("/success", (req, res) => {
    res.redirect("/");
});

// Start the server and listen on the specified port
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("server is running");
})
