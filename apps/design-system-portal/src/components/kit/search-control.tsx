"use client";

import Image from "next/image";
import { useEffect, useRef, type FormEvent } from "react";

export function SearchControl({
  value,
  active,
  placeholder = "Search by Name / Userid",
  ariaLabel = "站内搜索",
  autoFocus = true,
  onActivate,
  onChange,
  onCancel,
  onSubmit,
}: {
  value: string;
  active: boolean;
  placeholder?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  onActivate: () => void;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit?: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && autoFocus) inputRef.current?.focus();
  }, [active, autoFocus]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      className="searchControl"
      role="search"
      aria-label={ariaLabel}
      onSubmit={submit}
    >
      {active ? (
        <>
          <div className="searchControlField">
            <SearchControlIcon />
            <input
              ref={inputRef}
              type="search"
              aria-label="搜索关键词"
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") onCancel();
              }}
            />
            {value ? (
              <button
                className="searchControlClear"
                type="button"
                aria-label="清除搜索内容"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange("");
                  inputRef.current?.focus();
                }}
              >
                <Image
                  src="/icons/search-control/clear-circle.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
                <Image
                  className="searchControlClearGlyph"
                  src="/icons/search-control/clear-glyph.svg"
                  alt=""
                  width={8}
                  height={8}
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>
          <button
            className="searchControlCancel"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          className="searchControlField searchControlTrigger"
          type="button"
          aria-label={`打开搜索：${placeholder}`}
          onClick={onActivate}
        >
          <SearchControlIcon />
          <span>{placeholder}</span>
        </button>
      )}
    </form>
  );
}

export function SearchControlIcon() {
  return (
    <span className="searchControlIcon" aria-hidden="true">
      <Image
        src="/icons/search-control/search.svg"
        alt=""
        width={21}
        height={21}
      />
    </span>
  );
}
