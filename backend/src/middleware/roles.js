const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `O perfil "${req.user.role}" não tem permissão para esta ação.`,
      });
    }
    next();
  };
};

module.exports = { authorize };