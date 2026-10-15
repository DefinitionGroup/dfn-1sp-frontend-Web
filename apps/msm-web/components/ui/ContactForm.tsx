"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import type { ContactFormSettings } from "@1sp/sanity-types";
import styles from "@msm/components/ui/EditorialBlocks.module.css";
import { hasVisibleText } from "@1sp/utils/text-content";

type ContactFormProps = {
  headingTag?: "h1" | "h2";
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
  headingTag: Heading = "h2",
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
    <section className={`${styles.section} ${styles.contact}`}>
      <div className={styles.inner}>
        <div className={styles.contactGrid}>
          <div className="space-y-3 max-w-2xl">
            <span className={styles.contactLabel}>
              Contact
            </span>
            {hasVisibleText(headline) ? (
              <Heading className={styles.heading}>{headline}</Heading>
            ) : null}
            <p className={styles.support}>{subheadline}</p>
            {description ? <p className={styles.support}>{description}</p> : null}
          </div>

          <div className={styles.formPanel}>
            {status === "success" ? (
              <div className={styles.formSuccess} role="status" tabIndex={-1}>
                <p className="text-lg font-semibold">Thank you!</p>
                <p>{successMessage}</p>
              </div>
            ) : (
              <form className={styles.form} aria-busy={status === "submitting"} onSubmit={onSubmit}>
                <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <span>Website</span>
                  <input
                    value={formState.website}
                    onChange={handleChange("website")}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <label className={styles.field}>
                    <span>Name</span>
                    <input
                      required
                      value={formState.name}
                      onChange={handleChange("name")}
                      className={styles.input}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={formState.email}
                      onChange={handleChange("email")}
                      className={styles.input}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label className={styles.field}>
                  <span>Company (optional)</span>
                  <input
                    value={formState.company}
                    onChange={handleChange("company")}
                    className={styles.input}
                    placeholder="Company Inc."
                    autoComplete="organization"
                  />
                </label>
                <label className={styles.field}>
                  <span>How can we help?</span>
                  <textarea
                    required
                    value={formState.message}
                    onChange={handleChange("message")}
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Tell us about your goals, timeline, and budget."
                  />
                </label>
                <p className={styles.consent}>{consentText}</p>
                <div className={styles.formActions}>
                  {status === "error" ? (
                    <p className={styles.formError} role="alert">{error || errorMessage}</p>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={styles.submit}
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
