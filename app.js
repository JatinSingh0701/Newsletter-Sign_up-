const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const path = require("path");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const { apiKey, audienceId } = require("./mailchimp");

const app = express();

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Parse request bodies encoded in urlencoded format
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Mailchimp API key and server prefix
mailchimp.setConfig({
    apiKey: apiKey,
    server: apiKey.split('-')[1],
});

// Validate that the Mailchimp API key is valid by calling the ping endpoint
async function validateApiKey() {
    try {
        const response = await mailchimp.ping.get();
        console.log("Mailchimp API key is valid.");
    } catch (error) {
        console.error("Error validating Mailchimp API key:", error);
        process.exit(1);
    }
}

// Construct the data object to send to the Mailchimp API
function constructDataObject(fname, lname, email) {
    return {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname,
                },
            },
        ],
    };
}

// Send the data object to the Mailchimp API using an HTTPS request
function sendDataToMailchimp(data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data);
        const url = `https://${mailchimp.getApiUrlBase()}/lists/${audienceId}`;
        const options = {
            method: "POST",
            auth: `jatin1:${apiKey}`,
        };
        const request = https.request(url, options, (response) => {
            let responseData = "";
            response.on("data", (data) => {
                responseData += data;
            });
            response.on("end", () => {
                const result = JSON.parse(responseData);
                resolve(result);
            });
        });
        request.on("error", (error) => {
            console.error("Error sending data to Mailchimp:", error);
            reject(error);
        });
        request.write(jsonData);
        request.end();
    });
}

// Handle GET requests to the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});

// Handle POST requests to the root URL
app.post("/", async (req, res) => {
    const { fname, lname, email } = req.body;
    if (!fname || !lname || !email) {
        res.status(400).send("Missing required fields");
        return;
    }

    // Validate the Mailchimp API key before sending data to the API
    await validateApiKey();

    const data = constructDataObject(fname, lname, email);
    try {
        const result = await sendDataToMailchimp(data);
        if (result.error_count === 0) {
            res.sendFile(path.join(__dirname, "success.html"));
        } else {
            console.error(result.errors);
            res.sendFile(path.join(__dirname, "failure.html"));
        }
    } catch (error) {
        console.error(error);
        res.sendFile(path.join(__dirname, "failure.html"));
    }
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

try {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} catch (error) {
    console.error(`Error starting server: ${error.message}`);
}
