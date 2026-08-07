import { site } from "@/lib/site";
import { MapPin } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";

/**
 * Google Maps embed. Uses the keyless embed endpoint (no API key required),
 * centered on the business's service area. Update the query in `mapQuery`
 * or the coordinates in lib/site.ts to reposition.
 */
export default function MapSection() {
  const mapQuery = encodeURIComponent(
    `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`
  );
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=13&output=embed`;

  return (
    <section aria-label="Service area map" className="pb-4">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-ink-800 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/12 text-brand">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display font-bold text-white">
                    Find us in {site.address.city}
                  </div>
                  <div className="text-sm text-white/55">
                    Serving all of the Five Towns &amp; Nassau County
                  </div>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand hover:text-brand"
              >
                Open in Maps
              </a>
            </div>
            <div className="relative aspect-[16/8] w-full">
              <iframe
                title={`Map of ${site.address.city}, ${site.address.state}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[0.3] contrast-[1.1] [color-scheme:light]"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
