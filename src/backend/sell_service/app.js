'use strict';

// Modules
require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const { check_authorization } = require('./middleware/authorization');
const db = require('./config/database');
const s3Manager = require('./app_modules/s3Manager');
const formidable = require('formidable');
const mime = require('mime-types');

// Environment variables
const { API_PORT } = process.env;

// DB connection
db.initDBConnection();

const basepath = "/api/sell";

// Health check API
app.get(basepath, (req, res, next) => {
	res.status(204).send();
});

app.use(cookieParser());
app.use(express.json()); // for parsing the body of the request
app.use(check_authorization);

app.post(basepath + "/createInsertion", (req, res, next) => {
	const form = formidable({ multiples: true });

	form.parse(req, async (err, fields, files) => {
		if (err) {
			next(err);
			return;
		}

		const { username,
				title,
				description,
				dimensions,
				price } = fields;
				
		if(!(username && title && description && dimensions && price)) {
			res.status(400).send("All fields are required");
			return
		}

		let rows = await db.queryGetUserIdByUsername(username);
		if(rows.length < 1) {
			res.status(400).send("Username of author not valid");
			return
		}

		const idUser = rows[0].iduser;
		const s3name = username + "/" + title.replaceAll(" ", "_") + "." + mime.extension(files['photo'].mimetype);
		const imgType = files['photo'].mimetype;
		
		// BEGIN TRANSACTION
		db.getConnection().beginTransaction(async function(err) {
			if(err) { throw err; }
			
			try {
				rows = await db.queryCreateInsertion(
					idUser, 
					title, 
					description, 
					dimensions,
					s3name,
					price);

				if(rows.length <= 0) {
					res.status(500).send();
					return db.getConnection().rollback(()=> {throw err});
				}

			} catch(err) {
				return db.getConnection().rollback(() => {throw err});
			}

			try {
				const imgPath = files['photo'].filepath
				const result = await s3Manager.storeImageOnS3(imgPath, s3name, imgType);

				if(result) {
					db.getConnection().commit((err) => {
						if(err) {
							return db.getConnection().rollback(() => {throw err});
						}

						res.status(201).send({ "message": "Insertion created."});
						return;
					});

				} else {
					res.status(500).send({ "message": "An error occurred!"});
					throw new Error("Error occured while creating the object in S3");
				}

			} catch(err) {
				console.log(err);
				res.status(500).send({ "message": "An error occured"});
				return db.getConnection().rollback();
			}
			// END TRANSACTIO
		});
	});
});

// Put the application in listening state on the specified port
app.listen(API_PORT, () => {
    console.log(`Sell service listening on port ${API_PORT}`);
});