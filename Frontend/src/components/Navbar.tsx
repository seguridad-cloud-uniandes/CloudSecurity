import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtén la ruta actual
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/tags/tags');
        setTags(response.data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    fetchTags();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const isAuthenticated = localStorage.getItem("token");

  return (
    <nav className="bg-blue-800 text-white p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-blue-300">
          🔐 Cloud Security Blog
        </Link>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-blue-300">Home</Link>
          {isAuthenticated && <Link to="/my-posts" className="hover:text-blue-300">My Posts</Link>}
          {isAuthenticated && <Link to="/create-post" className="hover:text-blue-300">New Post</Link>}
          {isAuthenticated && <Link to="/create-tag" className="hover:text-blue-300">Create Tag</Link>}
          {!isAuthenticated ? (
            <Link to="/login" className="hover:text-blue-300">Login</Link>
          ) : (
            <button onClick={handleLogout} className="hover:text-blue-300">Logout</button>
          )}
        </div>
      </div>

      {/* Renderiza la lista de etiquetas sólo en la ruta /create-tag */}
      {location.pathname === '/create-tag' && (
        <div className="mt-4 bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">Available Tags:</h2>
          <ul className="list-disc ml-5 text-gray-700">
            {tags.length > 0 ? (
              tags.map(tag => (
                <li key={tag.id}>#{tag.name}</li>
              ))
            ) : (
              <li>No tags available.</li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
