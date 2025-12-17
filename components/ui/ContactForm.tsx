"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import type { ContactFormSettings } from "@/types/sanity.types";

type ContactFormProps = {
  language?: string;
  channel?: string;
  settings?: ContactFormSettings | null;
};

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const defaultFormState: FormState = {
  name: "",
  email: "",
  company: "",
  message: "",
};

export default function ContactForm({
  language = "en",
  channel = "1spWeb",
  settings,
}: ContactFormProps) {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  const handleChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const resetForm = () => setFormState(defaultFormState);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          language,
          channel,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit contact request.");
      }

      resetForm();
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const headline = settings?.headline || "Let’s talk about your next project";
  const subheadline =
    settings?.subheadline || "Tell us a little bit about what you’re building and we’ll reach out.";
  const description = settings?.description;
  const consentText =
    settings?.consentText ||
    "By submitting this form, you agree that we may store your information to contact you about your request.";
  const submitLabel = settings?.submitLabel || "Send message";
  const successMessage =
    settings?.successMessage || "Thanks! We’ve received your message and will get back to you soon.";
  const errorMessage =
    settings?.errorMessage || "Sorry, something went wrong. Please try again in a moment.";

  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 text-neutral-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"

      />
      <div className="pointer-events-none absolute inset-0 " aria-hidden="true" />

      <div className="container relative mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-200 ring-1 ring-neutral-800">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_0_4px_rgba(190,242,100,0.14)]" aria-hidden />
              Contact
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-white md:text-4xl">{headline}</h2>
            <p className="text-lg text-neutral-300">{subheadline}</p>
            {description ? <p className="text-neutral-400">{description}</p> : null}
          </div>

          <div className="relative border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-0.5 ">
            {status === "success" ? (
              <div className="space-y-3 text-lime-200">
                <p className="text-lg font-semibold">Thank you!</p>
                <p>{successMessage}</p>
              </div>
            ) : (
              <form className="space-y-12" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-neutral-200">
                    <span>Name</span>
                    <input
                      required
                      value={formState.name}
                      onChange={handleChange("name")}
                      className="w-full   border border-neutral-800 bg-neutral-950/70 px-3 py-3 text-sm text-neutral-100 outline-none transition duration-200 focus:border-lime-300/70 focus:ring-2 focus:ring-lime-300/30"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-neutral-200">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className="w-full   border border-neutral-800 bg-neutral-950/70 px-3 py-3 text-sm text-neutral-100 outline-none transition duration-200 focus:border-lime-300/70 focus:ring-2 focus:ring-lime-300/30"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label className="space-y-12 text-sm text-neutral-200">
                  <span>Company (optional)</span>
                  <input
                    value={formState.company}
                    onChange={handleChange("company")}
                    className="w-full   border border-neutral-800 bg-neutral-950/70 px-3 py-3 text-sm text-neutral-100 outline-none transition duration-200 focus:border-lime-300/70 focus:ring-2 focus:ring-lime-300/30"
                    placeholder="Company Inc."
                    autoComplete="organization"
                  />
                </label>
                <label className="space-y-2 text-sm text-neutral-200">
                  <span>How can we help?</span>
                  <textarea
                    required
                    value={formState.message}
                    onChange={handleChange("message")}
                    className="min-h-[140px] w-full   border border-neutral-800 bg-neutral-950/70 px-3 py-3 text-sm text-neutral-100 outline-none transition duration-200 focus:border-lime-300/70 focus:ring-2 focus:ring-lime-300/30"
                    placeholder="Tell us about your goals, timeline, and budget."
                  />
                </label>
                <p className="text-xs text-neutral-400">{consentText}</p>
                <div className="flex items-center justify-between gap-4">
                  {status === "error" ? (
                    <p className="text-sm text-rose-300">{error || errorMessage}</p>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "submitting" ? "Sending..." : submitLabel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
