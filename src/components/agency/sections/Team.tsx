import type { Dictionary } from "@/i18n/dictionaries";
import s from "../Agency.module.css";
import t from "./Team.module.css";

export function Team({ team }: { team: Dictionary["agency"]["team"] }) {
  return (
    <section
      id="team"
      aria-labelledby="team-heading"
      className={`${s.section} ${s.tall}`}
    >
      <h2 id="team-heading" className={s.h2} data-reveal>
        {team.h2}
      </h2>
      <p
        className={s.lead}
        data-reveal
        style={{ "--rd": "80ms" } as React.CSSProperties}
      >
        {team.lead}
      </p>
      <ul className={t.members}>
        {team.members.map((member, i) => (
          <li
            key={i}
            className={t.member}
            data-reveal
            style={{ "--rd": `${160 + i * 90}ms` } as React.CSSProperties}
          >
            <h3 className={t.name}>{member.name}</h3>
            <p className={t.role}>{member.role}</p>
            {member.body.map((paragraph, p) => (
              <p key={p} className={t.body}>
                {paragraph}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
