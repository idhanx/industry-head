import { Reveal } from "../hooks/useReveal.jsx";

const PRODUCTS = [
  ["factoryhead", "Factory Head", "Decision intelligence that connects production, quality, maintenance and delivery."],
  ["factorykaizen", "Factory Kaizen", "Improvement ideas and events, with savings verified, not claimed."],
  ["factorysop", "Factory SOP", "Standard operating procedures kept current and close to the work."],
  ["factoryskills", "Factory Skills", "Skills matrices and training that follow every change."],
  ["factorystandards", "Factory Standards", "Standards and audits that make a proven fix hold."]
];

export default function Suite() {
  return (
    <section id="suite" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">The family</span>
          <h2>One name behind every part of the <em>factory.</em></h2>
          <p className="lead">Factory Head sits at the centre of a connected set of products, each one built for a part of how a plant improves.</p>
        </Reveal>
        <div className="suite-grid">
          {PRODUCTS.map(([key, name, text], k) => (
            <Reveal className="suite-card" delay={(k % 3) * 0.06} key={key}>
              <img src={`/logos/${key}.png`} alt={name} loading="lazy" />
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
