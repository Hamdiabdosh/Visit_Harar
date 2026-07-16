import { absoluteUrl, publicAppOrigin } from "@/lib/metadata";
import { toMediaSrc } from "@/lib/media-url";
import { ORG_NAME } from "@/lib/org";

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

export function organizationWebsiteJsonLd() {
  const origin = publicAppOrigin() || absoluteUrl("/");
  const logo = absoluteUrl("/brand/logo-horizontal-800.webp");

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: ORG_NAME,
      url: origin,
      logo,
      areaServed: {
        "@type": "City",
        name: "Harar",
        containedInPlace: {
          "@type": "Country",
          name: "Ethiopia",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Visit Harar",
      url: origin,
      publisher: {
        "@type": "Organization",
        name: ORG_NAME,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${origin}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function touristAttractionJsonLd(input: {
  name: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const url = absoluteUrl(`/attractions/${input.slug}`);
  const imageSrc = input.image ? toMediaSrc(input.image) : null;
  const image = imageSrc ? absoluteUrl(imageSrc) : undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: input.name,
    url,
    isAccessibleForFree: true,
    touristType: "Cultural tourism",
  };

  if (input.description) data.description = input.description;
  if (image) data.image = image;
  if (
    input.latitude != null &&
    input.longitude != null &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
  ) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  data.address = {
    "@type": "PostalAddress",
    addressLocality: "Harar",
    addressCountry: "ET",
  };

  return data;
}
