import Joi from "joi";

export default function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source] || {};
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          details: error.details.map((d) => d.message),
        });
    }
    // attach sanitized values
    if (source === "body") req.body = value;
    else if (source === "query") req.query = value;
    else if (source === "params") req.params = value;
    return next();
  };
}
