import { Reveal, CountUp } from "../hooks/useReveal.jsx";

const Check = () => <svg aria-hidden="true"><use href="#circle-tick" /></svg>;
const BARS = [["Breakdowns", "₹7,850", 92, "r"], ["Changeovers", "₹4,960", 58, ""], ["Slow cycles", "₹3,240", 38, "y"], ["Scrap & rework", "₹2,210", 26, "r"], ["Waiting material", "₹1,020", 12, "y"]];

export default function Problem() {
  return (
    <section>
      <div className="wrap problem">
        <Reveal>
          <span className="eyebrow">The hidden factory</span>
          <h2>Your losses are <em>real money.</em> Today they live in registers, WhatsApp and memory.</h2>
          <p className="lead">A breakdown, a changeover that ran long, a batch on hold, a line two people short — each costs money, but nobody sees the total until month-end. Industryhead prices each loss as it happens, ranks it, and makes sure someone owns the fix.</p>
          <ul>
            <li><Check /><span>Every rupee traceable to the stop or inspection behind it.</span></li>
            <li><Check /><span>Each loss counted once — never double-charged across reports.</span></li>
            <li><Check /><span>Built from your own rates, routings and records.</span></li>
          </ul>
        </Reveal>
        <Reveal className="panel" delay={0.15} aria-label="Example: where a shift's losses go">
          <div className="panel-head"><h3>Where one shift's money went</h3><span className="mono"><CountUp to={19280} prefix="₹" indian /></span></div>
          {BARS.map(([label, amt, w, c]) => (
            <div className="bar" key={label}><span>{label}</span><div className="track"><i className={c} style={{ width: w + "%" }}></i></div><em>{amt}</em></div>
          ))}
          <p className="note">Illustrative figures. On your plant they come from your own data.</p>
        </Reveal>
      </div>
    </section>
  );
}
