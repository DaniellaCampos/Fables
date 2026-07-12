import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/floating-accessory-carousel.css';

/**
 * FloatingAccessoryCarousel
 * Shows accessory options (typography, decorations, etc.) floating past the fixed canvas
 * Handles keyboard, mouse, touch, and drag interactions
 */
export default function FloatingAccessoryCarousel({
  items = [],
  activeIndex = 0,
  onChange,
  category = 'typography',
  renderOption
}) {
  const [startX, setStartX] = useState(null);
  const containerRef = useRef(null);

  const handlePrev = () => {
    onChange((activeIndex - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    onChange((activeIndex + 1) % items.length);
  };

  const handlePointerDown = (e) => {
    setStartX(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (startX === null) return;

    const delta = e.clientX - startX;

    if (Math.abs(delta) > 35) {
      if (delta < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    setStartX(null);
  };

  const handlePointerMove = () => {
    if (startX === null) return;
    // Optional: Add visual feedback for drag
  };

  return (
    <div className="floating-accessory-carousel">
      <button
        className="carousel-arrow carousel-prev"
        onClick={handlePrev}
        aria-label="Opción anterior"
      >
        <ChevronLeft />
      </button>

      <div
        ref={containerRef}
        className="carousel-track"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={() => setStartX(null)}
      >
        {items.map((item, index) => {
          const offset = index - activeIndex;

          // Hide items that are too far
          if (Math.abs(offset) > 1.5) return null;

          return (
            <button
              key={item.id || item.name || index}
              className={`carousel-item ${offset === 0 ? 'active' : ''} offset-${offset > 0 ? 'next' : 'prev'}`}
              onClick={() => onChange(index)}
              style={{
                '--offset': offset
              }}
              aria-pressed={offset === 0}
            >
              <div className="carousel-item-content">
                {renderOption ? renderOption(item, index, offset === 0) : <DefaultOption item={item} category={category} active={offset === 0} />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="carousel-arrow carousel-next"
        onClick={handleNext}
        aria-label="Opción siguiente"
      >
        <ChevronRight />
      </button>
    </div>
  );
}

function DefaultOption({ item, category, active }) {
  if (category === 'image') {
    return (
      <div className="option-visual image-option">
        <img src={item.url} alt={item.name} />
        <span>{item.name}</span>
      </div>
    );
  }

  if (category === 'palette') {
    return (
      <div className="option-visual palette-option">
        <div>
          {item.colors.map((c) => (
            <i style={{ background: c }} key={c} />
          ))}
        </div>
        <span>{item.name}</span>
      </div>
    );
  }

  if (category === 'filter') {
    return (
      <div className="option-visual filter-option">
        <div style={{ filter: item.css }} />
        <span>{item.name}</span>
      </div>
    );
  }

  if (category === 'typography') {
    return (
      <div className="option-visual type-option">
        <b>Aa</b>
        <span>{item.name}</span>
        {active && <small>Lista para usar</small>}
      </div>
    );
  }

  if (category === 'textPosition') {
    return (
      <div className="option-visual position-option">
        <i className="position-mark" />
        <span>{item.name}</span>
      </div>
    );
  }

  if (category === 'decoration') {
    return (
      <div className="option-visual decoration-option">
        <span className="decoration-symbol">{item.symbol}</span>
        <span className="decoration-name">{item.name}</span>
      </div>
    );
  }

  // Default: text options (CTA, headlines, etc.)
  return (
    <div className="option-visual copy-option">
      <b>{category === 'cta' ? '→' : '"'}</b>
      <span>{item.name}</span>
      {active && <small>Lista para probar</small>}
    </div>
  );
}
