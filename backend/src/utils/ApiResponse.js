class ApiResponse {
    constructor(status = 200, message = "data fetched successfully", data = {}) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
export default ApiResponse;
