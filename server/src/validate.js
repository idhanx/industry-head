import { timezones, sitesOptions, durations } from "./content.js";

const text = (v) => (typeof v === "string" ? v.trim() : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function todayIn(tz) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Returns { value } or { errors }. Mirrors the limits of the form in the client. */
export function validateEnquiry(body = {}) {
  const errors = {};
  const v = {
    name: text(body.name), email: text(body.email).toLowerCase(), company: text(body.company), role: text(body.role),
    country: text(body.country), sites: text(body.sites), priority: text(body.priority),
    date: text(body.date), time: text(body.time), timezone: text(body.timezone), duration: text(body.duration) || durations[0]
  };
  const required = [["name", 120, "Full name"], ["company", 160, "Company"], ["role", 120, "Role"], ["country", 100, "Country"]];
  for (const [k, max, label] of required) {
    if (!v[k]) errors[k] = `${label} is required.`;
    else if (v[k].length > max) errors[k] = `${label} must be ${max} characters or fewer.`;
  }
  if (!v.email) errors.email = "Work email is required.";
  else if (v.email.length > 200 || !EMAIL.test(v.email)) errors.email = "Enter a valid email address.";
  if (!sitesOptions.includes(v.sites)) errors.sites = "Select the number of sites.";
  if (v.priority.length > 1500) errors.priority = "Please keep this under 1500 characters.";
  if (!durations.includes(v.duration)) errors.duration = "Choose a duration.";
  if (!timezones.some(([id]) => id === v.timezone)) errors.timezone = "Choose a time zone.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || Number.isNaN(Date.parse(v.date))) errors.date = "Choose a preferred date.";
  else if (!errors.timezone && v.date < todayIn(v.timezone)) errors.date = "Choose today or a future date.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)) errors.time = "Choose a preferred time.";
  return Object.keys(errors).length ? { errors } : { value: v };
}

export const SESSION_RE = /^[a-zA-Z0-9-]{8,64}$/;
