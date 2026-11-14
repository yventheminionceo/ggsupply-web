import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Crosshair, Flame, Gift, Layers3, Search, ShoppingBag, Sparkles, Target, X, type LucideIcon } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/GgSiteChrome";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { MarketProduct } from "../../../shared/siteContent";

const filters = [
  { id: "ALL", label: "ALL ITEMS" },
  { id: "CURRENCY", label: "GAME CURRENCY" },
  { id: "PASSES", label: "PASSES" },
  { id: "GIFT CARDS", label: "GIFT CARDS" },
  { id: "COACHING", label: "COACHING" },
] as const;

const marketIcons: Record<MarketProduct["icon"], LucideIcon> = {
  crosshair: Crosshair,
  sparkles: Sparkles,
  flame: Flame,
  calendar: CalendarDays,
  gift: Gift,
  target: Target,
};

export default function Market() {
  const content = useSiteContent();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(null);
  const visibleProducts = useMemo(() => activeFilter === "ALL" ? content.market : content.market.filter((product) => product.category === activeFilter), [activeFilter, content.market]);

  return (
    <div className="site-shell">
      <SiteHeader activeSection="market" />
      <main className="market-page">
        <section className="page-hero market-hero">
          <div className="page-wrap page-hero-inner">
            <div className="page-hero-copy">
              <div className="eyebrow"><span className="eyebrow-mark"><ShoppingBag size={13} /></span> GG SUPPLY / GAMING MARKET</div>
              <p className="hero-pretitle">{content.settings.tagline}</p>
              <h1>LOAD UP.<br /><span>PLAY ON.</span></h1>
              <p className="page-hero-description">Browse game currency, passes, gift cards, and coaching in one place. This market is a layout preview; products, prices, availability, and checkout still need to be set.</p>
              <div className="hero-buttons">
                <a className="button button-accent" href="#market-items">Browse the market <ArrowUpRight size={17} /></a>
                <a className="button button-ghost" href="/tournaments">View tournaments <ArrowRight size={16} /></a>
              </div>
              <div className="hero-proofline"><span><Check size={14} /> Built for players</span><i /><span>TOP UPS <b>·</b> PASSES <b>·</b> COACHING</span></div>
            </div>
            <aside className="market-terminal">
              <div className="market-terminal-head"><span><span className="panel-dot" /> CATALOG PREVIEW</span><span>GG / 02</span></div>
              <div className="market-terminal-title">ONE LOBBY.<br /><em>MORE OPTIONS.</em></div>
              <div className="market-terminal-list">
                <div><span className="market-terminal-icon cyan"><Crosshair size={16} /></span><span><b>Game currency</b><small>Pack details to add</small></span><ArrowUpRight size={15} /></div>
                <div><span className="market-terminal-icon violet"><Layers3 size={16} /></span><span><b>Passes &amp; cards</b><small>Regions to set</small></span><ArrowUpRight size={15} /></div>
                <div><span className="market-terminal-icon coral"><Target size={16} /></span><span><b>Coaching</b><small>Session details to add</small></span><ArrowUpRight size={15} /></div>
              </div>
              <div className="market-terminal-foot"><span>PRICES NOT SET</span><span>CATALOG / {String(content.market.length).padStart(2, "0")}</span></div>
            </aside>
          </div>
          <div className="page-wrap page-hero-foot"><span>GG / MARKET</span><span>CATALOG LAYOUT PREVIEW</span><a href="#market-items">SCROLL TO BROWSE <ArrowRight size={14} /></a></div>
        </section>

        <section className="market-catalog content-section" id="market-items">
          <div className="page-wrap">
            <div className="section-index"><span>01</span><i /> THE CATALOG</div>
            <div className="market-heading-row">
              <div><h2>YOUR GAME.<br /><span>YOUR LOADOUT.</span></h2><p>Filter the current GG SUPPLY catalog by the kind of drop you want.</p></div>
              <div className="market-catalog-meta"><span><span className="live-dot" /> CATALOG</span><b>{String(visibleProducts.length).padStart(2, "0")} ITEMS</b></div>
            </div>
            <div className="market-toolbar" role="group" aria-label="Filter market products">
              <div className="market-filters">{filters.map((filter) => <button key={filter.id} className={activeFilter === filter.id ? "market-filter active" : "market-filter"} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}</div>
              <p><Search size={14} /> Prices and fulfillment details are set by GG SUPPLY</p>
            </div>
            {visibleProducts.length ? (
              <div className="market-grid">
                {visibleProducts.map((product, index) => {
                  const Icon = marketIcons[product.icon];
                  return (
                    <article className={`market-card market-${product.color}`} key={product.id}>
                      <div className="market-card-top"><span>{product.category} / {String(index + 1).padStart(2, "0")}</span><span className="market-card-mark"><Icon size={19} /></span></div>
                      <div className="market-card-art"><div className="market-art-ring" /><Icon size={40} strokeWidth={1.25} /></div>
                      <div className="market-card-copy"><small>{product.game}</small><h3>{product.offer}</h3><p>{product.note || product.detail}</p></div>
                      <div className="market-price-row"><span>PRICE</span><b>{product.priceLabel || "ASK GG SUPPLY"}</b></div>
                      <button className="market-card-action" onClick={() => setSelectedProduct(product)}>View details <ArrowUpRight size={15} /></button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="market-empty"><ShoppingBag size={24} /><b>No listings in this category yet.</b><span>Check back after GG SUPPLY adds its first item.</span></div>
            )}
            <div className="market-disclaimer"><span><Check size={15} /></span><p><b>Questions about a listing?</b> Use the official GG SUPPLY contact channel before sending a payment. This catalog does not process checkout.</p></div>
          </div>
        </section>
        <section className="market-next page-wrap"><div><span>KEEP THE BRACKET CLOSE</span><h2>READY FOR<br /><em>TOURNAMENT DAY?</em></h2></div><a className="button button-accent" href="/tournaments">Explore tournaments <ArrowRight size={17} /></a></section>
      </main>
      <SiteFooter />

      {selectedProduct && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="market-modal-title">
            <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product preview"><X size={20} /></button>
            <span className="modal-kicker"><ShoppingBag size={14} /> MARKET LISTING</span>
            <h2 id="market-modal-title">{selectedProduct.game}</h2>
            <p>{selectedProduct.detail}</p>
            <div className="market-modal-fields"><div><span>OFFER</span><b>{selectedProduct.offer}</b></div><div><span>PRICE</span><b>{selectedProduct.priceLabel || "Contact GG SUPPLY"}</b></div><div><span>DETAILS</span><b>{selectedProduct.note || "See listing"}</b></div></div>
            <p className="modal-note">No online purchase or checkout is enabled.</p>
            <button className="button button-accent modal-done" onClick={() => setSelectedProduct(null)}>Close <Check size={16} /></button>
          </section>
        </div>
      )}
    </div>
  );
}
