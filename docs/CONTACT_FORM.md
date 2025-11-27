# Contact Form How-To

This project ships with a Contact page that combines PageBuilder modules with a Sanity-configurable form and an API route that writes submissions back to Sanity.

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
   - Add any PageBuilder modules to `content1sp` (optional).  
   - Fill the **Contact Form** group fields (headline, subheadline, consent, button text, success/error messages). Save/publish.
3) **Deployment env**  
   - Ensure the token is present in the hosting environment.  
   - Redeploy or restart the app so the API route can use the token.

## How it works
- The Contact page fetches the Sanity page document with slug `contact` and renders `PageBuilder` modules first. The form always renders after the modules.
- The form sends `name`, `email`, `company`, `message`, plus `language` and `channel` to `/api/contact`.
- The API validates required fields and email format, then creates a `contactSubmission` document with status `new` and timestamp.

## Testing locally
1) Run the app with your token exported: `SANITY_API_WRITE_TOKEN=... npm run dev` (or pnpm/yarn).  
2) Open `http://localhost:3000/en/contact` (or your locale).  
3) Submit the form and confirm a new `contactSubmission` appears in Sanity Studio.

## Optional tweaks
- **Navigation**: Add `/contact` to menus (e.g., `components/ui/HamburgerGradientMenu.tsx` already includes it).  
- **Styling**: Adjust `components/ui/ContactForm.tsx` for brand tweaks (colors, layout, copy).  
- **Validation**: Extend the API route if you need spam checks or rate limiting.  
- **Notifications**: Hook webhooks or email from Studio on new `contactSubmission` documents.
