import React, { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from './components/Sidebar';
import Bottom from './components/Bottom';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';
import { api } from './services/api';

// Code Splitting with React.lazy
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Create = lazy(() => import('./pages/Create'));
const Chat = lazy(() => import('./pages/Chat'));
const Messages = lazy(() => import('./pages/Messages'));
const Saved = lazy(() => import('./pages/Saved'));
const Explore = lazy(() => import('./pages/Explore'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const NoPage = lazy(() => import('./pages/NoPage'));

// Create Theme Context
export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const changeTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    // Sync to database if logged in
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await api.updateTheme(newTheme);
      } catch (err) {
        console.error("Failed to sync theme to DB:", err);
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Initial sync from DB
  useEffect(() => {
    const syncTheme = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        try {
          const result = await api.getUserDetails(userId);
          if (result.success && result.data.theme) {
            setThemeState(result.data.theme);
            localStorage.setItem("theme", result.data.theme);
            document.documentElement.setAttribute("data-theme", result.data.theme);
          }
        } catch (e) {
          console.error("Theme sync error:", e);
        }
      }
    };
    syncTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="w-8 h-8 border-4 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

import MouseSpotlight from './components/Common/MouseSpotlight';
import FloatingParticles from './components/Common/FloatingParticles';

const PrivateLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className="relative flex w-full min-h-screen bg-ig-bg text-ig-text transition-colors duration-300 overflow-x-hidden">
        <MouseSpotlight />
        <FloatingParticles />
        <Sidebar />
        <div className="flex-1 w-full md:ml-[245px] z-10">
          {children}
        </div>
        <div className="md:hidden z-20">
          <Bottom />
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/SignUp" element={<SignUp />} />
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <PrivateLayout>
                  <Home />
                </PrivateLayout>
              } />
              <Route path="/profile/:id" element={
                <PrivateLayout>
                  <Profile />
                </PrivateLayout>
              } />
              <Route path="/create" element={
                <PrivateLayout>
                  <Create />
                </PrivateLayout>
              } />
              <Route path="/chat" element={
                <PrivateLayout>
                  <Chat />
                </PrivateLayout>
              } />
              <Route path="/messages" element={
                <PrivateLayout>
                  <Messages />
                </PrivateLayout>
              } />
              <Route path="/saved" element={
                <PrivateLayout>
                  <Saved />
                </PrivateLayout>
              } />
              <Route path="/explore" element={
                <PrivateLayout>
                  <Explore />
                </PrivateLayout>
              } />

              <Route path="*" element={<NoPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;
