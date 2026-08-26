"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { InlineSvgIcon } from "./inline-svg-icon";
import { SEARCH_CONTROL_ICON_SVGS } from "./generated/search-control-icon-svgs";

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
                <InlineSvgIcon
                  className="searchControlClearCircle"
                  markup={SEARCH_CONTROL_ICON_SVGS.clearCircle}
                  size={20}
                  data-search-control-icon="clear-circle"
                />
                <InlineSvgIcon
                  className="searchControlClearGlyph"
                  markup={SEARCH_CONTROL_ICON_SVGS.clearGlyph}
                  size={8}
                  data-search-control-icon="clear-glyph"
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
    <InlineSvgIcon
      className="searchControlIcon"
      markup={SEARCH_CONTROL_ICON_SVGS.search}
      size={21}
      data-search-control-icon="search"
    />
  );
}
