import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { editPost } from '../api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditPostPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: '',
    content: '',
    is_published: false,
    author_id: Number(localStorage.getItem('user_id')) || 0,
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
        // Filter out any tags with the name "None" (if necessary)
        const availableTags = tagResponse.data.filter((tag: any) => tag.name !== 'None');
        setTags(availableTags);
        // Set the selected tag to the first available tag from the post, if any
        setSelectedTag(fetchedPost.tags.length > 0 ? fetchedPost.tags[0].id.toString() : '');
      } catch (err) {
        setError('Failed to load post data');
        console.error(err);
      }
    };

    fetchPost();
  }, [id]);

  // Handler for checkbox change using e.target.checked
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    console.log("Checkbox value:", checked);
    setPost((prevPost) => ({
      ...prevPost,
      is_published: checked,
    }));
  };

  const handleSave = async () => {
    try {
      const updatedPost = {
        title: post.title,
        content: post.content,
        is_published: post.is_published,
        author_id: post.author_id,
        tag_ids: selectedTag ? [parseInt(selectedTag, 10)] : [],
      };

      console.log("Updated post payload:", updatedPost);
      await editPost(id, updatedPost);
      navigate('/my-posts');
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6 text-blue-800">Edit Post</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
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
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Content:</label>
        <ReactQuill
          theme="snow"
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
          className="bg-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Select Tag:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          {tags.map((tag: any) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <input
          type="checkbox"
          checked={post.is_published}
          onChange={handleCheckboxChange}
          className="mr-2"
        />
        <label className="text-gray-700 font-medium">Publish</label>
      </div>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditPostPage;
