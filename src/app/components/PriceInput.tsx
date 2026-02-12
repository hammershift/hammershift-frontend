"use client";

import { useState, useEffect } from "react";

/**
 * PriceInput Component
 *
 * A specialized input for dollar amounts with formatting, validation, and a range slider.
 * Features:
 * - Dollar sign prefix
 * - Thousand separators (e.g., $75,000)
 * - JetBrains Mono font
 * - Range slider below input
 * - Min/max validation
 * - Error state styling
 *
 * @param value - Current numeric value
 * @param onChange - Callback when value changes
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @param label - Input label text (optional)
 * @param error - Error message to display (optional)
 */

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  error?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const parseCurrency = (formatted: string): number => {
  // Remove all non-digit characters
  const cleaned = formatted.replace(/[^\d]/g, "");
  return cleaned === "" ? 0 : parseInt(cleaned, 10);
};

export default function PriceInput({
  value,
  onChange,
  min = 0,
  max = 1000000,
  label,
  error,
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);

  // Sync external value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  // Sync external error changes
  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const validateValue = (numValue: number): string | undefined => {
    if (min !== undefined && numValue < min) {
      return `Minimum value is $${formatCurrency(min)}`;
    }
    if (max !== undefined && numValue > max) {
      return `Maximum value is $${formatCurrency(max)}`;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    const numValue = parseCurrency(input);
    const validationError = validateValue(numValue);
    setLocalError(validationError);

    if (!validationError) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseCurrency(displayValue);
    const validationError = validateValue(numValue);

    if (validationError) {
      // Reset to last valid value on blur if invalid
      setDisplayValue(formatCurrency(value));
      setLocalError(undefined);
    } else {
      // Format the display value
      setDisplayValue(formatCurrency(numValue));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalError(undefined);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    onChange(numValue);
    setDisplayValue(formatCurrency(numValue));
    setLocalError(undefined);
  };

  const hasError = !!localError;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          className="mb-2 block text-sm font-medium text-[#FFFFFF]"
          htmlFor="price-input"
        >
          {label}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div
          className={`
            flex items-center rounded-lg border
            ${
              hasError
                ? "border-[#E94560] focus-within:ring-2 focus-within:ring-[#E94560]/50"
                : "border-[#1E293B] focus-within:border-[#E94560] focus-within:ring-2 focus-within:ring-[#E94560]/50"
            }
            bg-[#1A1A3E] transition-all
          `}
        >
          {/* Dollar Sign Prefix */}
          <span className="pl-4 font-mono text-lg font-medium text-[#94A3B8]">
            $
          </span>

          {/* Input */}
          <input
            id="price-input"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="
              w-full bg-transparent px-2 py-3 pr-4
              font-mono text-lg font-medium text-white
              outline-none placeholder:text-[#64748B]
            "
            placeholder="0"
            aria-label={label || "Price input"}
            aria-invalid={hasError}
            aria-describedby={hasError ? "price-error" : undefined}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id="price-error"
            className="mt-1 text-sm text-[#E94560]"
            role="alert"
          >
            {localError}
          </p>
        )}
      </div>

      {/* Range Slider */}
      <div className="mt-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="
            h-2 w-full appearance-none rounded-lg
            bg-[#1A1A3E] outline-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#E94560]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            hover:[&::-webkit-slider-thumb]:bg-[#ff5571]
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:bg-[#E94560]
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            hover:[&::-moz-range-thumb]:bg-[#ff5571]
          "
          aria-label="Price range slider"
        />

        {/* Min/Max Labels */}
        <div className="mt-1 flex justify-between text-xs text-[#64748B]">
          <span className="font-mono">${formatCurrency(min)}</span>
          <span className="font-mono">${formatCurrency(max)}</span>
        </div>
      </div>
    </div>
  );
}
