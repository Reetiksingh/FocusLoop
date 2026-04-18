export function notFound(req, res) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} was not found.`
  });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Something went wrong.",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}
