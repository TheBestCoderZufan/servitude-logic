// src/components/seo/JsonLd.jsx
/**
 * JsonLd
 * Renders a JSON-LD script tag for structured data. Accepts a single object
 * or an array of objects and injects them into the document for SEO.
 *
 * This is a server component; it renders no client interactivity.
 *
 * @param {Object} props - Component props
 * @param {Object|Object[]} props.data - JSON-LD object(s) to embed
 * @returns {JSX.Element}
 */
export default function JsonLd({ data }) {
  const payload = Array.isArray(data) ? data : [data];
  const json = JSON.stringify(payload.length === 1 ? payload[0] : payload);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
      // eslint-disable-next-line react/no-danger
    />
  );
}

/** @module components/seo/JsonLd */

