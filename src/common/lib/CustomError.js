export default class CustomError extends Error {

    className = "Error";

    constructor(name, message = "", params = {}) {
        super(message);
        this.name = name;
        Object.assign(this, params);
    }
}
