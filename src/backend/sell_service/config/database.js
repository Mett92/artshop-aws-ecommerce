const mysql = require("mysql");
const utils = require('../utils');

const { DB_URI, DB_USER, DB_PASS, DB_NAME } = process.env;

const Database = {
    DB_INSTANCE: undefined,

    initConnection() {
        if (this.DB_INSTANCE !== undefined && this.DB_INSTANCE !== null) {
            return
        }

        this.DB_INSTANCE = mysql.createConnection({
            host     : DB_URI,
            user     : DB_USER,
            password : DB_PASS,
            database : DB_NAME
        });
        
        this.DB_INSTANCE.connect();
    },

    query(sql_query) {
        return new Promise( (resolve, reject) => {
            this.DB_INSTANCE.query(sql_query, (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },
}

function initDBConnection() {
    Database.initConnection();
}

function getConnection() {
    return Database.DB_INSTANCE;
}

function queryGetUserIdByUsername(username) {
    const sql = `select iduser from user where username='${username}';`;
    const result = Database.query(sql).then(
        res => {
                utils.logger(queryGetUserIdByUsername.name, res);
                return res;
        }
    );
    return result;
}

function queryCreateInsertion(author, titolo, descr, dimension, photo_link, price) {
    const sql = `insert into artwork(author, title, description, dimensions, photo_link, price) 
            values(${author}, '${titolo}', '${descr}', '${dimension}', '${photo_link}', ${price});`
    const result = Database.query(sql).then(
        res => {
            utils.logger(queryCreateInsertion.name, res);
            return res;
        }
    );
    return result;
}

module.exports = {
    initDBConnection,
    queryCreateInsertion,
    queryGetUserIdByUsername,
    getConnection
}