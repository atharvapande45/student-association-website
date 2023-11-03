const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const con = mysql.createConnection({
    host: "project-cc-instance-1.cw87lwhs10d0.eu-north-1.rds.amazonaws.com",
    user: "admin",
    password: "Ath-211221",
});

con.connect(function (err) {
    if (err) throw err;

    con.query("CREATE DATABASE IF NOT EXISTS main;");
    con.query("USE main;");
    con.query(
        "CREATE TABLE IF NOT EXISTS registrations(roll_no varchar(30), fname varchar(30), lname varchar(30), PRIMARY KEY(roll_no));",
        function (error, result, fields) {
            console.log(result);
        }
    );
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/cesa", (req, res) => {
    res.sendFile(__dirname + "/public/cesa.html");
});

app.get("/cesa-events", (req, res) => {
    res.sendFile(__dirname + "/public/cesa-events.html");
});

app.get("/registration", (req, res) => {
    res.sendFile(__dirname + "/public/registration.html");
});

app.get("/registered", (req, res) => {
    con.connect(function (err) {
        con.query(
            `SELECT * FROM main.registrations`,
            function (err, result, fields) {
                if (err) res.send(err);
                if (result) {
                    result.map((e) => {
                        res.write(
                            `<p> First Name : ${e.fname} <p/> <br /> <p>Last Name : ${e.lname}<p/> <br /> <p>Roll No : ${e.roll_no}<p/>`
                        );
                        res.write(`<hr />`);
                    });

                    res.send();
                }
            }
        );
    });
});

app.post("/registration", (req, res) => {
    console.log(req);
    if (req.body.fname && req.body.lname && req.body.rollno) {
        console.log("Request received");
        con.connect(function (err) {
            con.query(
                `INSERT INTO main.registrations (roll_no, fname, lname) VALUES ('${req.body.rollno}', '${req.body.fname}', '${req.body.lname}')`,
                function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    if (result) {
                        res.send({
                            fname: req.body.fname,
                            lname: req.body.lname,
                            roll_no: req.body.rollno,
                        });
                    }

                    if (fields) console.log(fields);
                }
            );
        });
    } else {
        console.log("Missing a parameter");
    }
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
