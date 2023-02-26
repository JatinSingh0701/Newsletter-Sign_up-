const express = require("express");

const app = express();

app.get("/",(req,res)=>{
    res.send("Hello 3000");
})

app.listen(3000,()=>{
    console.log("3000 is good to go");
})