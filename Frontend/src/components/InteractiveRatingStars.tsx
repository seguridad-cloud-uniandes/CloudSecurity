// src/components/InteractiveRatingStars.tsx
import React, { useState } from "react";

interface InteractiveRatingStarsProps {
  currentRating: number; // La calificación actual del usuario (o 0 si aún no ha calificado)
  onRatingSelect: (rating: number) => void;
  disabled?: boolean;
}

const InteractiveRatingStars: React.FC<InteractiveRatingStarsProps> = ({
  currentRating,
  onRatingSelect,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseMove = (event: React.MouseEvent, starIndex: number) => {
    if (disabled) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    // Determina el valor: si el cursor está en la mitad izquierda, se asigna starIndex + 0.5, de lo contrario starIndex + 1.
    const newRating = offsetX < rect.width / 2 ? starIndex + 0.5 : starIndex + 1;
    setHoverRating(newRating);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(null);
  };

  const handleClick = (starIndex: number) => {
    if (disabled) return;
    // Usa el valor de hover si existe, sino el currentRating (aunque generalmente siempre habrá hover al hacer click)
    const finalRating = hoverRating !== null ? hoverRating : currentRating;
    onRatingSelect(finalRating);
  };

  // Determina el rating a mostrar (si hay hover, se usa ese valor; de lo contrario, se usa currentRating)
  const displayRating = hoverRating !== null ? hoverRating : currentRating;

  // Renderiza 5 estrellas
  const stars = [];
  for (let i = 0; i < 5; i++) {
    let starType: "full" | "half" | "empty" = "empty";
    if (displayRating >= i + 1) {
      starType = "full";
    } else if (displayRating >= i + 0.5) {
      starType = "half";
    }

    stars.push(
      <div
        key={i}
        onMouseMove={(e) => handleMouseMove(e, i)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(i)}
        className="cursor-pointer inline-block"
      >
        {starType === "full" && (
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z" />
          </svg>
        )}
        {starType === "half" && (
          <svg
            className="w-6 h-6 text-yellow-500"
            viewBox="0 0 20 20"
          >
            <defs>
              <clipPath id={`half-clip-${i}`}>
                <rect x="0" y="0" width="10" height="20" />
              </clipPath>
            </defs>
            <path
              clipPath={`url(#half-clip-${i})`}
              fill="currentColor"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z"
            />
          </svg>
        )}
        {starType === "empty" && (
          <svg
            className="w-6 h-6 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.37-2.449a1 1 0 00-1.175 0l-3.37 2.449c-.783.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.07 9.383c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.956z" />
          </svg>
        )}
      </div>
    );
  }

  return <div>{stars}</div>;
};

export default InteractiveRatingStars;
