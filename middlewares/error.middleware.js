import { apiError } from "../utilities/apiError";

const errorHandler = async (err, req, res, next) => {
    let error = err;
    if (!(error instanceof apiError)) {
        const statusCode = error.statusCode;
        const message = error.message || "There is some error!";
        error = new apiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.ENVIRONMENT === "dev" ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);

};

export { errorHandler };