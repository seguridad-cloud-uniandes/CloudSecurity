import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PostPage from "../pages/PostPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CreatePostPage from "../pages/CreatePostPage";
import EditPostPage from "../pages/EditPostPage";
import NotFound from "../pages/NotFound";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MyPostsPage from "../pages/MyPostsPage";
import EditPublishedPostPage from "../pages/EditPublishedPostPage";
import ProtectedRoute from "../components/ProtectedRoute";
import CreateTagPage from "../pages/CreateTagPage";
import RequestPasswordResetPage from "../pages/RequestPasswordResetPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Rutas públicas para reseteo de contraseña */}
          <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-post/:id"
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-published-post/:id"
            element={
              <ProtectedRoute>
                <EditPublishedPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-tag"
            element={
              <ProtectedRoute>
                <CreateTagPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default AppRouter;
