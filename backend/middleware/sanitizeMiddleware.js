const sanitizeNoSQL = (target) => {
  if (!target || typeof target !== "object") return target;

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeNoSQL(item));
  }

  const cleanObj = {};
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      // Remove keys starting with $ or containing .
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      cleanObj[key] = sanitizeNoSQL(target[key]);
    }
  }
  return cleanObj;
};

const sanitizeXSSString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/javascript:/gi, "");
};

const sanitizeXSSObj = (target) => {
  if (!target) return target;
  if (typeof target === "string") return sanitizeXSSString(target);
  if (Array.isArray(target)) return target.map((item) => sanitizeXSSObj(item));
  if (typeof target === "object") {
    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = sanitizeXSSObj(target[key]);
      }
    }
  }
  return target;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeNoSQL(req.body);
    req.body = sanitizeXSSObj(req.body);
  }
  if (req.query) {
    req.query = sanitizeNoSQL(req.query);
    req.query = sanitizeXSSObj(req.query);
  }
  if (req.params) {
    req.params = sanitizeNoSQL(req.params);
    req.params = sanitizeXSSObj(req.params);
  }
  next();
};

module.exports = {
  sanitizeNoSQL,
  sanitizeXSSString,
  sanitizeInput
};
