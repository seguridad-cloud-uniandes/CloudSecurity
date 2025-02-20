import axios from "axios";

// Base URL (Asegúrate de que el backend está corriendo con HTTPS si usas https://)
//const API_URL = "https://127.0.0.1:8000";

// Usa la variable de entorno o un valor por defecto
export const API_URL = import.meta.env.VITE_API_BASE_URL || "https://backend:8000";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401, probablemente el token esté expirado o inválido
    if (error.response && error.response.status === 401) {
      // Elimina el token y cualquier otro dato de autenticación
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      // Redirige al login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Function to set Auth Token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// ✅ Login function
export const login = async (username: string, password: string) => {
  const response = await api.post(
    "/auth/login",
    new URLSearchParams({
      grant_type: "password",
      username,
      password,
      scope: "",
      client_id: "string",
      client_secret: "string",
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const { access_token, user_id } = response.data;

  if (!access_token || !user_id) {
    throw new Error("Login failed: Missing token or user ID.");
  }

  // ✅ Store token and user ID
  setAuthToken(access_token);
  localStorage.setItem("user_id", user_id);
  console.log("✅ Login successful:", { token: access_token, user_id });

  return response.data;
};


// ✅ Helper to get user_id
export const getUserId = () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) throw new Error("User ID is missing. Please log in again.");
  return Number(userId);
};


// ✅ Fetch Posts
export const fetchPublishedPosts = async (page = 1, size = 10) => {
  try {
    const response = await api.get(`/posts/posts?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching published posts:", error);
    return { total: 0, page: 1, size: size, posts: [] };
  }
};


// ✅ Fetch only the current user's drafts with pagination
export const fetchUserDraftPosts = async (page = 1, size = 10) => {
  const token = localStorage.getItem("token");
  const userId = getUserId();

  if (!token) throw new Error("User is not authenticated.");

  try {
    const response = await api.get(`/posts/posts?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Response posts:", response.data.posts);

    // Filtrar borradores:
    const drafts = response.data.posts.filter((post: any) => {
      // Convertir el is_published a boolean:
      const published = post.is_published === true || post.is_published === 'true' || post.is_published === 1;
      const authorId = Number(post.author?.id);
      console.log(`Post id: ${post.id} | authorId: ${authorId} | userId: ${userId} | published: ${published}`);
      return authorId === userId && !published;
    });

    console.log("Draft posts fetched:", drafts);
    return {
      total: drafts.length,
      page,
      size,
      posts: drafts,
    };
  } catch (error) {
    console.error("❌ Failed to fetch draft posts:", error.response?.data || error);
    return { total: 0, page, size, posts: [] };
  }
};


  
export default api;

export const createPost = async (title: string, content: string, isPublished: boolean) => {
  const userId = getUserId();
  
  if (!userId) {
    throw new Error("❌ Error: User ID is missing. Please log in again.");
  }

  const postData = {
    title,
    content,
    is_published: isPublished,
    author_id: userId,
    tag_ids: [],
  };

  console.log("📌 Creating Post:", JSON.stringify(postData, null, 2));

  try {
    const response = await api.post("/posts/posts", postData);
    console.log("✅ Post created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to create post:", error.response?.data || error);
    throw error;
  }
};

// ✅ Edit an existing published post
export const editPublishedPost = async (id: number, postData: any) => {
  console.log(`🔍 Editing published post ID: ${id}`, postData);
  try {
    const response = await api.put(`/posts/posts/${id}`, postData);
    console.log("✅ Published post edited:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error editing published post:", error.response?.data || error);
    throw error;
  }
};

// ✅ Toggle publish status
export const publishPost = async (id: number, publish: boolean) => {
  console.log(`🔍 Publishing post ID: ${id} | Status: ${publish}`);
  try {
    const response = await api.patch(`/posts/posts/${id}/publish?publish=${publish}`);
    console.log("✅ Publish status updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error publishing post:", error.response?.data || error);
    throw error;
  }
};

// ✅ Delete Post
export const deletePost = async (id: number) => {
  try {
    const response = await api.delete(`/posts/posts/${id}`);
    console.log(`✅ Post with ID ${id} deleted successfully.`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting post with ID ${id}:`, error.response?.data || error);
    throw error;
  }
};


// ✅ Fetch available tags
export const fetchAllTags = async () => {
  try {
    const response = await api.get('/tags/tags');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching tags:', error);
    return [];
  }
};


export const editPost = async (id: number, postData: any) => {
  console.log(`🔍 Editing post ID: ${id}`, postData);
  try {
    const response = await api.put(`/posts/posts/${id}`, postData);
    console.log("✅ Post edited successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error editing post:", error.response?.data || error);
    throw error;
  }
};

// En api.ts
export const submitRating = async (postId: number, rating: number, userId: number) => {
  try {
    const response = await api.post('/ratings/ratings', {
      rating,
      post_id: postId,
      user_id: userId,
    });
    console.log("✅ Rating submitted:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error submitting rating:", error);
    throw error;
  }
};
