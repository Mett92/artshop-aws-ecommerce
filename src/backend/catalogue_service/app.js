'use strict';

// Modules
require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const { check_authorization } = require('./middleware/authorization')
const db = require('./config/database');
const { logger } = require('./utils');

// Environment variables
const { 
	API_PORT, 
} = process.env;

// DB connection
db.initDBConnection();

app.use(cookieParser());

const basepath = "/api/catalogue"

// It is util in order to check whether the service is up without authentication :)
app.get(basepath, (req, res, next) => {
    res.status(204).send();
});

app.use(check_authorization);

app.get(basepath + "/list", async (req, res, next) => {
	
	try {
		const query_result = await db.queryGetArtworksByAuthor();
		res.status(200).json(query_result);

  	} catch(err) {
		next(err);
		logger("API /api/catalogue", err);
  	}
});

// Put the application in listening state on the specified port
app.listen(API_PORT, () => {
  console.log(`Catalogue Service listening on port ${API_PORT}`);
});