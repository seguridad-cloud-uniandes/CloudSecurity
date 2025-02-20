import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditPublishedPostPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: '',                // Texto plano para el título
    content: '',              // Contenido en HTML
    is_published: true,
    author_id: 0,
    tag_ids: [] as number[],
  });
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/posts/${id}`);
        const fetchedPost = response.data;

        setPost({
          title: fetchedPost.title,
          content: fetchedPost.content,
          is_published: fetchedPost.is_published,
          author_id: fetchedPost.author.id,
          tag_ids: fetchedPost.tags.map((tag: any) => tag.id),
        });

        const tagResponse = await api.get('/tags/tags');
        setTags(tagResponse.data);

        if (fetchedPost.tags.length > 0) {
          setSelectedTag(fetchedPost.tags[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load post data');
        console.error(err);
      }
    };

    fetchPost();
  }, [id]);

  const handleSave = async () => {
    try {
      const updatedPost = {
        ...post,
        tag_ids: selectedTag ? [parseInt(selectedTag, 10)] : [],
      };

      // Actualizar post
      await api.put(`/posts/posts/${id}`, updatedPost);
      // Actualizar el estado de publicación
      await api.patch(`/posts/posts/${id}/publish?publish=${post.is_published}`);
      
      // Redirigir a HomePage
      navigate('/');
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6 text-blue-800">Edit Published Post</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Título (Texto Plano) */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Title:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          placeholder="Enter your title"
        />
      </div>

      {/* Editor WYSIWYG para el contenido */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Content:</label>
        <ReactQuill
          theme="snow"
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
          className="bg-white"
        />
      </div>

      {/* Selección de Etiqueta */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Select Tag:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">None</option>
          {tags.map((tag: any) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Checkbox para Publicar */}
      <div className="mb-4">
        <input
          type="checkbox"
          checked={post.is_published}
          onChange={() => setPost({ ...post, is_published: !post.is_published })}
          className="mr-2"
        />
        <label className="text-gray-700 font-medium">Publish</label>
      </div>

      {/* Botón para guardar los cambios y volver a HomePage */}
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditPublishedPostPage;
