import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NoPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ig-bg text-ig-text p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md bg-ig-surface border border-ig-border rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4"
      >
        <h1 className="text-6xl font-light tracking-tight text-ig-primary">404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
        <p className="text-sm text-ig-text-secondary">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="mt-2 bg-ig-primary hover:bg-ig-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
        >
          Go Back Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NoPage;

