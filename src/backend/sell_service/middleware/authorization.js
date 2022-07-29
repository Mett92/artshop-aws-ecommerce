const axios = require('axios');
const { NoTokenProvidedException } = require('../utils');

const { 	
	AUTH_SERVICE_ENDPOINT, 
	VERIFY_TOKEN_API } = process.env;

async function check_authorization(req, res, next){
	
    try {
		const token = req.cookies['token'];
		if(!token || token.trim() === "") {
			throw new NoTokenProvidedException();
		}

        const response = await axios.post(
			AUTH_SERVICE_ENDPOINT + VERIFY_TOKEN_API, 
			{ token }
		);
		console.log(response);
		next();

    } catch(err) {
		console.log(err);

		// Handling an unauthorized request
		if( (err instanceof axios.AxiosError  && err.response.status >= 400) || 
				err instanceof NoTokenProvidedException) {
			
					res.status(401).send(
				{
					"message" : "An unauthorized request was send! Please, login."
				}
			);
			return;

		} else {
			// Handling a generic error
			res.status(500).send(
				{
					"message" : "Sorry, but something went wrong. :("
				}
			);
			return;
		}
    }
};

module.exports = {
    check_authorization
}