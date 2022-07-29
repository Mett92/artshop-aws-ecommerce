const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

async function encriptPassword(password) {
    const randomSalt = getRandomInt(8,14);
    const encrypted_pass = await bcrypt.hash(password, randomSalt);
    return encrypted_pass;
}

function logger(function_name, msg_object) {
    console.log("[" + function_name + "] : " + JSON.stringify(msg_object));
}

function generateToken() {
    // Create token
    const token = jwt.sign(
        { "iss": "example.site.it" },
        process.env.TOKEN_KEY,
        { expiresIn: process.env.TOKEN_EXPIRES_IN }
    );
    return token;
}
/**
 * 
 * @param { String } date_string 
 * @returns { Boolean }
 */
function checkDate(date_string) {
    const re = /^\d\d\d\d-\d\d-\d\d$/; // date in yyyy-mm-dd
    
    if(!re.test(date_string)) {
        return false;
    }

    let year, month, day;
    [year, month, day] = date_string.split("-");
    const check = year < 1900 || month <= 0 || month > 12 || day <= 0 || day > 31;

    if(check) {
        return false;
    }

    return true;
}

module.exports = {
    getRandomInt,
    encriptPassword,
    logger,
    generateToken,
    checkDate
}