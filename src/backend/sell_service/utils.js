function logger(function_name, msg_object) {
    console.log("[" + function_name + "] : " + JSON.stringify(msg_object) + "\n");
}


class NoTokenProvidedException extends Error {
    
    constructor() {
        super("No Authorization token was provied!");
        this.name="NoTokenProvidedException"
    }
}

module.exports = {
    logger,
    NoTokenProvidedException
}