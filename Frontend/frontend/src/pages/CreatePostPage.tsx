import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, fetchAllTags } from '../api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(''); // Inicialmente vacío
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const availableTags = await fetchAllTags();
        // Filtramos y dejamos solo las tags válidas
        setTags(availableTags.filter(tag => tag.name !== 'None'));
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async () => {
    if (!title || content.length < 10) {
      setError('Title is required and content must be at least 10 characters.');
      return;
    }

    try {
      // Si selectedTag está vacío, se crea el post sin tag.
      await createPost(title, content, isPublished, selectedTag);
      navigate('/my-posts');
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">Create New Post</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Title:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your title here..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Content:</label>
        <ReactQuill
          value={content}
          onChange={setContent}
          placeholder="Write your content here..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Select Tag:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          {/* Opción para no seleccionar ningún tag */}
          <option value="">-- No tags --</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <input
          type="checkbox"
          className="mr-2"
          checked={isPublished}
          onChange={() => setIsPublished(!isPublished)}
        />
        <label className="text-gray-700 font-medium">Publish</label>
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 w-full"
        onClick={handleSubmit}
      >
        🚀 Create Post
      </button>
    </div>
  );
};

export default CreatePostPage;
