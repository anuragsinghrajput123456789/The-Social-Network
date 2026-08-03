const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/instagram-clone",
  JWT_SECRET: process.env.JWT_SECRET || "mysecret",
  NODE_ENV: process.env.NODE_ENV || "development"
};

// Environment Variable Validation
if (env.NODE_ENV === "production") {
  if (env.JWT_SECRET === "mysecret") {
    console.warn("⚠️ WARNING: Using default JWT_SECRET in production mode!");
  }
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ WARNING: MONGO_URI environment variable not explicitly set.");
  }
}

module.exports = env;
