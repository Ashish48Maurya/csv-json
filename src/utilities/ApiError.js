class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static BadRequest(message) {
    return new ApiError(400, message);
  }

  static Unauthorized(message) {
    return new ApiError(401, message); // Semantically this response means "unauthenticated"
  }

  static Forbidden(message) {
    return new ApiError(403, message); // The client does not have access rights to the content
  }

  static NotFound(message) {
    return new ApiError(404, message); // The server cannot find the requested resource
  }

  static StatusConflict(message) {
    return new ApiError(409, message); // This response is sent when a request conflicts with the current state of the server
  }

  static InternalServerError(message) {
    return new ApiError(500, message); // The server has encountered a situation it does not know how to handle
  }
}

export { ApiError };