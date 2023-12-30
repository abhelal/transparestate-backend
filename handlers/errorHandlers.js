exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((error) => {
      if (error.name == "ValidationError") {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Required fields are not supplied",
          error: error,
        });
      } else {
        return res.status(500).json({
          success: false,
          result: null,
          message: error.message,
          error: error,
        });
      }
    });
  };
};

exports.notFound = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: "url doesn't exist",
  });
};

exports.developmentErrors = (error, req, res, next) => {
  error.stack = error.stack || "";
  const errorDetails = {
    message: error.message,
    status: error.status,
    stackHighlighted: error.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, "<mark>$&</mark>"),
  };

  return res.status(500).json({
    success: false,
    message: error.message,
    error: error,
  });
};

exports.productionErrors = (error, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: error.message,
    error: error,
  });
};
