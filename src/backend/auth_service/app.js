require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const utils = require('./utils');
const db = require('./config/database');

const { API_PORT } = process.env;

const basepath = "/api/auth"

// DB connection
db.initDBConnection();

const app = express();

app.use(express.json()); // for parsing the body of the request

app.post(basepath + "/verifyToken", async (req, res, next) => {
    const token = req.body.token;
    
    try {
        // If the token is expired or not valid an exception will raised.
        jwt.verify(token, process.env.TOKEN_KEY);
        res.status(200).send(
            {
                "message" : "The token is valid!"
            }
        );
    } catch(err) {
        console.log(err);
        res.status(401).send(
            {
                "message" : "The token is expired or invalid!"
            }
        );
        utils.logger("API /verifyToken", err);
    }
});

// Sign-up
app.post(basepath + "/signup", async (req, res, next) => {
    // Get user input
    const { username, 
            password,
            name,
            surname,
            birth,
            nationality  } = req.body;

    // Check if all input are provided
    if (!(  username && 
            password && 
            name && 
            surname && 
            birth && 
            nationality )) 
    {
        res.status(400).json(
            {
                "message" : "All input is required"
            }
        );
        return;
    }

    if(!utils.checkDate(birth)) {
        res.status(400).json(
            {
                "message" : "The date is not in the 'YYYY-MM-DD' format"
            }
        );
        return;
    }

    let rows;
    try {
        // check if user already exist
        rows = await db.queryFindUserByUsername(username);

    } catch(err) {
        next(err);
        return;
    }

    if(rows !== undefined && rows !== null && rows.length > 0) {
        res.status(409).send(
            {
                "message" : "The user already exists. Please Login!"
            }
        );
    
    } else {
        const encryptedPassword = await utils.encriptPassword(password);

        // Create token
        const token = utils.generateToken();

        try {
            const result = await db.queryCreateUser(
                                    username, 
                                    encryptedPassword, 
                                    name, 
                                    surname, 
                                    birth, 
                                    nationality);
            res.status(200).json(
                {
                    "message" : "The user has been created.",
                    "token" : token
                }
            );

        } catch (err){
            next("There was an error");
            console.log(err);
            return;
        }
    }
});

// Login
app.post(basepath + "/login", async (req, res, next) => {
    // Get user input
    const { username, password } = req.body;
    console.log(req.body);

    // Validate user input
    if (!(username && password)) {
        res.status(400).json(
            {
                "message" : "Please, provide username and password!"
            }
        );
        return;
    }

    let query_result;
    try {
        query_result = await db.queryFindUserByUsername(username);

        // No user found
        if(query_result.length <= 0) {
            res.status(401).json(
                {
                    "message" : "The username and/or password provieded are not valid."
                }
            );
            return;
        }

        const password_match = await bcrypt.compare(password, query_result[0].password);
        if(password_match) {
            const token = utils.generateToken();
            res.cookie("token",token, { 
                httpOnly : true,
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h
            });
            res.status(200).json(
                {
                    "message" : "Login was successful!",
                }
            );
        } else {
            res.status(401).json(
                {
                    "message" : "The username and/or password provieded are not valid."
                }
            );
        }

    } catch(err) {
        next(err);
        console.log(err);
        return
    }


});

// It is util in order to check if service is up
app.get(basepath, (req, res, next) => {
    res.status(204).send();
});

// Put the application in listening state on the specified port
app.listen(API_PORT, () => {
    console.log(`Auth service listening on port ${API_PORT}`);
});