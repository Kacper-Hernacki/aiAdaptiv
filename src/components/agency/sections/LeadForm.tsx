"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { bookingUrl } from "@/config/site";
import {
  STEP_FIELDS,
  TOTAL_STEPS,
  validateStep,
  validateField,
  type ErrorKey,
  type FieldName,
} from "@/lib/leads/schema";
import s from "../Agency.module.css";
import f from "./LeadForm.module.css";

type Values = Record<FieldName, string>;

const EMPTY: Values = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  website: "",
  role: "",
  size: "",
  budget: "",
  message: "",
};

type Status = "editing" | "sending" | "sent" | "failed";

export function LeadForm({
  copy,
  lang,
}: {
  copy: Dictionary["agency"]["leadForm"];
  lang: string;
}) {
  const [step, setStep] = useState(0);
  // Which way the last move went, so the panel slides in from the right side.
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, ErrorKey>>>({});
  // A field only shows its error once it has been left or submitted, so the
  // form never scolds you for a field you are still typing into.
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<Status>("editing");

  const uid = useId();
  // Set after mount, not during render — Date.now() in a render body is impure.
  const mountedAt = useRef<number | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const fieldId = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;

  const set = useCallback(
    (name: FieldName, value: string) => {
      setValues((v) => ({ ...v, [name]: value }));
      // Clear an error the moment it stops being true; don't add new ones mid-type.
      setErrors((e) => {
        if (!e[name]) return e;
        return validateField(name, value) ? e : { ...e, [name]: undefined };
      });
    },
    [],
  );

  const blur = useCallback(
    (name: FieldName) => {
      setTouched((t) => ({ ...t, [name]: true }));
      const error = validateField(name, values[name]);
      setErrors((e) => ({ ...e, [name]: error ?? undefined }));
    },
    [values],
  );

  const showError = (name: FieldName) =>
    touched[name] && errors[name] ? copy.errors[errors[name]!] : null;

  const move = (to: number, dir: "forward" | "back") => {
    setDirection(dir);
    setStep(to);
    // Focus the step title so a screen reader announces where it landed.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const stepErrors = validateStep(step, values);
    if (Object.keys(stepErrors).length) {
      setErrors((e) => ({ ...e, ...stepErrors }));
      setTouched((t) => ({
        ...t,
        ...Object.fromEntries(STEP_FIELDS[step].map((n) => [n, true])),
      }));
      return;
    }
    move(step + 1, "forward");
  };

  const back = () => move(step - 1, "back");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const stepErrors = validateStep(step, values);
    if (Object.keys(stepErrors).length) {
      setErrors((e) => ({ ...e, ...stepErrors }));
      setTouched((t) => ({
        ...t,
        ...Object.fromEntries(STEP_FIELDS[step].map((n) => [n, true])),
      }));
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          lang,
          company2: honeypot.current?.value ?? "",
          // Left undefined if the clock never started, so the server skips
          // the timing check rather than reading it as an instant submit.
          elapsedMs: mountedAt.current
            ? Date.now() - mountedAt.current
            : undefined,
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  }

  const progress = useMemo(
    () =>
      copy.progress
        .replace("{step}", String(step + 1))
        .replace("{total}", String(TOTAL_STEPS)),
    [copy.progress, step],
  );

  if (status === "sent") {
    return (
      <section
        id="start"
        aria-labelledby={`${uid}-heading`}
        className={`${s.section} ${s.bandAlt}`}
      >
        <div className={`${s.inner} ${s.centered}`}>
          <div className={f.card} data-state="sent">
            <div className={f.done} role="status">
              <span className={f.doneMark} aria-hidden="true" />
              <h2 id={`${uid}-heading`} className={f.doneTitle}>
                {copy.success.h}
              </h2>
              <p className={f.doneBody}>{copy.success.body}</p>
              <a className={f.doneCta} href={bookingUrl}>
                {copy.success.cta}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const stepCopy = copy.steps[step];

  return (
    <section
      id="start"
      aria-labelledby={`${uid}-heading`}
      className={`${s.section} ${s.bandAlt}`}
    >
      <div className={`${s.inner} ${s.centered}`}>
        <div className={s.titleWrap}>
          <p className={s.super} data-reveal>
            {copy.super}
          </p>
          <h2 id={`${uid}-heading`} className={s.h2} data-reveal>
            {copy.h2}
          </h2>
          <p
            className={s.lead}
            data-reveal
            style={{ "--rd": "80ms" } as React.CSSProperties}
          >
            {copy.lead}
          </p>
        </div>

        <form
          className={f.card}
          onSubmit={submit}
          noValidate
          data-reveal
          style={{ "--rd": "160ms" } as React.CSSProperties}
        >
          {/* Progress */}
          <div className={f.progress}>
            <ol className={f.ticks}>
              {copy.steps.map((item, i) => (
                <li
                  key={item.title}
                  className={f.tick}
                  data-state={
                    i < step ? "done" : i === step ? "current" : "todo"
                  }
                >
                  <span className={f.tickBar} />
                  <span className={f.tickLabel}>{item.title}</span>
                </li>
              ))}
            </ol>
            <p className={f.progressText} aria-live="polite">
              {progress}
            </p>
          </div>

          <div className={f.panel} key={step} data-direction={direction}>
            <p className={f.stepTitle} ref={headingRef} tabIndex={-1}>
              {stepCopy.title}
              <span className={f.stepHint}>{stepCopy.hint}</span>
            </p>

            {step === 0 && (
              <div className={f.grid}>
                <Field
                  name="firstName"
                  label={copy.fields.firstName}
                  placeholder={copy.placeholders.firstName}
                  autoComplete="given-name"
                  value={values.firstName}
                  error={showError("firstName")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
                <Field
                  name="lastName"
                  label={copy.fields.lastName}
                  optional={copy.optional}
                  placeholder={copy.placeholders.lastName}
                  autoComplete="family-name"
                  value={values.lastName}
                  error={showError("lastName")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
                <Field
                  wide
                  name="email"
                  type="email"
                  label={copy.fields.email}
                  placeholder={copy.placeholders.email}
                  autoComplete="email"
                  value={values.email}
                  error={showError("email")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
              </div>
            )}

            {step === 1 && (
              <div className={f.grid}>
                <Field
                  name="company"
                  label={copy.fields.company}
                  placeholder={copy.placeholders.company}
                  autoComplete="organization"
                  value={values.company}
                  error={showError("company")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
                <Field
                  name="website"
                  type="url"
                  label={copy.fields.website}
                  optional={copy.optional}
                  placeholder={copy.placeholders.website}
                  autoComplete="url"
                  value={values.website}
                  error={showError("website")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
                <Select
                  name="role"
                  label={copy.fields.role}
                  placeholder={copy.placeholders.role}
                  options={copy.roles}
                  value={values.role}
                  error={showError("role")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
                <Select
                  name="size"
                  label={copy.fields.size}
                  placeholder={copy.placeholders.size}
                  options={copy.sizes}
                  value={values.size}
                  error={showError("size")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
              </div>
            )}

            {step === 2 && (
              <div className={f.grid}>
                {/* Radios, not buttons: one choice, arrow-key navigable, and it
                    posts even with JavaScript disabled mid-flight. */}
                <fieldset className={f.chipSet}>
                  <legend className={f.label}>{copy.fields.budget}</legend>
                  <div className={f.chips}>
                    {copy.budgets.map((option) => (
                      <label
                        key={option.value}
                        className={f.chip}
                        data-selected={values.budget === option.value}
                      >
                        <input
                          type="radio"
                          name="budget"
                          value={option.value}
                          checked={values.budget === option.value}
                          onChange={() => {
                            set("budget", option.value);
                            setTouched((t) => ({ ...t, budget: true }));
                          }}
                          className={f.chipInput}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {showError("budget") && (
                    <p className={f.error}>{showError("budget")}</p>
                  )}
                </fieldset>

                <Field
                  wide
                  textarea
                  name="message"
                  label={copy.fields.message}
                  placeholder={copy.placeholders.message}
                  value={values.message}
                  error={showError("message")}
                  ids={{ field: fieldId, error: errorId }}
                  onChange={set}
                  onBlur={blur}
                />
              </div>
            )}
          </div>

          {/* Honeypot — off-screen, never focusable, ignored by autofill. */}
          <div className={f.honeypot} aria-hidden="true">
            <label htmlFor={fieldId("company2")}>Company name</label>
            <input
              ref={honeypot}
              id={fieldId("company2")}
              name="company2"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className={f.actions}>
            {step > 0 && (
              <button type="button" className={f.back} onClick={back}>
                {copy.back}
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button type="button" className={f.primary} onClick={next}>
                {copy.next}
                <Arrow />
              </button>
            ) : (
              <button
                type="submit"
                className={f.primary}
                disabled={status === "sending"}
              >
                {status === "sending" ? copy.submitting : copy.submit}
                {status === "sending" ? <Spinner /> : <Arrow />}
              </button>
            )}
          </div>

          {status === "failed" && (
            <p className={f.submitError} role="alert">
              {copy.errors.submit}
            </p>
          )}
          <p className={f.note}>{copy.note}</p>
        </form>
      </div>
    </section>
  );
}

/* ── Inputs ──────────────────────────────────────────────────── */

type Ids = { field: (n: string) => string; error: (n: string) => string };

function Field({
  name,
  label,
  placeholder,
  value,
  error,
  ids,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
  optional,
  wide,
  textarea,
}: {
  name: FieldName;
  label: string;
  placeholder: string;
  value: string;
  error: string | null;
  ids: Ids;
  onChange: (n: FieldName, v: string) => void;
  onBlur: (n: FieldName) => void;
  type?: string;
  autoComplete?: string;
  optional?: string;
  wide?: boolean;
  textarea?: boolean;
}) {
  // Shared between the two branches; `input` and `textarea` don't have a
  // common element type, so a single polymorphic tag can't be typed cleanly.
  const shared = {
    id: ids.field(name),
    name,
    placeholder,
    value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? ids.error(name) : undefined,
    onBlur: () => onBlur(name),
  };

  return (
    <div className={f.field} data-wide={wide || undefined}>
      <label className={f.label} htmlFor={ids.field(name)}>
        {label}
        {optional && <span className={f.optional}>{optional}</span>}
      </label>
      {textarea ? (
        <textarea
          {...shared}
          rows={5}
          className={f.textarea}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={type}
          autoComplete={autoComplete}
          className={f.input}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
      {error && (
        <p id={ids.error(name)} className={f.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  name,
  label,
  placeholder,
  options,
  value,
  error,
  ids,
  onChange,
  onBlur,
}: {
  name: FieldName;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  error: string | null;
  ids: Ids;
  onChange: (n: FieldName, v: string) => void;
  onBlur: (n: FieldName) => void;
}) {
  return (
    <div className={f.field}>
      <label className={f.label} htmlFor={ids.field(name)}>
        {label}
      </label>
      <div className={f.selectWrap}>
        <select
          id={ids.field(name)}
          name={name}
          className={f.select}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.error(name) : undefined}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Chevron />
      </div>
      {error && (
        <p id={ids.error(name)} className={f.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────────── */

const Arrow = () => (
  <svg className={f.icon} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M2 8h11M9 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Chevron = () => (
  <svg className={f.chevron} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M4 6l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spinner = () => (
  <svg className={f.spinner} viewBox="0 0 16 16" aria-hidden="true">
    <circle
      cx="8"
      cy="8"
      r="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="28"
      strokeDashoffset="20"
    />
  </svg>
);
