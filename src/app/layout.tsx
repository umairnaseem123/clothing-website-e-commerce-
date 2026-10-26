import type { Metadata } from "next";
import { Jost } from "next/font/google";
import Link from "next/link";
import "./store.css";
import "./kalite.css";
import { site } from "@/lib/site";
import { CartProvider } from "@/components/CartProvider";
import SiteHeader from "@/components/SiteHeader";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jost.variable}>
      <body>
        <CartProvider>
          <div className="topbar">Cash on delivery available. Easypaisa and bank transfer accepted.</div>
          <SiteHeader />
          {children}
          <footer className="footer">
            <div className="footer-in">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="k-footer-logo" src="/brand/kalite-logo-light.png" alt={site.name} />
                <p>100% original branded apparel.</p>
                <p>Sizes: S, M, L, XL</p>
              </div>
              <div>
                <h4>Payment</h4>
                <p>Cash on delivery</p>
                <p>Easypaisa and JazzCash</p>
                <p>Bank transfer</p>
                <p>Advance payment</p>
              </div>
              <div>
                <h4>Help</h4>
                <Link href="/terms">Terms and conditions</Link>
              </div>
              <div>
                <h4>Follow us</h4>
                <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href={site.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            </div>
            <p className="copy">&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          </footer>
          <a className="wa-float" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
