// src/components/RatingStars.tsx
import React from 'react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, maxStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = maxStars - fullStars - halfStar;

  const stars = [];

  // Estrellas llenas
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg
        key={`full-${i}`}
        className="w-5 h-5 text-yellow-500 inline-block"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z" />
      </svg>
    );
  }

  // Media estrella
  if (halfStar) {
    stars.push(
      <svg
        key="half"
        className="w-5 h-5 text-yellow-500 inline-block"
        viewBox="0 0 20 20"
      >
        {/* Se usa un clipPath para mostrar la mitad de la estrella */}
        <defs>
          <clipPath id="half">
            <rect x="0" y="0" width="10" height="20" />
          </clipPath>
        </defs>
        <path
          clipPath="url(#half)"
          fill="currentColor"
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z"
        />
        <path
          fill="none"
          stroke="currentColor"
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z"
        />
      </svg>
    );
  }

  // Estrellas vacías
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg
        key={`empty-${i}`}
        className="w-5 h-5 text-gray-300 inline-block"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z" />
      </svg>
    );
  }

  return <div className="flex">{stars}</div>;
};

export default RatingStars;
