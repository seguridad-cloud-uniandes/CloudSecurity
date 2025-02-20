// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { fetchPublishedPosts, deletePost, submitRating } from '../api';
import RatingStars from '../components/RatingStars';
import InteractiveRatingStars from '../components/InteractiveRatingStars';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10; // Número de posts por página en el frontend
  const userId = Number(localStorage.getItem('user_id'));

  // Para paginación uniforme, obtenemos muchos posts publicados desde el backend
  const getPosts = async () => {
    try {
      // Se solicita un tamaño amplio (por ejemplo, 50) para tener todos los posts publicados
      const data = await fetchPublishedPosts(1, 50);
      setPosts(data.posts);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      setError('Error fetching posts.');
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('https://pocblog-dev-alb-1155122966.us-east-1.elb.amazonaws.com:8443/tags/tags');
        const tagData = await response.json();
        setTags(tagData);
      } catch (error) {
        console.error('❌ Failed to fetch tags:', error);
      }
    };
    fetchTags();
  }, []);

  const handleDelete = async (postId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;
    try {
      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete post:', error);
      alert('Failed to delete post.');
    }
  };

  const handlePostRatingSelect = async (postId: number, rating: number) => {
    try {
      const data = await submitRating(postId, rating, userId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return { ...post, average_rating: data.new_average, user_rating: rating };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating.");
    }
  };

  // Filtrar únicamente los posts publicados
  const publishedPosts = posts.filter(
    (post) => post.is_published === true || post.is_published === 'true'
  );

  // Aplicar filtro por etiqueta si se selecciona
  const filteredPosts = selectedTag
    ? publishedPosts.filter((post) =>
        post.tags?.some((tag: any) => tag.name === selectedTag)
      )
    : publishedPosts;

  // Paginación en el frontend sobre el array filtrado
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">🌐 Public Posts</h1>

        {/* Dropdown para filtrar por etiqueta */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Filter by Tag:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              setPage(1); // Reinicia a la primera página al filtrar
            }}
          >
            <option value="">All Tags</option>
            {tags.map((tag: any) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {paginatedPosts.length === 0 ? (
          <p className="text-center text-gray-600">No published posts available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post: any) => (
              <div
                key={post.id}
                className="bg-white shadow-lg rounded-lg p-5 hover:shadow-xl transition duration-300 relative"
              >
                {/* Botón de eliminación */}
                {post.author.id === userId && (
                  <button
                    className="absolute top-2 right-2 text-black text-xl font-bold"
                    onClick={() => handleDelete(post.id)}
                  >
                    ✖️
                  </button>
                )}

                {/* Título */}
                <h2
                  className="text-2xl font-semibold text-gray-900 mb-2"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />

                {/* Autor y Fecha */}
                <p className="text-gray-500 text-sm mb-3">
                  By <span className="font-medium">{post.author.username}</span> ·{' '}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

                {/* Contenido */}
                <div
                  className="text-gray-700 mb-3"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Etiquetas */}
                <div className="flex flex-wrap mb-3">
                  {post.tags?.length > 0 ? (
                    post.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-2"
                      >
                        #{tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No tags</span>
                  )}
                </div>

                {/* Sección de calificación */}
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    {post.average_rating !== undefined ? (
                      <>
                        <RatingStars rating={post.average_rating} />
                        <span className="text-gray-600 text-sm ml-2">
                          {post.average_rating.toFixed(1)} / 5
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">No ratings yet</span>
                    )}
                  </div>
                  {userId && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm mb-1">Your Rating:</span>
                      <InteractiveRatingStars
                        currentRating={post.user_rating || 0}
                        onRatingSelect={(rating: number) => handlePostRatingSelect(post.id, rating)}
                      />
                    </div>
                  )}
                </div>

                {/* Enlaces para ver o editar el post */}
                <div className="mt-4 flex justify-between items-center">
                  <a
                    href={`/post/${post.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    🔍 View Post
                  </a>
                  {post.author.id === userId && (
                    <a
                      href={`/edit-published-post/${post.id}`}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
                    >
                      ✏️ Edit
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controles de Paginación Uniformes */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded mr-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded ml-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
