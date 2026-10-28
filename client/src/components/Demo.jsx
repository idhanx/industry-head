import { useMemo, useState } from "react";
import { api } from "../api.js";
import { Reveal } from "../hooks/useReveal.jsx";

const REQUIRED = { name: "Full name", email: "Work email", company: "Company", role: "Your role", country: "Country", sites: "Number of sites", date: "Preferred date", time: "Preferred time" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const dateIn = (tz) => {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t).value;
  return `${g("year")}-${g("month")}-${g("day")}`;
};

function Field({ label, error, full, children }) {
  return <label className={full ? "full" : undefined}>{label}{children}{error && <span className="field-err" role="alert">{error}</span>}</label>;
}

export default function Demo({ form }) {
  const browserTz = useMemo(() => { try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone; return form.timezones.some(([id]) => id === z) ? z : form.timezones[0][0]; } catch { return form.timezones[0][0]; } }, [form]);
  const [v, setV] = useState({ name: "", email: "", company: "", role: "", country: "", sites: "", priority: "", date: "", time: "", timezone: browserTz, duration: form.durations[0], website: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [formError, setFormError] = useState("");
  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const validate = () => {
    const e = {};
    for (const [k, label] of Object.entries(REQUIRED)) if (!String(v[k]).trim()) e[k] = `${label} is required.`;
    if (!e.email && !EMAIL.test(v.email.trim())) e.email = "Enter a valid email address.";
    if (!e.date && v.date < dateIn(v.timezone)) e.date = "Choose today or a future date.";
    return e;
  };
  const submit = async (ev) => {
    ev.preventDefault(); setFormError("");
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) { document.querySelector(".demo-form [aria-invalid=true]")?.focus(); return; }
    setBusy(true);
    try { const r = await api.enquiry(v); setDone({ ...v, reference: r.reference }); }
    catch (err) { if (err.errors) setErrors(err.errors); setFormError(err.message || "Could not send your enquiry."); }
    finally { setBusy(false); }
  };
  const summary = done && ["name", "email", "company", "role", "country", "sites", "priority", "date", "time", "timezone", "duration"].map((k) => k[0].toUpperCase() + k.slice(1) + ": " + (done[k] || "Not specified")).join("\n");
  const download = () => {
    const text = `Industryhead — demo and pricing enquiry\nReference: ${done.reference}\n\n${summary}\n\nPreferred slot only. Our team will confirm a time by email.`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); a.download = `Industryhead_Demo_Enquiry_${done.reference}.txt`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const inv = (k) => ({ "aria-invalid": errors[k] ? "true" : undefined, onChange: set(k), value: v[k] });

  return (
    <section id="demo">
      <div className="wrap demo-grid">
        <Reveal>
          <span className="eyebrow">Pricing &amp; demo</span>
          <h2 className="demo-h">Start with your plant.<br />See the <em>right fit.</em></h2>
          <p className="lead">Tell us about your operation. Explore the decision workflows, discuss your priorities and shape a pricing proposal around your scope.</p>
          <ul className="demo-list">
            {["Walk through a relevant manufacturing scenario.", "Discuss sites, processes and existing systems.", "Review rollout options and pricing together."].map((t) => <li key={t}><svg aria-hidden="true"><use href="#circle-tick" /></svg>{t}</li>)}
          </ul>
          <p className="scope-note">Choose a preferred meeting time below. Your enquiry is sent to our team, who will reply by email to confirm a slot. Choosing a time here does not reserve it.</p>
        </Reveal>

        {done ? (
          <Reveal className="demo-form" delay={0.12}>
            <div className="form-result" role="status">
              <h3>Thank you — your enquiry is in.</h3>
              <p className="note">Reference <strong className="mono">{done.reference}</strong>. We'll reply to <strong>{done.email}</strong> to confirm a time.</p>
              <pre>{summary}</pre>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={download}>Download a copy</button>
                <button type="button" className="btn btn-sm mt-btn" onClick={() => { setDone(null); setV((x) => ({ ...x, name: "", email: "", company: "", role: "", country: "", sites: "", priority: "", date: "", time: "" })); }}>Send another enquiry</button>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal as="form" className="demo-form" delay={0.12} onSubmit={submit} noValidate>
            <fieldset>
              <legend>01 · Your plant</legend>
              <div className="form-grid">
                <Field label="Full name" error={errors.name}><input name="name" autoComplete="name" maxLength={120} {...inv("name")} /></Field>
                <Field label="Work email" error={errors.email}><input type="email" name="email" autoComplete="email" maxLength={200} {...inv("email")} /></Field>
                <Field label="Company" error={errors.company}><input name="company" autoComplete="organization" maxLength={160} {...inv("company")} /></Field>
                <Field label="Your role" error={errors.role}><input name="role" autoComplete="organization-title" maxLength={120} {...inv("role")} /></Field>
                <Field label="Country" error={errors.country}><input name="country" autoComplete="country-name" maxLength={100} {...inv("country")} /></Field>
                <Field label="Number of sites" error={errors.sites}>
                  <select name="sites" {...inv("sites")}><option value="">Select</option>{form.sites.map((s) => <option key={s}>{s}</option>)}</select>
                </Field>
                <Field label="What would you like to improve?" error={errors.priority} full>
                  <textarea name="priority" rows={3} maxLength={1500} placeholder="For example: recurring losses, quality issues, delivery risk or sustaining improvements." {...inv("priority")} />
                </Field>
              </div>
            </fieldset>
            <fieldset>
              <legend>02 · Preferred demo time</legend>
              <div className="form-grid">
                <Field label="Preferred date" error={errors.date}><input type="date" name="date" min={dateIn(v.timezone)} {...inv("date")} /></Field>
                <Field label="Preferred time" error={errors.time}><input type="time" name="time" {...inv("time")} /></Field>
                <Field label="Time zone" error={errors.timezone}><select name="timezone" {...inv("timezone")}>{form.timezones.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field>
                <Field label="Duration" error={errors.duration}><select name="duration" {...inv("duration")}>{form.durations.map((d) => <option key={d}>{d}</option>)}</select></Field>
              </div>
            </fieldset>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={v.website} onChange={set("website")} />
            <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? "Sending…" : "Send demo enquiry"} <svg aria-hidden="true"><use href="#arrow" /></svg></button>
            {formError && <p className="field-err" role="alert">{formError}</p>}
            <p className="note">No meeting is confirmed until our team replies.</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
