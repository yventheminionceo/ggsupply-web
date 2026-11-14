import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Crosshair, Flame, Gift, Layers3, Search, ShoppingBag, Sparkles, Target, X } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/GgSiteChrome";

const filters = [
  { id: "ALL", label: "ALL ITEMS" },
  { id: "CURRENCY", label: "GAME CURRENCY" },
  { id: "PASSES", label: "PASSES" },
  { id: "GIFT CARDS", label: "GIFT CARDS" },
  { id: "COACHING", label: "COACHING" },
] as const;

const products = [
  { id: "pubg-uc", game: "PUBG MOBILE", offer: "UC TOP-UP", category: "CURRENCY", detail: "Choose a UC pack, then add the region and player instructions for your catalog.", note: "PACK OPTIONS TO ADD", color: "cyan", icon: Crosshair },
  { id: "mlbb-diamonds", game: "MOBILE LEGENDS", offer: "DIAMOND TOP-UP", category: "CURRENCY", detail: "Add available diamond packs, region notes, and delivery details here.", note: "PACK OPTIONS TO ADD", color: "violet", icon: Sparkles },
  { id: "freefire-diamonds", game: "FREE FIRE", offer: "DIAMOND TOP-UP", category: "CURRENCY", detail: "Set the supported options, player instructions, and delivery details before listing.", note: "PACK OPTIONS TO ADD", color: "coral", icon: Flame },
  { id: "weekly-pass", game: "MOBILE LEGENDS", offer: "WEEKLY PASS", category: "PASSES", detail: "Add pass availability, price, region, and delivery notes when ready.", note: "PRICE & AVAILABILITY TO ADD", color: "cyan", icon: CalendarDays },
  { id: "gift-card", game: "DIGITAL GAME CARDS", offer: "GIFT CARD", category: "GIFT CARDS", detail: "Choose the supported game, region, denomination, and delivery method for this listing.", note: "REGION & DENOMINATION TO ADD", color: "violet", icon: Gift },
  { id: "coaching", game: "GG SUPPLY COACHING", offer: "1:1 SESSION", category: "COACHING", detail: "Add the game, coach profile, specialty, session details, and available slots.", note: "COACH & SESSION TO ADD", color: "coral", icon: Target },
] as const;

export default function Market() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[number] | null>(null);
  const visibleProducts = useMemo(() => activeFilter === "ALL" ? products : products.filter((product) => product.category === activeFilter), [activeFilter]);

  return (
    <div className="site-shell">
      <SiteHeader activeSection="market" />
      <main className="market-page">
        <section className="page-hero market-hero">
          <div className="page-wrap page-hero-inner">
            <div className="page-hero-copy">
              <div className="eyebrow"><span className="eyebrow-mark"><ShoppingBag size={13} /></span> GG SUPPLY / GAMING MARKET</div>
              <p className="hero-pretitle">GAME SMART. PLAY HARD.</p>
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
              <div className="market-terminal-foot"><span>PRICES NOT SET</span><span>CATALOG / 06</span></div>
            </aside>
          </div>
          <div className="page-wrap page-hero-foot"><span>GG / MARKET</span><span>CATALOG LAYOUT PREVIEW</span><a href="#market-items">SCROLL TO BROWSE <ArrowRight size={14} /></a></div>
        </section>

        <section className="market-catalog content-section" id="market-items">
          <div className="page-wrap">
            <div className="section-index"><span>01</span><i /> THE CATALOG</div>
            <div className="market-heading-row">
              <div><h2>YOUR GAME.<br /><span>YOUR LOADOUT.</span></h2><p>Filter the mock catalog by the kind of drop you want to feature.</p></div>
              <div className="market-catalog-meta"><span><span className="live-dot" /> PREVIEW CATALOG</span><b>{String(visibleProducts.length).padStart(2, "0")} ITEMS</b></div>
            </div>
            <div className="market-toolbar" role="group" aria-label="Filter market products">
              <div className="market-filters">{filters.map((filter) => <button key={filter.id} className={activeFilter === filter.id ? "market-filter active" : "market-filter"} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}</div>
              <p><Search size={14} /> Product details and prices are placeholders</p>
            </div>
            <div className="market-grid">
              {visibleProducts.map((product, index) => {
                const Icon = product.icon;
                return (
                  <article className={`market-card market-${product.color}`} key={product.id}>
                    <div className="market-card-top"><span>{product.category} / 0{index + 1}</span><span className="market-card-mark"><Icon size={19} /></span></div>
                    <div className="market-card-art"><div className="market-art-ring" /><Icon size={40} strokeWidth={1.25} /></div>
                    <div className="market-card-copy"><small>{product.game}</small><h3>{product.offer}</h3><p>{product.note}</p></div>
                    <div className="market-price-row"><span>PRICE</span><b>TO ADD</b></div>
                    <button className="market-card-action" onClick={() => setSelectedProduct(product)}>View options <ArrowUpRight size={15} /></button>
                  </article>
                );
              })}
            </div>
            <div className="market-disclaimer"><span><Check size={15} /></span><p><b>Catalog preview</b> — no live inventory, prices, purchase, or checkout are enabled yet. Add approved product details before taking orders.</p></div>
          </div>
        </section>
        <section className="market-next page-wrap"><div><span>KEEP THE BRACKET CLOSE</span><h2>READY FOR<br /><em>TOURNAMENT DAY?</em></h2></div><a className="button button-accent" href="/tournaments">Explore tournaments <ArrowRight size={17} /></a></section>
      </main>
      <SiteFooter />

      {selectedProduct && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="market-modal-title">
            <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close product preview"><X size={20} /></button>
            <span className="modal-kicker"><ShoppingBag size={14} /> CATALOG ITEM PREVIEW</span>
            <h2 id="market-modal-title">{selectedProduct.game}</h2>
            <p>{selectedProduct.detail}</p>
            <div className="market-modal-fields"><div><span>OFFER</span><b>{selectedProduct.offer}</b></div><div><span>PRICE</span><b>To be added</b></div><div><span>AVAILABILITY</span><b>To be set</b></div></div>
            <p className="modal-note">Preview only — no purchase or checkout is enabled.</p>
            <button className="button button-accent modal-done" onClick={() => setSelectedProduct(null)}>Got it <Check size={16} /></button>
          </section>
        </div>
      )}
    </div>
  );
}
