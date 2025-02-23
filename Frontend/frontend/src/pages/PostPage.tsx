import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import RatingStars from '../components/RatingStars';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError('Failed to fetch the post.');
        console.error(err);
      }
    };
    fetchPost();
  }, [id]);

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (!post) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 bg-white shadow-lg rounded-lg">
      {/* Título */}
      <h1
        className="text-4xl font-bold mb-6 text-blue-800"
        dangerouslySetInnerHTML={{ __html: post.title }}
      />

      {/* Autor y Fecha */}
      <p className="text-gray-600 mb-4">
        By {post.author.username} on {new Date(post.created_at).toLocaleDateString()}
      </p>

      {/* Etiquetas */}
      <div className="mb-4">
        {post.tags?.length > 0 ? (
          <div className="flex flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-2"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No tags assigned</p>
        )}
      </div>

      {/* Contenido */}
      <div
        className="text-gray-800 leading-relaxed mb-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Sección de rating (solo promedio) */}
      <div className="flex items-center mb-6">
        {post.average_rating && post.average_rating > 0 ? (
          <>
            <RatingStars rating={post.average_rating} />
            <span className="text-gray-600 ml-2 text-sm">
              {post.average_rating.toFixed(1)} / 5
            </span>
          </>
        ) : (
          <span className="text-gray-500 text-sm">No ratings yet</span>
        )}
      </div>

      {/* Botón para volver */}
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition w-full"
      >
        ⬅️ Back to Home
      </button>
    </div>
  );
};

export default PostPage;
