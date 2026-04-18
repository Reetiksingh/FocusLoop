export function requireAuth(req, res, next) {
  req.user = { id: "replace-with-jwt-user-id" };
  next();
}
