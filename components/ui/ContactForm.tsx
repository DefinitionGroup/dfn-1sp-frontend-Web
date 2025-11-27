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
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-gray-950 py-20 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(190,242,100,0.22), transparent 32%), radial-gradient(circle at 80% 10%, rgba(52,211,153,0.18), transparent 90%), radial-gradient(circle at 50% 70%, rgba(16,185,129,0.12), transparent 26%)",
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-1 max-w-2xl">
            <p className="text-xs font-semibold uppercase  text-lime-500">Contact</p>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">{headline}</h2>
            <p className="text-lg text-gray-300">{subheadline}</p>
            {description ? <p className="text-gray-400">{description}</p> : null}
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            {status === "success" ? (
              <div className="space-y-3 text-lime-200">
                <p className="text-lg font-semibold">Thank you!</p>
                <p>{successMessage}</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-gray-200">
                    <span>Name</span>
                    <input
                      required
                      value={formState.name}
                      onChange={handleChange("name")}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-gray-200">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>Company (optional)</span>
                  <input
                    value={formState.company}
                    onChange={handleChange("company")}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30"
                    placeholder="Company Inc."
                    autoComplete="organization"
                  />
                </label>
                <label className="space-y-2 text-sm text-gray-200">
                  <span>How can we help?</span>
                  <textarea
                    required
                    value={formState.message}
                    onChange={handleChange("message")}
                    className="min-h-[140px] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30"
                    placeholder="Tell us about your goals, timeline, and budget."
                  />
                </label>
                <p className="text-xs text-gray-400">{consentText}</p>
                <div className="flex items-center justify-between gap-4">
                  {status === "error" ? (
                    <p className="text-sm text-red-300">{error || errorMessage}</p>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex items-center justify-center rounded-full bg-lime-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-70"
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
