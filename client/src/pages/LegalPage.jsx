import { Link } from 'react-router-dom';
import './Static.css';

const UPDATED = 'June 2026';

const DOCS = {
  shipping: {
    eyebrow: 'Policies',
    title: 'Shipping Policy',
    intro: 'How and when your order ships.',
    body: (
      <>
        <h2>Processing &amp; same-day shipping</h2>
        <p>
          In-stock orders placed before <strong>2:00pm CT</strong> on a business day ship the
          same day. Orders placed after 2pm CT, on weekends, or on holidays ship the next
          business day.
        </p>

        <h2>Shipping rates &amp; speeds</h2>
        <p>
          At checkout you'll see live shipping options based on your delivery address and order
          weight, including ground and expedited (2-day and overnight) services. Choose the speed
          that fits your timeline.
        </p>
        <ul>
          <li><strong>Free ground shipping</strong> on orders over $500 (after discounts, before tax).</li>
          <li>Expedited options are available at checkout for time-sensitive jobs.</li>
          <li>Heavy or oversized orders may ship by freight; we'll contact you if so.</li>
        </ul>

        <h2>Tracking</h2>
        <p>
          As soon as your order ships, we'll email you a tracking number. You can also view
          tracking anytime from <strong>My Orders</strong> in your account.
        </p>

        <h2>Delivery issues</h2>
        <p>
          If your package is lost, delayed, or arrives damaged, contact us at{' '}
          <a href="mailto:bsdgaragesupply@gmail.com">bsdgaragesupply@gmail.com</a> within 7 days of
          the expected delivery date and we'll make it right.
        </p>
      </>
    )
  },

  returns: {
    eyebrow: 'Policies',
    title: 'Returns & Warranty',
    intro: 'Our return policy and product warranty.',
    body: (
      <>
        <h2>30-day returns</h2>
        <p>
          We want you to get the right part. Unused, uninstalled items in their original
          condition may be returned within <strong>30 days</strong> of delivery for a refund or
          exchange.
        </p>
        <ul>
          <li>Items must be unused, uninstalled, and in resalable condition.</li>
          <li>A copy of your order number is required (find it in <strong>My Orders</strong>).</li>
          <li>Return shipping is the customer's responsibility unless the item arrived defective or we shipped the wrong part.</li>
        </ul>

        <h2>How to start a return</h2>
        <p>
          Email <a href="mailto:bsdgaragesupply@gmail.com">bsdgaragesupply@gmail.com</a> with your
          order number and the item(s) you'd like to return. We'll send return instructions.
          Refunds are issued to your original payment method within 5–7 business days after we
          receive and inspect the item.
        </p>

        <h2>Non-returnable items</h2>
        <p>
          For safety reasons, installed springs and custom-wound or special-order springs cannot
          be returned unless they are defective.
        </p>

        <h2>Warranty</h2>
        <p>
          Our springs and hardware are warranted against manufacturing defects. If a product
          fails due to a defect in materials or workmanship under normal use, contact us and we'll
          replace it. This warranty does not cover normal wear, improper installation, or misuse.
        </p>
        <p>
          <strong>Safety note:</strong> Garage door springs are under high tension and should be
          installed only by trained professionals using proper tools.
        </p>
      </>
    )
  },

  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: 'How we collect, use, and protect your information.',
    body: (
      <>
        <h2>Information we collect</h2>
        <p>When you create an account or place an order, we collect information you provide, such as:</p>
        <ul>
          <li>Name, company name, email, and phone number;</li>
          <li>Shipping and billing addresses;</li>
          <li>Order history and account preferences.</li>
        </ul>
        <p>
          Payment card details are processed securely by our payment processor (Stripe) and are
          never stored on our servers.
        </p>

        <h2>How we use your information</h2>
        <ul>
          <li>To process and ship your orders;</li>
          <li>To send order confirmations, shipping updates, and account notifications;</li>
          <li>To respond to your questions and provide support;</li>
          <li>To improve our products and services.</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We do not sell your personal information. We share it only with service providers who
          help us operate the business — such as our payment processor and shipping carriers — and
          only as needed to fulfill your order or as required by law.
        </p>

        <h2>Data security</h2>
        <p>
          We use industry-standard measures, including encrypted connections (HTTPS) and secure
          password storage, to protect your information.
        </p>

        <h2>Your choices</h2>
        <p>
          You can update your account details anytime from your dashboard, or contact us at{' '}
          <a href="mailto:bsdgaragesupply@gmail.com">bsdgaragesupply@gmail.com</a> to access or
          delete your information.
        </p>
      </>
    )
  },

  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro: 'The terms that govern use of our website and services.',
    body: (
      <>
        <h2>Accounts</h2>
        <p>
          You're responsible for keeping your account credentials secure and for all activity
          under your account. Provide accurate information when registering and ordering.
        </p>

        <h2>Pricing &amp; orders</h2>
        <p>
          Prices are shown to signed-in account holders and may change at any time. We work hard
          to keep pricing and stock accurate, but errors can occur. We reserve the right to cancel
          or correct any order affected by a pricing or inventory error, and to refuse or limit
          orders at our discretion.
        </p>

        <h2>Payment</h2>
        <p>
          Payment is processed securely at checkout. By placing an order you authorize us to
          charge your payment method for the order total, including shipping and applicable taxes.
        </p>

        <h2>Product use &amp; safety</h2>
        <p>
          Garage door springs and hardware are under high tension and intended for installation by
          trained professionals. You are responsible for safe, proper installation. BSD Garage
          Supply is not liable for injury or damage resulting from improper installation or misuse.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, our liability for any claim related to a product
          or order is limited to the amount you paid for that product. We are not liable for
          indirect or consequential damages.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Email{' '}
          <a href="mailto:bsdgaragesupply@gmail.com">bsdgaragesupply@gmail.com</a>.
        </p>
      </>
    )
  }
};

export default function LegalPage({ doc }) {
  const d = DOCS[doc];
  if (!d) return null;
  return (
    <div className="static-page">
      <div className="static-hero">
        <div className="static-hero-inner">
          <div className="static-eyebrow">{d.eyebrow}</div>
          <h1>{d.title}</h1>
          <p>{d.intro}</p>
        </div>
      </div>
      <div className="static-body">
        <div className="static-updated">Last updated: {UPDATED}</div>
        {d.body}
        <p style={{ marginTop: '40px' }}>
          <Link to="/contact" className="text-link">Questions? Contact us</Link>
        </p>
      </div>
    </div>
  );
}
