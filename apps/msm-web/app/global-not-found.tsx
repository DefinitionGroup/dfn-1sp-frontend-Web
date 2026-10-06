import './globals.css';
import NotFound, {metadata as notFoundMetadata} from './(site)/[locale]/not-found';
export const metadata = notFoundMetadata;
export default function GlobalNotFound() {
  return <html lang="en" className="dark"><body><NotFound /></body></html>;
}
