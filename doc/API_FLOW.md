# Instagram Clone - API Flow & Protocols

This document details the REST API specifications, data flow sequences, payload structures, and real-time Socket.io event protocols for the Instagram Clone application.

---

## 1. Authentication APIs

### 1.1 User Signup
- **Endpoint**: `POST /signup`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "pwd": "securepassword123"
  }
  ```
- **Flow**:
  1. Server checks if `email` already exists in MongoDB `User` collection.
  2. If unique, server hashes `pwd` using `bcryptjs` (12 salt rounds).
  3. Creates user record and returns success response.
- **Success Response**:
  ```json
  {
    "success": true,
    "msg": "User created successfully"
  }
  ```

### 1.2 User Login
- **Endpoint**: `POST /login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "pwd": "securepassword123"
  }
  ```
- **Flow**:
  1. Verifies user exists by email.
  2. Compares plain password with stored bcrypt hash.
  3. Generates JWT token encoded with `{ email, userId }`.
- **Success Response**:
  ```json
  {
    "success": true,
    "msg": "User logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "userId": "64f8a123bc45678901234567",
    "theme": "dark"
  }
  ```

---

## 2. Post Management APIs

### 2.1 Create Post
- **Endpoint**: `POST /createPost`
- **Headers**: `Content-Type: multipart/form-data`
- **Form Fields**: `token` (String), `caption` (String), `image` (File)
- **Flow**:
  1. `multer` middleware processes image upload and saves to `./uploads` with a unique timestamp filename.
  2. Server decodes JWT token to identify uploader.
  3. Saves new `Post` document with `caption`, `image` filename, and `uploadedBy` user ID.
- **Success Response**:
  ```json
  {
    "success": true,
    "msg": "Post created successfully",
    "postId": "6512a987bc45678901234567",
    "date": "2026-08-01T12:00:00.000Z"
  }
  ```

### 2.2 Get Feed Posts
- **Endpoint**: `POST /getPosts`
- **Request Body**: `{ "token": "<JWT_TOKEN>" }`
- **Flow**:
  1. Verifies JWT token.
  2. Fetches all posts sorted descending by creation date (`createdAt: -1`).
  3. Maps post uploader details, calculates likes count, checks `isYouLiked` and `isYouFollowed`.
- **Success Response**:
  ```json
  {
    "success": true,
    "msg": "Posts fetched successfully",
    "data": [
      {
        "post": {
          "_id": "6512a987bc45678901234567",
          "caption": "Beautiful sunset!",
          "likes": 12,
          "image": "image-1722514100-123456789.jpg",
          "createdAt": "2026-08-01T12:00:00.000Z",
          "isYouLiked": true
        },
        "user": {
          "_id": "64f8a123bc45678901234567",
          "username": "johndoe",
          "followers": 45,
          "joinedAt": "2026-01-01T00:00:00.000Z",
          "isYouFollowed": false
        }
      }
    ]
  }
  ```

### 2.3 Toggle Like / Dislike
- **Endpoint**: `POST /toggleLike`
- **Request Body**: `{ "token": "<JWT_TOKEN>", "postId": "<POST_ID>" }`
- **Flow**:
  - If user already liked the post: pulls `{ userId }` from `post.likes` array (action: `"dislike"`).
  - If user has not liked the post: pushes `{ userId }` to `post.likes` array (action: `"like"`).

### 2.4 Edit Post & Delete Post
- **Edit**: `POST /editPost` (`token`, `postId`, `caption`) -> Updates caption if `uploadedBy === decoded.userId`.
- **Delete**: `POST /deletePost` (`token`, `postId`) -> Deletes document from DB and removes file from disk using `fs.unlink`.

---

## 3. Comments APIs

### 3.1 Add Comment
- **Endpoint**: `POST /addComment`
- **Request Body**: `{ "token": "<JWT_TOKEN>", "postId": "<POST_ID>", "comment": "Great shot!" }`
- **Flow**: Appends subdocument `{ userId, username, comment }` into `post.comments` array.

### 3.2 Delete Comment & Get Comments
- **Delete**: `POST /deleteComment` (`token`, `postId`, `commentId`) -> Removes subdocument if user is comment author or post owner.
- **Get**: `POST /getComments` (`postId`) -> Returns array of comments for a given post.

---

## 4. User Profile & Social Relationship APIs

### 4.1 Get User Details
- **Endpoint**: `POST /getUserDetails`
- **Request Body**: `{ "token": "<JWT_TOKEN>", "userId": "<TARGET_USER_ID>" }`
- **Response Data**: Returns `username`, `followers` count, `following` count, total `posts` count, `isYoufollowed` boolean, `isThisYou` boolean, and user theme.

### 4.2 Toggle Follow / Unfollow
- **Endpoint**: `POST /toggleFollow`
- **Request Body**: `{ "token": "<JWT_TOKEN>", "userId": "<TARGET_USER_ID>" }`
- **Flow**: Symmetrically updates target user's `followers` array and current user's `following` array.

### 4.3 Get Suggested Users
- **Endpoint**: `POST /getSuggestedUsers`
- **Request Body**: `{ "token": "<JWT_TOKEN>" }`
- **Flow**: Queries up to 5 users where current user is neither the user itself nor in their followers list.

---

## 5. Direct Messaging & Real-Time Socket.io Protocol

```
+---------------+                    +---------------+                    +---------------+
|  Client A     |                    | Node Server   |                    |  Client B     |
+---------------+                    +---------------+                    +---------------+
        |                                    |                                    |
        |--- 1. socket.connect() ----------->|                                    |
        |--- 2. emit("registerUser", A_id) ->| [Maps A_id -> socketA.id]         |
        |                                    |--- emit("onlineUsers", ids) ------>|
        |                                    |                                    |
        |--- 3. emit("typing", {B_id}) ----->|                                    |
        |                                    |--- emit("typing", {A_id}) -------->|
        |                                    |                                    |
        |--- 4. emit("sendMessage", data) -->|                                    |
        |                                    | [Saves to DB: Message model]       |
        |                                    | [Populates sharedPost if present]   |
        |<-- emit("receiveMessage", msg) ----|                                    |
        |                                    |--- emit("receiveMessage", msg) --->|
```

### 5.1 Socket Event Summary
| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `registerUser` | Client -> Server | `userId` | Registers client's active Socket ID to user map. |
| `onlineUsers` | Server -> Client | `Array<userId>` | Broadcasts list of currently online user IDs. |
| `sendMessage` | Client -> Server | `{ senderId, receiverId, message, sharedPost }` | Saves message to MongoDB and forwards to recipient & sender. |
| `receiveMessage` | Server -> Client | `Message Document` | Delivered to recipient (if online) and echoed to sender. |
| `typing` | Bidirectional | `{ senderId, receiverId, isTyping }` | Displays live typing indicator in active chat window. |
