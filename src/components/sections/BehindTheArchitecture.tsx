import type { Dictionary } from "@/i18n/dictionaries";

export function BehindTheArchitecture({
  behindTheArchitecture,
}: {
  behindTheArchitecture: Dictionary["behindTheArchitecture"];
}) {
  return (
    <section id="founder" aria-labelledby="founder-heading">
      <h2 id="founder-heading">{behindTheArchitecture.h2}</h2>
      <p>
        <strong>{behindTheArchitecture.lead}</strong>
      </p>
      {behindTheArchitecture.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}
