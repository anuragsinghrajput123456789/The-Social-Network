export const API_BASE_URL = "http://localhost:3000";

const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const request = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const config = {
    mode: "cors",
    method: options.method || "POST",
    headers: {
      ...getHeaders(isFormData),
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    return {
      success: false,
      msg: error.message || "Network request failed"
    };
  }
};

export const api = {
  // Auth
  signup: (userData) => request("/signup", { body: JSON.stringify(userData) }),
  signUp: (userData) => request("/signup", { body: JSON.stringify(userData) }),
  login: (credentials) => request("/login", { body: JSON.stringify(credentials) }),

  // User & Profile
  getUserDetails: (userId) =>
    request("/getUserDetails", {
      body: JSON.stringify({ token: localStorage.getItem("token"), userId })
    }),
  toggleFollow: (userId) =>
    request("/toggleFollow", {
      body: JSON.stringify({ token: localStorage.getItem("token"), userId })
    }),
  updateTheme: (theme) =>
    request("/updateTheme", {
      body: JSON.stringify({ token: localStorage.getItem("token"), theme })
    }),
  getSuggestedUsers: () =>
    request("/getSuggestedUsers", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),
  getFollowersList: (userId) =>
    request("/getFollowersList", {
      body: JSON.stringify({ token: localStorage.getItem("token"), userId })
    }),
  getFollowingList: (userId) =>
    request("/getFollowingList", {
      body: JSON.stringify({ token: localStorage.getItem("token"), userId })
    }),

  // Posts
  createPost: (formData) => request("/createPost", { body: formData }),
  getPosts: (page = 1, limit = 10) =>
    request("/getPosts", {
      body: JSON.stringify({ token: localStorage.getItem("token"), page, limit })
    }),
  getMyPosts: (userId) =>
    request("/getMyPosts", {
      body: JSON.stringify({ token: localStorage.getItem("token"), userId })
    }),
  toggleLike: (postId) =>
    request("/toggleLike", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId })
    }),
  toggleSavePost: (postId) =>
    request("/toggleSavePost", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId })
    }),
  getSavedPosts: () =>
    request("/getSavedPosts", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),
  editPost: (postId, caption) =>
    request("/editPost", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId, caption })
    }),
  deletePost: (postId) =>
    request("/deletePost", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId })
    }),

  // Comments
  addComment: (postId, comment) =>
    request("/addComment", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId, comment })
    }),
  deleteComment: (postId, commentId) =>
    request("/deleteComment", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId, commentId })
    }),
  getComments: (postId) =>
    request("/getComments", {
      body: JSON.stringify({ postId })
    }),

  // Chat
  getChatMessages: (otherUserId, page = 1, limit = 30) =>
    request("/getChatMessages", {
      body: JSON.stringify({ token: localStorage.getItem("token"), otherUserId, page, limit })
    }),
  getMessages: (otherUserId, page = 1, limit = 30) =>
    request("/getMessages", {
      body: JSON.stringify({ token: localStorage.getItem("token"), otherUserId, page, limit })
    }),
  sendMessage: (payload) => {
    if (payload instanceof FormData) {
      return request("/sendMessage", { body: payload });
    }
    return request("/sendMessage", {
      body: JSON.stringify({ token: localStorage.getItem("token"), ...payload })
    });
  },
  searchMessages: (otherUserId, query) =>
    request("/searchMessages", {
      body: JSON.stringify({ token: localStorage.getItem("token"), otherUserId, query })
    }),
  // Stories
  uploadStory: (formData) => request("/uploadStory", { body: formData }),
  getFeedStories: () =>
    request("/getFeedStories", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),
  viewStory: (storyId) =>
    request("/viewStory", {
      body: JSON.stringify({ token: localStorage.getItem("token"), storyId })
    }),
  // Explore
  getExploreData: () =>
    request("/getExploreData", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),

  // User Collections & Settings
  createCollection: (name) =>
    request("/createCollection", {
      body: JSON.stringify({ token: localStorage.getItem("token"), name })
    }),
  getUserCollections: () =>
    request("/getUserCollections", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),
  updateUserSettings: (settingsData) =>
    request("/updateUserSettings", {
      body: JSON.stringify({ token: localStorage.getItem("token"), ...settingsData })
    }),
  acceptFollowRequest: (requesterId) =>
    request("/acceptFollowRequest", {
      body: JSON.stringify({ token: localStorage.getItem("token"), requesterId })
    }),
  incrementPostView: (postId) =>
    request("/incrementPostView", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId })
    }),
  getPostAnalytics: (postId) =>
    request("/getPostAnalytics", {
      body: JSON.stringify({ token: localStorage.getItem("token"), postId })
    }),

  // Notifications
  getNotifications: () =>
    request("/getNotifications", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),
  markNotificationsRead: () =>
    request("/markNotificationsRead", {
      body: JSON.stringify({ token: localStorage.getItem("token") })
    }),

  // Search
  search: (query) =>
    request("/search", {
      body: JSON.stringify({ token: localStorage.getItem("token"), query })
    })
};

