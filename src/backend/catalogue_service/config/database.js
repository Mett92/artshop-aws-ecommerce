const mysql = require("mysql");
const { logger } = require("../utils");

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

function queryGetArtworksByAuthor() {
    const sql = "SELECT id_artwork, username as author, title, description, dimensions, photo_link, price FROM artshop_db.artwork a INNER JOIN artshop_db.user u ON a.author = u.iduser;";
    const result = Database.query(sql)
        .then(res => {
            logger(queryGetArtworksByAuthor.name, res);
            return res;
        });
    return result
}

module.exports = {
    initDBConnection,
    queryGetArtworksByAuthor
}
