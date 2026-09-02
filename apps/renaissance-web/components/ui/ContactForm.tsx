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
  website: string;
};

const defaultFormState: FormState = {
  name: "",
  email: "",
  company: "",
  message: "",
  website: "",
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
    <section className="relative overflow-hidden bg-renaissance-paper pb-24 pt-4 font-renaissance text-renaissance-ink md:pb-32">
      <div className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-start gap-12 border-t border-renaissance-ink/20 pt-10 md:grid-cols-12 md:gap-x-10 md:pt-14">
          <div className="max-w-2xl md:col-span-4">
            <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-renaissance-ink/60">
              Project enquiry
            </span>
            {hasVisibleText(headline) ? (
              <h2 className="renaissance-display mt-5 text-[clamp(2.5rem,4.2vw,5.5rem)] font-bold leading-[0.88] text-renaissance-ink">{headline}</h2>
            ) : null}
            <p className="mt-6 max-w-[32rem] text-lg leading-[1.35] text-renaissance-ink/75">{subheadline}</p>
            {description ? <p className="mt-4 text-renaissance-ink/65">{description}</p> : null}
          </div>

          <div className="relative md:col-span-7 md:col-start-6">
            {status === "success" ? (
              <div className="border-y border-renaissance-ink/20 py-10 text-renaissance-ink">
                <p className="renaissance-display text-4xl font-bold">Thank you.</p>
                <p className="mt-4 max-w-xl text-lg">{successMessage}</p>
              </div>
            ) : (
              <form className="space-y-9" onSubmit={onSubmit}>
                <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <span>Website</span>
                  <input
                    value={formState.website}
                    onChange={handleChange("website")}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <label className="space-y-3 text-sm font-semibold uppercase tracking-[0.08em] text-renaissance-ink">
                    <span>Name *</span>
                    <input
                      required
                      value={formState.name}
                      onChange={handleChange("name")}
                      className="w-full border-0 border-b border-renaissance-ink/35 bg-transparent px-0 py-3 text-base font-normal normal-case tracking-normal text-renaissance-ink outline-none transition-colors placeholder:text-renaissance-ink/55 focus:border-renaissance-signal"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="space-y-3 text-sm font-semibold uppercase tracking-[0.08em] text-renaissance-ink">
                    <span>Email *</span>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className="w-full border-0 border-b border-renaissance-ink/35 bg-transparent px-0 py-3 text-base font-normal normal-case tracking-normal text-renaissance-ink outline-none transition-colors placeholder:text-renaissance-ink/55 focus:border-renaissance-signal"
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label className="block space-y-3 text-sm font-semibold uppercase tracking-[0.08em] text-renaissance-ink">
                  <span>Company (optional)</span>
                  <input
                    value={formState.company}
                    onChange={handleChange("company")}
                    className="w-full border-0 border-b border-renaissance-ink/35 bg-transparent px-0 py-3 text-base font-normal normal-case tracking-normal text-renaissance-ink outline-none transition-colors placeholder:text-renaissance-ink/55 focus:border-renaissance-signal"
                    placeholder="Studio or organisation"
                    autoComplete="organization"
                  />
                </label>
                <label className="block space-y-3 text-sm font-semibold uppercase tracking-[0.08em] text-renaissance-ink">
                  <span>How can we help? *</span>
                  <textarea
                    required
                    value={formState.message}
                    onChange={handleChange("message")}
                    className="min-h-[160px] w-full resize-y border border-renaissance-ink/35 bg-transparent p-4 text-base font-normal normal-case tracking-normal text-renaissance-ink outline-none transition-colors placeholder:text-renaissance-ink/55 focus:border-renaissance-signal"
                    placeholder="Game, audience, timing and what you need from us."
                  />
                </label>
                <p className="max-w-2xl text-xs leading-relaxed text-renaissance-ink/55">{consentText}</p>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-renaissance-ink/20 pt-6">
                  {status === "error" ? (
                    <p role="alert" className="text-sm text-red-700">{error || errorMessage}</p>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex min-w-44 items-center justify-between gap-8 border-b border-renaissance-ink bg-transparent py-3 text-sm font-semibold uppercase tracking-[0.08em] text-renaissance-ink transition-colors hover:border-renaissance-signal hover:text-renaissance-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-renaissance-signal disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending…" : submitLabel}
                    <span aria-hidden="true">↗</span>
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
