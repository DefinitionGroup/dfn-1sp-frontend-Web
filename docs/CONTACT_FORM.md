# Contact Form How-To

The root 1SP app ships with a Contact page that combines PageBuilder modules with a Sanity-configurable form and an API route that writes submissions back to Sanity.

## What got added
- Route: `/[locale]/contact` (`app/(site)/[locale]/contact/page.tsx`) renders PageBuilder content for the “contact” page, then the contact form.
- Form UI: `components/ui/ContactForm.tsx` (client component) posts to `/api/contact`, shows success/error states, and reads copy from Sanity.
- API: `POST /api/contact` (`app/api/contact/route.ts`) validates input and creates `contactSubmission` documents.
- Sanity schema:
  - `contactForm` object on `page` (only shown when slug is `contact`) for configurable copy and labels.
  - `contactSubmission` document to store inbound messages.

## One-time setup
1) **Sanity token**
   - Create a token with write access to your dataset.
   - Add to env: `SANITY_API_WRITE_TOKEN=<your-token>`.
2) **Create the Contact page in Sanity**
   - New `page` document with slug `contact`, language/channel as needed.
   - Add any PageBuilder modules to `content` (optional).
   - Fill the **Contact Form** group fields (headline, subheadline, consent, button text, success/error messages). Save/publish.
3) **Deployment env**
   - Ensure the token is present in the hosting environment.
   - Redeploy or restart the app so the API route can use the token.

## How it works
- The Contact page fetches the Sanity page document with slug `contact` and renders `PageBuilder` modules first. The form always renders after the modules.
- The form sends its contact fields and language to `/api/contact`. The API determines the authoritative channel from server environment configuration, not a client-supplied channel; it validates language against that site’s configured locales.
- The API already applies a fixed-window request limit, a honeypot, field-length/email validation and an oversized `Content-Length` check. These are existing protections, not a complete abuse-prevention guarantee. It then creates a `contactSubmission` document with status `new` and timestamp.

## Testing locally

Submission creates a real CMS record in the configured dataset. Choose an appropriate test target and label the submission before testing.
1) Configure the server-side token in the local environment, then run `pnpm dev`.
2) Open `http://localhost:3000/contact` (or your locale).
3) Submit the form and confirm a new `contactSubmission` appears in Sanity Studio.

## Optional tweaks
- **Navigation**: Add `/contact` to menus (e.g., `components/ui/HamburgerGradientMenu.tsx` already includes it).
- **Styling**: Adjust `components/ui/ContactForm.tsx` for brand tweaks (colors, layout, copy).
- **Validation**: Review the existing controls in `app/api/contact/route.ts` before extending abuse protection; verify deployment behavior separately.
- **Notifications**: Hook webhooks or email from Studio on new `contactSubmission` documents.
