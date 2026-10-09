import React, { useState, useRef, useCallback, useEffect } from 'react';
import './DualRangeSlider.css';

export default function DualRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const [localMin, setLocalMin] = useState(valueMin ?? min);
  const [localMax, setLocalMax] = useState(valueMax ?? max);
  const debounceRef = useRef(null);
  const trackRef = useRef(null);

  // Sync when parent props change (e.g. on filter clear)
  useEffect(() => { setLocalMin(valueMin ?? min); }, [valueMin, min]);
  useEffect(() => { setLocalMax(valueMax ?? max); }, [valueMax, max]);

  const range = max - min || 1;
  const leftPct  = ((localMin - min) / range) * 100;
  const rightPct = ((max - localMax) / range) * 100;

  const debounce = (fn) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 300);
  };

  const handleMin = useCallback((e) => {
    const v = Math.min(Number(e.target.value), localMax - 1);
    setLocalMin(v);
    debounce(() => onChange(v, localMax));
  }, [localMax, onChange]);

  const handleMax = useCallback((e) => {
    const v = Math.max(Number(e.target.value), localMin + 1);
    setLocalMax(v);
    debounce(() => onChange(localMin, v));
  }, [localMin, onChange]);

  return (
    <div className="drs-wrap">
      <div className="drs-track-bg" ref={trackRef}>
        <div
          className="drs-track-fill"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
      </div>
      <input
        type="range"
        className="drs-input drs-input--min"
        min={min}
        max={max}
        value={localMin}
        onChange={handleMin}
        aria-label="Minimum price"
      />
      <input
        type="range"
        className="drs-input drs-input--max"
        min={min}
        max={max}
        value={localMax}
        onChange={handleMax}
        aria-label="Maximum price"
      />
      <div className="drs-labels">
        <span className="drs-label">₹{localMin.toLocaleString('en-IN')}</span>
        <span className="drs-label">₹{localMax.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
