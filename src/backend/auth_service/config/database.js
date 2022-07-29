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
    }
}

function initDBConnection() {
    Database.initConnection();
}

/**
 * Return the user (if exists) that matching with the ursername in input.
 * 
 * @param { String } username The username of the user we are looking for.
 * 
 * @return { Promise<RowDataPacket> } The result from db
 */
function queryFindUserByUsername(username) {

    const sql = `SELECT * FROM user WHERE username='${username}'`;
    const result = Database.query(sql)
        .then(res => {
            utils.logger(queryFindUserByUsername.name, res);
            return res;
        });
    return result;
}

/**
 * 
 * @param { String } username The username of the user we want to add to db.
 * @param { String } encryptedPassword The password choice by the user.
 * 
 * @return { Promise } The promise of resulting from the query.
 */
function queryCreateUser(username, encryptedPassword, name, surname, birth, nationality) {

    const sql = `insert into user(username, password, name, surname, birth, nationality) values('${username}', '${encryptedPassword}', '${name}', '${surname}', '${birth}', '${nationality}')`;
    const result = Database.query(sql)
        .then(res => {
            utils.logger(queryCreateUser.name, res);
            return res;
        });
    return result;
}

module.exports = {
    initDBConnection, 
    queryCreateUser,
    queryFindUserByUsername
}