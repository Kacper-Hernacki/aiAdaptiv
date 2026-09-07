import type { Dictionary } from "@/i18n/dictionaries";
import Image from "next/image";
import { Placeholder } from "../Placeholder";
import { teamImages } from "../teamImages";
import s from "../Agency.module.css";
import t from "./Team.module.css";

export function Team({ team }: { team: Dictionary["agency"]["team"] }) {
  return (
    <section id="team" aria-labelledby="team-heading" className={s.section}>
      <div className={s.inner}>
        <div className={s.titleWrap}>
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
        </div>
        <ul className={t.grid}>
          {team.members.map((member, i) => (
            <li
              key={i}
              className={t.member}
              data-reveal
              style={{ "--rd": `${160 + i * 90}ms` } as React.CSSProperties}
            >
              <div className={t.thumb}>
                {teamImages[member.id] ? (
                  <Image
                    src={teamImages[member.id]}
                    alt={member.name}
                    className={t.photo}
                    sizes="(max-width: 991px) 8em, 30vw"
                    placeholder="blur"
                  />
                ) : (
                  <Placeholder ratio="1:1" seed={i + 4} />
                )}
              </div>
              <div className={t.content}>
                <h3 className={t.name}>{member.name}</h3>
                <p className={t.role}>{member.role}</p>
                {member.body.map((paragraph, p) => (
                  <p key={p} className={t.body}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
