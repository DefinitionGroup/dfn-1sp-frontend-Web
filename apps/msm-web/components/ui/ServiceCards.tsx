"use client";

import Image from "next/image";
import DeferredVideo from "./DeferredVideo";
import SelectionFrame from "./SelectionFrame";
import cards from "./SelectionCards.module.css";

type ServiceCardItem = { name?: string; text?: string; image?: string; video?: string };

export default function ServiceCards({ items }: { items: ServiceCardItem[] }) {
  return (
    <div className={cards.grid}>
      {items.map((item, index) => (
        <SelectionFrame key={`${item.name}-${index}`} className={cards.card} contentClassName={cards.cardContent} sequenceIndex={index + 1}>
          <article className={cards.body}>
            {(item.video || item.image) ? (
              <div className={cards.media}>
                {item.video ? <DeferredVideo src={item.video} maxWidth={960} className="absolute inset-0 h-full w-full object-cover" mountDelay={150} /> : <Image src={item.image!} alt={item.name || ""} fill sizes="(min-width: 768px) 50vw, 100vw" className={cards.image} />}
              </div>
            ) : null}
            <div className={cards.copy}>
              <h3 className={cards.title}>{item.name}</h3>
              {item.text ? <p className={cards.claim}>{item.text}</p> : null}
            </div>
          </article>
        </SelectionFrame>
      ))}
    </div>
  );
}
