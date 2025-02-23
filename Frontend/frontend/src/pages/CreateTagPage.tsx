import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CreateTagPage = () => {
  const navigate = useNavigate();
  const [tagName, setTagName] = useState('');
  const [error, setError] = useState('');

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      setError('Tag name is required.');
      return;
    }
    try {
      await api.post('/tags/tags', { name: tagName });
      alert('Tag created successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to create tag. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Create New Tag</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter tag name"
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        onClick={handleCreateTag}
      >
        ➕ Create Tag
      </button>
    </div>
  );
};

export default CreateTagPage;
