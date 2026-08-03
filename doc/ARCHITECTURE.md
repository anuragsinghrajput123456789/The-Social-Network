# Instagram Clone - System Architecture

This document provides a comprehensive technical overview of the system architecture, component design, data models, and infrastructure for the Instagram Clone application.

---

## 1. System Overview

The Instagram Clone is a full-stack web application built on the **MERN** stack (**M**ongoDB, **E**xpress.js, **R**eact, **N**ode.js) enhanced with **Socket.io** for real-time bidirectional communication.

The architecture follows a decoupled client-server pattern:
- **Frontend**: Single-Page Application (SPA) created with React 18 and Vite, styled with custom CSS and Tailwind CSS utilities.
- **Backend**: RESTful HTTP API and WebSocket server built with Node.js and Express.js.
- **Database**: MongoDB database managed via Mongoose ODM for structured document persistence.
- **Media Storage**: Disk-based storage for user uploads hosted via static middleware.

---

## 2. High-Level Architecture Diagram

```
 +-----------------------------------------------------------------------+
 |                            CLIENT SIDE                                |
 |                                                                       |
 |   +--------------------+   +-------------------+   +--------------+   |
 |   |  React SPA (Vite)  |---|  React Router v6  |---| Theme Context|   |
 |   +--------------------+   +-------------------+   +--------------+   |
 |             |                        |                    |           |
 |             +------------------------+--------------------+           |
 |                                      |                                |
 |                     HTTP Requests / WebSockets                        |
 +--------------------------------------+--------------------------------+
                                        |
                                        v
 +-----------------------------------------------------------------------+
 |                            SERVER SIDE                                |
 |                                                                       |
 |   +--------------------+   +-------------------+   +--------------+   |
 |   | Express.js Server  |---|  JWT Middleware   |---| Multer Upload|   |
 |   +--------------------+   +-------------------+   +--------------+   |
 |             |                        |                    |           |
 |             +                        v                    v           |
 |      Socket.io Engine          REST Controllers      /uploads (Disk)  |
 |     (Real-Time Engine)                   |                            |
 +-------------+------------------------+--------------------------------+
               |                        |
               v                        v
 +-----------------------------------------------------------------------+
 |                            DATABASE LAYER                             |
 |                                                                       |
 |                        MongoDB (Mongoose ODM)                         |
 |     +------------------+  +------------------+  +-----------------+   |
 |     |   User Schema    |  |   Post Schema    |  |  Chat Schema    |   |
 |     +------------------+  +------------------+  +-----------------+   |
 +-----------------------------------------------------------------------+
```

---

## 3. Component Architecture

### 3.1 Frontend (React SPA)

- **Entry Point**: [main.jsx](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/frontend/src/main.jsx) mounts the root component enclosed in `ThemeProvider`.
- **Router Configuration**: [App.jsx](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/frontend/src/App.jsx) manages application routes:
  - **Public Routes**: `/login`, `/SignUp`
  - **Private Routes**: `/` (Home Feed), `/profile/:id` (User Profile), `/create` (Post Creation), `/chat` (Real-Time Direct Messaging)
- **Layout Management**: `PrivateLayout` dynamically renders:
  - Desktop view: Fixed left-side `Sidebar` component.
  - Mobile view: Fixed bottom `Bottom` navigation bar.
- **State & Theme Management**:
  - `ThemeContext` provides global theme management (`dark` vs `light`), maintaining state in `localStorage` and synchronizing with MongoDB via API (`/updateTheme`).
  - Native browser `data-theme` attribute applied to document root element.

### 3.2 Backend (Node.js & Express)

- **HTTP Server Setup**: [bin/www](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/backend/bin/www) initializes the HTTP server on designated port (default `3000`).
- **Application Middleware**: [app.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/backend/app.js) configures CORS, JSON parsing, URL encoding, cookie parser, and static serving (`/uploads`).
- **Routing Engine**: [routes/index.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/backend/routes/index.js) contains authentication, user details, post CRUD, comments, follows, dynamic user suggestions, and chat list endpoints.

---

## 4. Database Schemas & Data Modeling

### 4.1 User Schema ([userModels.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/backend/models/userModels.js))
- `username`: String (required)
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (bcrypt hashed)
- `followers`: Array of `followerSchema` (`{ userId: String, date: Date }`)
- `following`: Array of `followerSchema` (`{ userId: String, date: Date }`)
- `theme`: String (default `"dark"`)
- `timestamps`: `createdAt`, `updatedAt`

### 4.2 Post Schema ([postModel.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/backend/models/postModel.js))
- `caption`: String
- `image`: String (Filename reference in `/uploads`)
- `likes`: Array of `{ userId: String, date: Date }`
- `comments`: Array of `commentSchema` (`{ userId: String, username: String, comment: String, date: Date }`)
- `uploadedBy`: String (Referencing User `_id`)
- `timestamps`: `createdAt`, `updatedAt`

### 4.3 Message Schema ([chatModel.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/instagramClone/backend/models/chatModel.js))
- `senderId`: String (required)
- `receiverId`: String (required)
- `message`: String (default `""`)
- `sharedPost`: ObjectId (Reference to `post` model, optional)
- `timestamps`: `createdAt`, `updatedAt`

---

## 5. Socket.io Real-Time Communications

The WebSocket architecture handles instant messaging and presence tracking:

1. **User Socket Map**: In-memory JavaScript object (`userSocketMap`) mapping `userId -> socket.id`.
2. **Registration**: When a client connects, it emits `registerUser` with its `userId`, binding socket ID and broadcasting `onlineUsers`.
3. **Messaging Engine**:
   - Client emits `sendMessage` payload containing `{ senderId, receiverId, message, sharedPost }`.
   - Server creates document in MongoDB (`Message` collection).
   - If `sharedPost` is provided, populates post metadata.
   - Dispatches `receiveMessage` to the active receiver socket (if online) and sends an echo to the sender socket.
4. **Typing Indicators**: Relays `typing` event payload to target user socket ID.
5. **Disconnection Handling**: Cleans up disconnected sockets from `userSocketMap` and re-broadcasts active online users list.

---

## 6. Security Architecture

- **Authentication**: JWT (JSON Web Tokens) generated during login, verified on protected REST endpoints.
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (salt rounds: 12).
- **File Upload Security**: Storage handled by `multer` generating timestamp-suffixed safe filenames to prevent collision and directory traversal.
- **CORS Configuration**: Express CORS middleware enabled for cross-origin requests.
