import React, { useEffect, useState } from 'react';
import { fetchUserDraftPosts, deletePost } from '../api';

const MyPostsPage: React.FC = () => {
  const [allDrafts, setAllDrafts] = useState<any[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10; // Cantidad de posts por página en el frontend
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState('');
  const userId = Number(localStorage.getItem('user_id'));

  // Función para obtener todos los posts (amplio size) y filtrar los borradores
  const getDraftPosts = async () => {
    try {
      // Se solicita una cantidad amplia para obtener todos los posts publicados (y no publicados)
      const data = await fetchUserDraftPosts(1, 100);
      console.log("Response posts from API:", data.posts);
      // Filtrar los posts que sean del usuario actual y que no estén publicados.
      const drafts = data.posts.filter((post: any) => {
        const authorId = Number(post.author?.id);
        // Se considera borrador si is_published es false, "false" o null/undefined
        return (
          authorId === userId &&
          (post.is_published === false || post.is_published === 'false' || !post.is_published)
        );
      });
      console.log("Draft posts after filtering:", drafts);
      setAllDrafts(drafts);
      setFilteredDrafts(drafts);
    } catch (error) {
      console.error('❌ Failed to fetch draft posts:', error);
      setError('Error fetching draft posts.');
    }
  };

  useEffect(() => {
    getDraftPosts();
  }, []);

  // Obtener etiquetas
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

  // Cada vez que se cambia la etiqueta seleccionada, filtrar los borradores y reiniciar la página a 1
  useEffect(() => {
    if (selectedTag) {
      setFilteredDrafts(
        allDrafts.filter((post) =>
          post.tags?.some((tag: any) => tag.name === selectedTag)
        )
      );
      setPage(1);
    } else {
      setFilteredDrafts(allDrafts);
    }
  }, [selectedTag, allDrafts]);

  // Calcular la paginación en el frontend
  const totalPages = Math.ceil(filteredDrafts.length / pageSize);
  const paginatedPosts = filteredDrafts.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (postId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;
    try {
      await deletePost(postId);
      setAllDrafts((prev) => prev.filter((post) => post.id !== postId));
      // También actualizar el array filtrado
      setFilteredDrafts((prev) => prev.filter((post) => post.id !== postId));
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete post:', error);
      alert('Failed to delete post.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">📝 My Draft Posts</h1>

        {/* Dropdown para filtrar por etiqueta */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Filter by Tag:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map((tag: any) => (
              <option key={tag.id} value={tag.name}>{tag.name}</option>
            ))}
          </select>
        </div>

        {paginatedPosts.length === 0 ? (
          <p className="text-center text-gray-600">No draft posts found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post: any) => (
              <div
                key={post.id}
                className="bg-white shadow-lg rounded-lg p-5 hover:shadow-xl transition duration-300 relative"
              >
                {/* Botón de eliminación */}
                {Number(post.author?.id) === userId && (
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

                {/* Fecha de Creación */}
                <p className="text-gray-500 text-sm mb-3">
                  Created on {new Date(post.created_at).toLocaleDateString()}
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
                        className="bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-2"
                      >
                        #{tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No tags</span>
                  )}
                </div>

                {/* Botón de edición */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => window.location.assign(`/edit-post/${post.id}`)}
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
                  >
                    ✏️ Edit
                  </button>
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

export default MyPostsPage;
