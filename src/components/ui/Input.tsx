import React from 'react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Input — accessible text input with label, error, helper, and icon slots
// ─────────────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      onRightIconClick,
      inputSize = 'md',
      fullWidth = true,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles['wrapper--full'], className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={cn(styles.inputWrap, styles[`inputWrap--${inputSize}`], error && styles['inputWrap--error'])}>
          {leftIcon && (
            <span className={styles.leftIcon} aria-hidden="true">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(styles.input, leftIcon ? styles['input--hasLeft'] : undefined, rightIcon ? styles['input--hasRight'] : undefined)}
            aria-invalid={!!error}
            aria-describedby={cn(error ? errorId : undefined, helper ? helperId : undefined)}
            required={required}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              className={styles.rightIcon}
              onClick={onRightIconClick}
              tabIndex={onRightIconClick ? 0 : -1}
              aria-label="Input action"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {!error && helper && (
          <p id={helperId} className={styles.helper}>{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

// ── Textarea variant ──────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, fullWidth = true, className, id, required, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className={cn(styles.wrapper, fullWidth && styles['wrapper--full'], className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(styles.textarea, error && styles['textarea--error'])}
          aria-invalid={!!error}
          required={required}
          {...props}
        />
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!error && helper && <p className={styles.helper}>{helper}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
