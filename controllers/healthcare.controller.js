import { apiError } from "../utilities/apiError.js";
import { apiResponse } from "../utilities/apiResponse.js"
import { asyncHandler } from "../utilities/asyncHandler.js"

const healthcheck = asyncHandler(async (req, res) => {
    try {
        res.status(200).json(new apiResponse(200, "Success", "Health care test passed."));
    } catch (e) {
        throw new apiError(400, "Health care test failed!");
    }
});

export { healthcheck };
