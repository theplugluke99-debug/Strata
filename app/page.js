"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import FloSection from "./components/FloSection";

const mobileImages = [
  { url: "/mobile-1.png", pos: "center center", label: "Stair Runner",            sub: "Precision fitted · Every step covered" },
  { url: "/mobile-2.png", pos: "center center", label: "Herringbone LVT Kitchen", sub: "Waterproof · Durable · Underfloor heating compatible" },
  { url: "/mobile-3.png", pos: "center center", label: "Carpet Living Room",      sub: "Warm underfoot · Timeless style" },
  { url: "/mobile-4.png", pos: "center center", label: "Bedroom Carpet",          sub: "Deeply soft · Bedroom perfection · Warm underfoot" },
];
const desktopImages = [
  { url: "/desktop-1.png", pos: "center 30%",   label: "Stair Runner",            sub: "Precision fitted · Every step covered" },
  { url: "/desktop-2.png", pos: "center center", label: "Herringbone LVT Kitchen", sub: "Waterproof · Durable · Underfloor heating compatible" },
  { url: "/desktop-3.png", pos: "center 40%",   label: "Carpet Living Room",      sub: "Warm underfoot · Timeless style" },
  { url: "/desktop-4.jpg", pos: "center 60%",   label: "Bedroom Carpet",          sub: "Deeply soft · Bedroom perfection · Warm underfoot" },
];
const marqueeItems = [
  { text: "Carpet", gold: true }, { text: "LVT", gold: false },
  { text: "Herringbone", gold: false }, { text: "Free Survey", gold: true },
  { text: "Vinyl", gold: false }, { text: "Vetted Fitters", gold: false },
  { text: "Fair Pricing", gold: true }, { text: "No Hidden Costs", gold: false },
  { text: "Supply & Fit", gold: false }, { text: "Fast Turnaround", gold: true },
];
const stats = [
  { value: "Free",  label: "Home survey & samples" },
  { value: "Fast",  label: "Turnaround from quote"  },
  { value: "Fair",  label: "Pricing. Always."        },
  { value: "Zero",  label: "Hidden costs. Ever."     },
];
const howItWorksSteps = [
  { num: "01", title: "Tell us what you need",       body: "Answer a few quick questions about your rooms and what you're after. No phone calls, no waiting." },
  { num: "02", title: "Get an instant estimate",     body: "See a real price range based on your rooms and flooring type — before you've spoken to anyone." },
  { num: "03", title: "We come to you",              body: "Our surveyor visits with samples chosen for your project. You choose in your own home, in your own light." },
  { num: "04", title: "No surprises on fitting day", body: "The price you agreed is the price you pay. Vetted fitters, everything included, nothing hidden." },
];

const s = {
  bg: "#111110", text: "#f2ede0", gold: "#c9a96e",
  card: "#1a1a18", border: "#2a2a28", dim: "rgba(242,237,224,0.45)",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "system-ui, sans-serif",
};

