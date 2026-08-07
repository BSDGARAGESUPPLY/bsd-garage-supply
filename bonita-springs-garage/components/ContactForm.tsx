"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { services } from "@/lib/content";
import { Phone, Mail, MapPin, Clock, Check, ArrowRight } from "./Icons";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-2xl border border-white/12 bg-ink-700/60 px-4 py-3.5 text-white placeholder:text-white/50 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot: bots fill hidden fields
    if (data.company) {
      setStatus("success");
      form.reset();
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong. Please call us directly and we'll help right away.");
    }
  }

  return (
    <section id="contact" className="relative section-pad">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* Left: details */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/60" aria-hidden />
                Get In Touch
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-fluid-3xl font-bold tracking-tightest text-white">
                Request your free estimate
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 text-lg text-white/65">
                Tell us what&apos;s going on and we&apos;ll get right back to you — usually
                within the hour during business hours. For emergencies, call us anytime.
              </p>
            </Reveal>

            <div className="mt-8 space-y-3">
              {[
                {
                  icon: Phone,
                  label: "Call or text",
                  value: site.phone,
                  href: site.phoneHref,
                },
                { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
                {
                  icon: MapPin,
                  label: "Service area",
                  value: `${site.address.city}, ${site.address.state} & the Five Towns`,
                },
                { icon: Clock, label: "Availability", value: site.emergency },
              ].map((row, i) => {
                const Icon = row.icon;
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/12 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-medium uppercase tracking-wide text-white/60">
                        {row.label}
                      </span>
                      <span className="font-semibold text-white">{row.value}</span>
                    </span>
                  </>
                );
                return (
                  <Reveal key={row.label} delay={180 + i * 70}>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-800 p-4 transition-colors hover:border-brand/40"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-800 p-4">
                        {inner}
                      </div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Right: form */}
          <Reveal delay={120}>
            <div className="rounded-4xl border border-white/10 bg-ink-800 p-6 shadow-card sm:p-8">
              {status === "success" ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-brand/15 text-brand">
                    <Check className="h-8 w-8" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-bold text-white">
                    Request received!
                  </h3>
                  <p className="mt-3 max-w-sm text-white/65">
                    Thanks for reaching out. We&apos;ll get back to you shortly. Need help
                    right now? Call us anytime.
                  </p>
                  <a
                    href={site.phoneHref}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-ink shadow-glow transition-all hover:-translate-y-0.5 hover:bg-brand-400"
                  >
                    <Phone className="h-4 w-4" />
                    {site.phone}
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/70">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Jane Doe"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/70">
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="(516) 555-0123"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                      Email <span className="text-white/55">(optional)</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-white/70">
                      What do you need?
                    </label>
                    <select id="service" name="service" defaultValue="" className={inputClass}>
                      <option value="" disabled>
                        Select a service…
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                      <option value="Emergency">Emergency — call me ASAP</option>
                      <option value="Other">Something else</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-white/70">
                      Details <span className="text-white/55">(optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell us what's happening with your garage door…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {status === "error" && (
                    <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-bold text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "submitting" ? (
                      "Sending…"
                    ) : (
                      <>
                        Get My Free Estimate
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-white/60">
                    By submitting, you agree to be contacted about your request. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
