import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Título */}
      <h2 className="text-2xl font-semibold text-gray-900">{post.title}</h2>

      {/* Autor y fecha */}
      <p className="text-gray-500 text-sm mt-2">
        By <span className="font-medium text-gray-700">{post.author.username}</span> ·{" "}
        {new Date(post.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Contenido (extracto) */}
      <p className="text-gray-700 mt-3 line-clamp-3">
        {post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap mt-4">
        {post.tags.length > 0 ? (
          post.tags.map((tag) => (
            <span key={tag.id} className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full mr-2 mb-2">
              #{tag.name}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">No tags</span>
        )}
      </div>

      {/* Botón de leer más */}
      <Link to={`/post/${post.id}`} className="mt-4 inline-block text-blue-600 font-medium hover:underline transition-colors">
        Read more →
      </Link>
    </div>
  );
};

export default PostCard;