const Tag = ({ children }) => (
  <div style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: s.gold, fontFamily: s.sans, marginBottom: "8px" }}>
    {children}
  </div>
);
const Divider = () => <div style={{ width: "32px", height: "1px", background: s.gold, margin: "14px 0 18px" }} />;

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function StepCard({ num, title, body, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.55s ${delay}ms, transform 0.55s ${delay}ms`, display: "flex", gap: "14px", padding: "14px 0", borderBottom: `1px solid ${s.border}` }}>
      <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.gold, lineHeight: 1, flexShrink: 0, minWidth: "36px" }}>{num}</div>
      <div>
        <div style={{ fontFamily: s.sans, fontSize: "12px", fontWeight: 600, color: s.text, marginBottom: "4px", letterSpacing: "0.04em" }}>{title}</div>
        <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, lineHeight: 1.65, fontWeight: 300 }}>{body}</div>
      </div>
    </div>
  );
}

function StatBox({ value, label }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="stat-box" style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s, transform 0.5s" }}>
      <div style={{ fontFamily: s.serif, fontSize: "32px", fontWeight: 700, color: s.gold, lineHeight: 1, marginBottom: "6px" }}>{value}</div>
      <div style={{ fontFamily: s.sans, fontSize: "10px", color: s.dim, letterSpacing: "0.06em", lineHeight: 1.5 }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [activeGallery, setActiveGallery] = useState(0);
  const [isMobile, setIsMobile]           = useState(null);
  const [scrollY, setScrollY]             = useState(0);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 760);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveGallery((i) => (i + 1) % 4), 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const galleryImages = isMobile === null ? mobileImages : isMobile ? mobileImages : desktopImages;

  const handleAskExpert = () => {
    if (isMobile) {
      window.location.href = "/flo";
    } else {
      window.dispatchEvent(new CustomEvent("open-flo"));
      document.getElementById("flo-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ background: s.bg, color: s.text, minHeight: "100vh" }}>
      <style>{`
        .mq-track { display: flex; gap: 48px; animation: mq 28s linear infinite; white-space: nowrap; will-change: transform; }
        @keyframes mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .row-card { background: #1a1a18; border: 1px solid #2a2a28; border-radius: 4px; padding: 14px 16px; margin-bottom: 6px; }
        .mat-card { border-radius: 6px; overflow: hidden; position: relative; height: 140px; cursor: pointer; }
        .mat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; display: block; }
        .mat-card:hover img { transform: scale(1.05); }
        .popular-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 20px; }
        @media (min-width: 640px) { .popular-grid { grid-template-columns: 1fr 1fr 1fr; } .mat-card { height: 200px; } }
        .stat-box { background: #1a1a18; border: 1px solid #2a2a28; padding: 18px 14px; transition: border-color 0.3s; }
        .stat-box:hover { border-color: rgba(201,169,110,0.25); }
        .nav-link { color: rgba(242,237,224,0.45); text-decoration: none; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; transition: color 0.2s; }
        .nav-link:hover { color: #f2ede0; }
        .nav-links { display: none !important; }
        @media (min-width: 760px) { .nav-links { display: flex !important; gap: 24px; align-items: center; } }
        .nav-expert-short { display: inline; }
        .nav-expert-long  { display: none; }
        @media (min-width: 760px) { .nav-expert-short { display: none; } .nav-expert-long { display: inline; } }
        .hero-h1 { font-size: 40px; }
        @media (min-width: 760px) { .hero-h1 { font-size: 58px; } }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: scrollY > 60 ? "rgba(17,17,16,0.95)" : "transparent", backdropFilter: scrollY > 60 ? "blur(16px)" : "none", borderBottom: scrollY > 60 ? `1px solid ${s.border}` : "none", transition: "all 0.4s", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
          <div style={{ fontFamily: s.serif, fontSize: "20px", fontWeight: 700, letterSpacing: "0.12em", color: s.text, lineHeight: 1.1 }}>STRATA</div>
          <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: "8.5px", fontWeight: 300, letterSpacing: "0.2em", color: "rgba(242,237,224,0.3)", textTransform: "uppercase", marginTop: "1px" }}>Superior Flooring</div>
        </button>
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#about" className="nav-link">About</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleAskExpert} style={{ background: "#1a1a18", border: `1px solid ${s.gold}`, color: s.gold, padding: "9px 14px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "2px", cursor: "pointer", fontFamily: s.sans, whiteSpace: "nowrap" }}>
            <span className="nav-expert-short">Ask Flo</span>
            <span className="nav-expert-long">Ask our expert</span>
          </button>
          <a href="/quote" style={{ background: s.gold, color: "#111", padding: "9px 18px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "2px", whiteSpace: "nowrap" }}>Free Quote</a>
        </div>
      </nav>

      <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {galleryImages.map((img, i) => (
            <Image key={i} src={img.url} alt={img.label} fill sizes="100vw" quality={100} priority={i === 0} style={{ objectFit: "cover", objectPosition: img.pos, opacity: i === activeGallery ? 1 : 0, transition: "opacity 1.4s ease" }} />
          ))}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(17,17,16,0.1) 0%, rgba(17,17,16,0.7) 45%, rgba(17,17,16,1) 88%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 20px 80px" }}>
          <div style={{ position: "absolute", top: "64px", right: "20px", textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: s.gold, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: s.sans }}>{galleryImages[activeGallery]?.label}</div>
            <div style={{ fontSize: "9px", color: "rgba(242,237,224,0.28)", letterSpacing: "0.08em", fontFamily: s.sans, marginTop: "2px" }}>{galleryImages[activeGallery]?.sub}</div>
          </div>
          <div style={{ background: s.gold, color: "#111", fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", padding: "5px 12px", display: "inline-block", marginBottom: "14px", textTransform: "uppercase", fontFamily: s.sans, alignSelf: "flex-start" }}>
            Quote in 60 seconds — free
          </div>
          <h1 className="hero-h1" style={{ fontFamily: s.serif, fontWeight: 700, color: s.text, lineHeight: 1.0, marginBottom: "12px" }}>
            New floors.<br />The price up front.<br /><span style={{ color: s.gold, fontStyle: "italic" }}>Nothing hidden.</span>
          </h1>
          <p style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.7, fontWeight: 300, marginBottom: "20px", maxWidth: "320px" }}>
            Instant estimate. Free home survey with samples. Vetted fitters. The price you are quoted is the price you pay.
          </p>
          <a href="/quote" style={{ background: s.gold, color: "#111", padding: "16px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "3px", display: "block", textAlign: "center", marginBottom: "10px", maxWidth: 320 }}>
            Get my free quote
          </a>
          <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.2)", textAlign: "center", fontFamily: s.sans, maxWidth: 320 }}>Free survey · No obligation · Fair pricing</div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-start", marginTop: "16px" }}>
            {galleryImages.map((_, i) => (
              <button key={i} onClick={() => setActiveGallery(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ width: i === activeGallery ? "22px" : "6px", height: "2px", background: i === activeGallery ? s.gold : "rgba(242,237,224,0.2)", borderRadius: "1px", transition: "all 0.4s" }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div id="flo-section"><FloSection /></div>

      <div style={{ overflow: "hidden", borderTop: `1px solid ${s.border}`, borderBottom: `1px solid ${s.border}`, padding: "14px 0", background: "rgba(201,169,110,0.04)" }}>
        <div className="mq-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ fontFamily: s.sans, fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: item.gold ? s.gold : "rgba(242,237,224,0.25)", flexShrink: 0 }}>
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <section style={{ padding: "48px 20px" }}>
        <Tag>The Strata difference</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "28px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "8px" }}>
          Most fitters make<br />you wait days.<br /><span style={{ color: s.gold, fontStyle: "italic" }}>We don&apos;t.</span>
        </div>
        <Divider />
        {[
          { title: "Instant estimate — before you speak to anyone",  body: "Answer a few questions and see a real price range straight away. No waiting for a callback that may never come." },
          { title: "No showroom. No markup.",                         body: "High street flooring brands build their retail overheads and sales commissions into every quote. We don't have any of that — and that's the point." },
          { title: "Free survey — we come to you",                   body: "We bring samples chosen for your rooms directly to your home. You choose in your own light, against your own walls, with no pressure." },
          { title: "No surprises on fitting day",                    body: "The price you're quoted is the price you pay. Everything agreed before a single tool comes out of the van." },
        ].map((item, i) => (
          <div key={i} className="row-card">
            <div style={{ fontSize: "10px", color: s.gold, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: s.sans, marginBottom: "5px" }}>{item.title}</div>
            <div style={{ fontSize: "12px", color: s.dim, lineHeight: 1.6, fontWeight: 300, fontFamily: s.sans }}>{item.body}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: "0 20px 48px" }}>
        <Tag>By the numbers</Tag>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          {stats.map((st, i) => <StatBox key={i} value={st.value} label={st.label} />)}
        </div>
      </section>

      <section id="how" style={{ padding: "0 20px 48px" }}>
        <Tag>How it works</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "16px" }}>
          Straightforward from<br /><span style={{ color: s.gold, fontStyle: "italic" }}>start to finish</span>
        </div>
        {howItWorksSteps.map((st, i) => (
          <StepCard key={i} num={st.num} title={st.title} body={st.body} delay={i * 100} />
        ))}
      </section>

      <section style={{ padding: "0 20px 48px" }}>
        <Tag>Straight with you</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "16px" }}>
          We&apos;re new.<br /><span style={{ color: s.gold, fontStyle: "italic" }}>Our work isn&apos;t.</span>
        </div>
        <Divider />
        <div style={{ background: s.card, borderLeft: `3px solid ${s.gold}`, borderTop: `1px solid ${s.border}`, borderRight: `1px solid ${s.border}`, borderBottom: `1px solid ${s.border}`, borderRadius: "0 4px 4px 0", padding: "28px 24px", marginBottom: "16px" }}>
          <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "20px" }}>
            Strata launched recently. We don&apos;t have hundreds of reviews yet — and we&apos;re not going to make any up. What we do have is over two decades of flooring experience behind every job we take on, a surveyor who visits before anything is ordered, and a simple promise: the price you&apos;re quoted is the price you pay.
          </div>
          <a href="https://g.page/r/placeholder" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontFamily: s.sans, fontSize: "12px", color: s.gold, textDecoration: "none", letterSpacing: "0.04em" }}>
            Completed a job with us? Leave us a review
          </a>
        </div>
      </section>

      <section style={{ padding: "0 20px 48px" }}>
        <Tag>What&apos;s popular right now</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "6px" }}>
          The floors people <span style={{ color: s.gold, fontStyle: "italic" }}>actually</span> want
        </div>
        <Divider />
        <div className="popular-grid">
          {[
            { name: "Carpet",    tag: "Most popular",   img: "/carpet.png" },
            { name: "LVT & SPC", tag: "Most versatile", img: "/lvt-herringbone-oak.png" },
            { name: "Laminate",  tag: "Great value",    img: "/laminate-greige-oak.png" },
          ].map(({ name, tag, img }) => (
            <div key={name} className="mat-card">
              <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,16,0.96) 0%, rgba(17,17,16,0.3) 60%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
                <div style={{ fontFamily: s.serif, fontSize: "18px", fontWeight: 700, color: s.text, lineHeight: 1, marginBottom: "4px" }}>{name}</div>
                <div style={{ fontFamily: s.sans, fontSize: "9px", letterSpacing: "0.14em", color: s.gold, textTransform: "uppercase" }}>{tag}</div>
              </div>
            </div>
          ))}
        </div>
        <a href="/quote" style={{ display: "block", textAlign: "center", background: s.gold, color: "#111", padding: "16px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "3px" }}>
          Get my free quote
        </a>
      </section>

      <section id="about" style={{ padding: "48px 20px", borderTop: `1px solid ${s.border}` }}>
        <Tag>Who we are</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "8px" }}>
          A new business.<br />Two decades of<br /><span style={{ color: s.gold, fontStyle: "italic" }}>flooring know-how.</span>
        </div>
        <Divider />
        <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "16px" }}>
          Strata is a new business — and we&apos;ll be straight with you about that. What we&apos;re not new to is flooring. The people behind Strata have over two decades of hands-on experience across Essex and London, covering everything from period-property timber subfloors to large-scale commercial fits.
        </div>
        <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "16px" }}>
          We started Strata because getting new flooring has always been a worse experience than the floor itself. Callbacks that don&apos;t come. Quotes that change on the day. Fitters who leave before you&apos;ve checked the edges. We&apos;ve seen it from the inside, and we built something better.
        </div>
        <div style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "24px" }}>
          No showroom. No sales team. No inflated margins. Just people who know flooring, a transparent process, and a simple rule: the price you&apos;re quoted is the price you pay.
        </div>
        {[
          { stat: "20+",            label: "Years of hands-on flooring expertise" },
          { stat: "Essex & London", label: "Our home territory — and growing" },
          { stat: "0",              label: "Hidden costs. Ever." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "14px 0", borderBottom: `1px solid ${s.border}` }}>
            <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.gold, lineHeight: 1, flexShrink: 0, minWidth: "100px" }}>{item.stat}</div>
            <div style={{ fontFamily: s.sans, fontSize: "12px", color: s.dim, lineHeight: 1.6, paddingTop: "4px" }}>{item.label}</div>
          </div>
        ))}
      </section>

      <section style={{ padding: "48px 20px", background: "rgba(201,169,110,0.025)", borderTop: `1px solid ${s.border}` }}>
        <Tag>Ready to start?</Tag>
        <div style={{ fontFamily: s.serif, fontSize: "26px", fontWeight: 700, color: s.text, lineHeight: 1.1, marginBottom: "8px" }}>
          Tell us about<br /><span style={{ color: s.gold, fontStyle: "italic" }}>your project</span>
        </div>
        <Divider />
        <p style={{ fontFamily: s.sans, fontSize: "13px", color: s.dim, lineHeight: 1.85, fontWeight: 300, marginBottom: "24px" }}>
          Takes about 60 seconds. Instant estimate. Free home survey. No obligation.
        </p>
        <a href="/quote" style={{ display: "block", textAlign: "center", background: s.gold, color: "#111", padding: "16px", fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: "3px", marginBottom: "12px" }}>
          Get my free quote
        </a>
        <div style={{ fontSize: "10px", color: "rgba(242,237,224,0.18)", textAlign: "center", fontFamily: s.sans }}>
          Free survey · No obligation · Fair pricing
        </div>
      </section>

      {showPhoneModal && (
        <>
          <div onClick={() => setShowPhoneModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(17,17,16,0.82)", zIndex: 200, backdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 201, width: "min(92vw,420px)", background: "#111110", border: "1px solid rgba(201,169,110,0.35)", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ background: "rgba(201,169,110,0.07)", padding: "28px 28px 24px", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: s.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: s.serif, fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#111" }}>F</span>
                </div>
                <div>
                  <div style={{ fontFamily: s.serif, fontSize: 18, fontWeight: 600, color: s.text }}>Before you call</div>
                  <div style={{ fontFamily: s.sans, fontSize: 11, color: "rgba(242,237,224,0.45)", marginTop: 2 }}>Flo can usually answer faster than a phone queue</div>
                </div>
              </div>
              <p style={{ fontFamily: s.sans, fontSize: 13, color: "rgba(242,237,224,0.65)", lineHeight: 1.7, margin: 0 }}>
                Flo is Strata&apos;s flooring expert — available right now for pricing guidance, material advice, or help booking your free survey. No hold music.
              </p>
            </div>
            <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setShowPhoneModal(false); document.getElementById("flo-section")?.scrollIntoView({ behavior: "smooth" }); }} style={{ width: "100%", background: s.gold, color: "#111", border: "none", borderRadius: "4px", padding: "15px", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: s.sans }}>
                Chat with Flo now
              </button>
              <a href="tel:01234567890" onClick={() => setShowPhoneModal(false)} style={{ display: "block", width: "100%", background: "transparent", color: "rgba(242,237,224,0.45)", border: "1px solid rgba(242,237,224,0.15)", borderRadius: "4px", padding: "13px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: s.sans, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
                Call anyway — 01234 567890
              </a>
            </div>
          </div>
        </>
      )}

      <footer style={{ padding: "40px 20px", borderTop: `1px solid ${s.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
          <div>
            <div style={{ fontFamily: s.serif, fontSize: "20px", fontWeight: 700, letterSpacing: "0.1em" }}>STRATA</div>
            <div style={{ fontFamily: "var(--font-outfit,'Outfit',system-ui,sans-serif)", fontSize: "8px", fontWeight: 300, letterSpacing: "0.2em", color: "rgba(242,237,224,0.25)", textTransform: "uppercase", marginTop: "1px" }}>Superior Flooring</div>
          </div>
          <div style={{ fontFamily: s.sans, fontSize: "11px", color: "rgba(242,237,224,0.2)" }}>
            2026 Strata · Essex & London · All rights reserved.
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${s.border}`, paddingTop: "20px", display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <a href="/fitter/apply" style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(242,237,224,0.2)", textDecoration: "none" }}>Are you a fitter? Join Strata</a>
          <a href="/surveyor/apply" style={{ fontFamily: s.sans, fontSize: "10px", color: "rgba(242,237,224,0.2)", textDecoration: "none" }}>Interested in surveying? Apply here</a>
        </div>
      </footer>
    </div>
  );
}
