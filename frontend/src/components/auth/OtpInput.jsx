import React, { useRef, useEffect } from 'react';

export default function OtpInput({
  length = 6,
  value = Array(length).fill(''),
  onChange,
  onComplete,
  disabled = false,
}) {
  const inputsRef = useRef([]);
  const hasCompletedRef = useRef(false);
  const prevDisabledRef = useRef(disabled);

  // Normalize digits to ensure an array of length `length` with empty strings
  const digits = Array.isArray(value)
    ? Array.from({ length }, (_, i) => (value[i] !== undefined ? String(value[i]) : ''))
    : Array.from({ length }, (_, i) => value[i] || '');

  // 1. Auto-focus only on initial mount
  useEffect(() => {
    if (!disabled && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Refocus the first empty box when disabled transitions from true to false
  useEffect(() => {
    if (prevDisabledRef.current && !disabled) {
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
      inputsRef.current[targetIndex]?.focus();
    }
    prevDisabledRef.current = disabled;
  }, [disabled, digits]);

  // Helper to trigger onComplete only once when all boxes are filled
  const triggerCompletionCheck = (newDigits) => {
    const isFilled = newDigits.length === length && newDigits.every((d) => /^\d$/.test(d));
    if (isFilled) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        if (onComplete) {
          onComplete(newDigits.join(''));
        }
      }
    } else {
      hasCompletedRef.current = false;
    }
  };

  const handleChange = (e, index) => {
    const rawVal = e.target.value;

    // Handle clearing the box
    if (!rawVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      hasCompletedRef.current = false;
      if (onChange) onChange(newDigits);
      return;
    }

    // Validate only the last entered character to allow numeric digits only
    const lastChar = rawVal.slice(-1);
    if (!/^\d$/.test(lastChar)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    if (onChange) onChange(newDigits);

    // Auto-advance focus to the next box
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    triggerCompletionCheck(newDigits);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        // If current box has a digit, clear it without shifting
        newDigits[index] = '';
        hasCompletedRef.current = false;
        if (onChange) onChange(newDigits);
      } else if (index > 0) {
        // If current box is empty, move to previous box and clear its digit
        newDigits[index - 1] = '';
        hasCompletedRef.current = false;
        if (onChange) onChange(newDigits);
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      inputsRef.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      inputsRef.current[length - 1]?.focus();
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const sanitized = pastedData.replace(/\D/g, '');
    if (!sanitized) return;

    const newDigits = [...digits];
    // Fill starting from the currently focused index
    const chars = sanitized.slice(0, length - index).split('');
    chars.forEach((char, i) => {
      newDigits[index + i] = char;
    });

    if (onChange) onChange(newDigits);

    // Focus the next empty box or the last box
    const nextEmptyIndex = newDigits.findIndex((d) => !d);
    const focusTarget = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(index + chars.length, length - 1);
    inputsRef.current[focusTarget]?.focus();

    triggerCompletionCheck(newDigits);
  };

  return (
    <div className="otp-input-group">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          value={digits[index]}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          className={`otp-digit-box ${digits[index] ? 'has-value' : ''}`}
        />
      ))}
    </div>
  );
}
