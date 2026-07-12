import { useEffect, useRef } from 'react';
import { categoryDefs } from '../mocks/data';
import '../styles/category-bottom-bar.css';

export default function CategoryBottomBar({
  activeIndex,
  onCategoryChange,
  lockedCategories = {}
}) {
  const containerRef = useRef(null);
  const activeButtonRef = useRef(null);

  // Scroll active button into view
  useEffect(() => {
    if (activeButtonRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeIndex]);

  const handleKeyDown = (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onCategoryChange((activeIndex - 1 + categoryDefs.length) % categoryDefs.length);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onCategoryChange((activeIndex + 1) % categoryDefs.length);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, onCategoryChange]);

  return (
    <div className="category-bottom-bar">
      <div className="category-dock" ref={containerRef}>
        {categoryDefs.map((category, idx) => {
          const isActive = idx === activeIndex;
          const isLocked = lockedCategories[category.id];

          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              className={`category-button ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => onCategoryChange(idx)}
              title={`${category.label}${isLocked ? ' (bloqueada)' : ''}`}
              aria-pressed={isActive}
              aria-label={`${category.label} · ${category.description}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
              {isLocked && <span className="lock-indicator">🔒</span>}
            </button>
          );
        })}
      </div>

      <div className="category-footer">
        <span className="keyboard-hint">
          ↑↓ para categorías · ← → para opciones · Enter para agregar
        </span>
      </div>
    </div>
  );
}
