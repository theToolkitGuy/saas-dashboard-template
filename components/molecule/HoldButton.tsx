"use client";

import { useState, type KeyboardEvent, type PointerEvent, type TransitionEvent } from "react";

/**
 * Press-and-hold confirm for destructive actions. Holding fills the button
 * from the bottom over `holdDuration` ms with a rolling wave; `onHoldComplete`
 * fires once full. Releasing early, or sliding off, drains it. Space / Enter
 * hold the same way. Adapted from beui.dev's hold-action-button.
 *
 * @example
 * <HoldButton label="Hold to delete" completeLabel="Deleted" onHoldComplete={remove} bgClass="bg-error text-error-content" fillClass="text-teracotta" />
 */
export function HoldButton({
  label,
  holdingLabel = "Keep holding",
  completeLabel = "Done",
  holdDuration = 1600,
  onHoldComplete,
  disabled = false,
  className = "",
  bgClass = "bg-primary text-primary-content",
  fillClass = "text-aviation",
}: {
  label: string;
  holdingLabel?: string;
  completeLabel?: string;
  holdDuration?: number;
  onHoldComplete?: () => void;
  disabled?: boolean;
  className?: string;
  // Resting background + label color. Replaces the default.
  bgClass?: string;
  // A text-color class for the fill (body and wave both read currentColor).
  fillClass?: string;
}) {
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startHold = () => {
    if (disabled || holding) return;
    setCompleted(false);
    setHolding(true);
  };
  const cancelHold = () => {
    setHolding(false);
    setCompleted(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    startHold();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
  };
  // Only reached when pointer capture was refused. Never for touch: WebKit
  // fires leave repeatedly for a finger that never moved.
  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") cancelHold();
  };
  // A captured pointer gets no boundary events, so measure: off the button
  // ends the hold.
  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!holding) return;
    const r = event.currentTarget.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) cancelHold();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  };
  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      cancelHold();
    }
  };
  // The fill transition finishing is the completion signal: a release cancels
  // the transition, so this only fires for a full hold.
  const handleFillEnd = (event: TransitionEvent<HTMLSpanElement>) => {
    if (event.target !== event.currentTarget || !holding || completed) return;
    setCompleted(true);
    onHoldComplete?.();
  };

  const labelFade = "col-start-1 row-start-1 transition-opacity duration-120 ease-out motion-reduce:duration-0 ";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(event) => event.preventDefault()}
      className={
        "relative inline-grid place-items-center overflow-hidden rounded-[var(--hold-radius)] [--hold-radius:0.5rem] px-4 py-2 text-sm font-medium cursor-pointer " +
        bgClass +
        " touch-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] " +
        "transition-[scale] duration-150 ease-out motion-safe:active:scale-[0.98] " +
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 " +
        "disabled:pointer-events-none disabled:opacity-50 " +
        className
      }
    >
      {/* clip-path (not overflow) clips the fill: Safari drops the rounded
          overflow clip once the fill gets its own compositing layer. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 [clip-path:inset(0_round_var(--hold-radius))]">
        <span
          onTransitionEnd={handleFillEnd}
          style={holding ? { transitionDuration: `${holdDuration}ms` } : undefined}
          className={
            "absolute inset-0 bg-current transition-[translate,opacity] " +
            (holding
              ? "translate-y-0 ease-linear "
              : "translate-y-[calc(100%+0.75rem)] duration-240 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-0 motion-reduce:duration-150 ") +
            fillClass
          }
        >
          <svg viewBox="0 0 240 24" preserveAspectRatio="none" className={"absolute -top-2.5 left-0 h-3 w-[200%] motion-reduce:hidden " + (holding ? "animate-hold-wave" : "")}>
            <path d="M0 12C20 2 40 2 60 12s40 10 60 0 40-10 60 0 40 10 60 0v12H0Z" fill="currentColor" />
          </svg>
        </span>
      </span>

      <span className="relative z-10 grid place-items-center">
        <span className={labelFade + (holding ? "opacity-0" : "opacity-100")}>{label}</span>
        <span aria-hidden="true" className={labelFade + (holding && !completed ? "opacity-100" : "opacity-0")}>
          {holdingLabel}
        </span>
        <span aria-hidden="true" className={labelFade + (completed ? "opacity-100" : "opacity-0")}>
          {completeLabel}
        </span>
      </span>
    </button>
  );
}
