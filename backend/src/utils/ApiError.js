class ApiError extends Error {
    constructor(statusCode, message, success = false, data = {}) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.data = data;
        this.success = success;
        if (Error.captureStackTrace) {
            this.stack = Error.captureStackTrace(this, this.constructor);
        }
    }
}
export default ApiError;
