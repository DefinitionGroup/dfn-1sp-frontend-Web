"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import type { ContactFormSettings } from "@1sp/sanity-types";
import { hasVisibleText } from "@1sp/utils/text-content";

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
    <section className="relative overflow-hidden bg-neutral-50 py-20 text-neutral-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"

      />
      <div className="pointer-events-none absolute inset-0 " aria-hidden="true" />

      <div className="container relative mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase text-neutral-700 ring-1 ring-neutral-200">
              <span className="h-1.5 w-1.5  bg-violet-500 shadow-[0_0_0_4px_rgba(132,204,22,0.14)]" aria-hidden />
              Contact
            </span>
            {hasVisibleText(headline) ? (
              <h2 className="text-3xl font-semibold leading-tight text-neutral-900 md:text-4xl">{headline}</h2>
            ) : null}
            <p className="text-lg text-neutral-600">{subheadline}</p>
            {description ? <p className="text-neutral-500">{description}</p> : null}
          </div>

          <div className="relative border border-neutral-200 rounded-[2rem] p-6 transition duration-300 ease-out ">
            {status === "success" ? (
              <div className="space-y-3 text-violet-700">
                <p className="text-lg font-semibold">Thank you!</p>
                <p>{successMessage}</p>
              </div>
            ) : (
              <form className="space-y-12" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-neutral-700">
                    <span>Name</span>
                    <input
                      required
                      value={formState.name}
                      onChange={handleChange("name")}
                      className="w-full border border-neutral-300 bg-neutral-50 px-3 py-3 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-neutral-700">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className="w-full border border-neutral-300 bg-neutral-50 px-3 py-3 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label className="space-y-12 text-sm text-neutral-700">
                  <span>Company (optional)</span>
                  <input
                    value={formState.company}
                    onChange={handleChange("company")}
                    className="w-full border border-neutral-300 bg-neutral-50 px-3 py-3 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Company Inc."
                    autoComplete="organization"
                  />
                </label>
                <label className="space-y-2 text-sm text-neutral-700">
                  <span>How can we help?</span>
                  <textarea
                    required
                    value={formState.message}
                    onChange={handleChange("message")}
                    className="min-h-[140px] w-full border border-neutral-300 bg-neutral-50 px-3 py-3 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Tell us about your goals, timeline, and budget."
                  />
                </label>
                <p className="text-xs text-neutral-500">{consentText}</p>
                <div className="flex items-center justify-between gap-4">
                  {status === "error" ? (
                    <p className="text-sm text-rose-600">{error || errorMessage}</p>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex items-center justify-center  bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition duration-200 ease-out hover:-translate-y-[1px] hover:bg-neutral-800 hover:shadow-[0_14px_40px_rgba(0,0,0,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
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
