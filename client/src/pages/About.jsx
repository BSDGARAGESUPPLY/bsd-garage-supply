import { Link } from 'react-router-dom';
import './Static.css';

export default function About() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <div className="static-hero-inner">
          <div className="static-eyebrow">About BSD Garage Supply</div>
          <h1>Built for the techs who keep doors moving.</h1>
          <p>
            We supply professional-grade garage door springs and hardware — the parts you
            count on to finish the job right, the first time.
          </p>
        </div>
      </div>

      <div className="static-body">
        <h2>Who we are</h2>
        <p>
          BSD Garage Supply is a garage door parts supplier serving technicians, contractors,
          and repair companies. We stock the springs and hardware door pros reach for every
          day — torsion springs in a full range of sizes, plus the brackets, bearings, hinges,
          and mounts that complete an install.
        </p>
        <p>
          We started BSD with one goal: make it fast and simple for working techs to get
          quality parts at a fair price, without the runaround. Create a free account, see
          live pricing, and order in minutes — no minimums, no membership games.
        </p>

        <h2>Why techs choose BSD</h2>
        <div className="about-values">
          <div className="about-value">
            <div className="about-value-icon">⚡</div>
            <h3>Fast shipping</h3>
            <p>Orders placed before 2pm CT ship the same day, so you're not stuck waiting on parts.</p>
          </div>
          <div className="about-value">
            <div className="about-value-icon">🛡️</div>
            <h3>Quality you trust</h3>
            <p>Oil-tempered, galvanized springs and heavy-duty hardware built to last cycle after cycle.</p>
          </div>
          <div className="about-value">
            <div className="about-value-icon">💬</div>
            <h3>Real support</h3>
            <p>Talk to people who know garage doors. We help you get the right part the first time.</p>
          </div>
        </div>

        <h2>What we carry</h2>
        <ul>
          <li><strong>Torsion springs</strong> — a full range of wire sizes, inside diameters, and lengths, in both left and right wind.</li>
          <li><strong>Brackets &amp; hardware</strong> — end bearing brackets, center mounts, bearings, and hinges.</li>
          <li>Reliable stock, ready to ship — so you can keep your trucks moving.</li>
        </ul>

        <div className="static-cta">
          <h2>Ready to order?</h2>
          <p>Create a free account to see pricing and place your first order in minutes.</p>
          <div className="flex gap-12" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create a Free Account</Link>
            <Link to="/catalog" className="btn btn-outline btn-lg">Browse the Catalog</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
