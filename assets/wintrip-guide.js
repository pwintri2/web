/**
 * Wintrip Gids & Product-Assistent (MiniMax-M3 + Interactieve Pagina-Rondleiding)
 * Past automatisch zijn kleurthema aan op:
 * - Centrale Landingspagina (Tri-color Emerald / Indigo / Amber)
 * - MKB Uptime & FormulierWacht (Emerald #10b981)
 * - ContentBoost Studio (Indigo / Violet #6366f1)
 * - Websites voor het Spiritueel Vlak (Amber / Goud #f59e0b)
 */
(function () {
  "use strict";

  if (window.__WINTRIP_GUIDE_INITIALIZED__) return;
  window.__WINTRIP_GUIDE_INITIALIZED__ = true;

  // MANDATORY: Feature detect 'popover' on HTMLElement.prototype and load polyfill only when missing
  if (typeof HTMLElement !== "undefined" && !("popover" in HTMLElement.prototype)) {
    import("https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js").catch(function () {});
  }

  // Discrete display transition probe (Firefox bug 1882408 guard)
  var supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports("transition-behavior", "allow-discrete") || !document.body) {
      return false;
    }
    var probe = document.createElement("div");
    probe.style.cssText = "transition: display 1s allow-discrete !important; display: block;";
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = "none";
    supportsDisplayTransition = getComputedStyle(probe).display === "block";
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS && window.CSS.supports && window.CSS.supports("overlay", "auto") && canTransitionDisplay());
  }

  async function closeTopLayer(element) {
    if (!element) return;
    if (!supportsTopLayerExit()) {
      element.setAttribute("data-closing", "");
      var animations = element.getAnimations ? element.getAnimations({ subtree: true }) : [];
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map(function (a) { return a.finished; })),
          new Promise(function (r) { setTimeout(r, 400); })
        ]);
      }
      if (!element.hasAttribute("data-closing")) return;
      element.removeAttribute("data-closing");
    }
    if (typeof element.hidePopover === "function") {
      try {
        element.hidePopover();
      } catch (e) {
        element.removeAttribute("open");
        element.classList.remove("wintrip-legacy-open");
      }
    } else if (typeof element.close === "function") {
      element.close();
    } else {
      element.classList.remove("wintrip-legacy-open");
    }
  }

  function openTopLayer(element) {
    if (!element) return;
    element.removeAttribute("data-closing");
    if (typeof element.showPopover === "function") {
      try {
        element.showPopover();
        return;
      } catch (e) {}
    }
    element.classList.add("wintrip-legacy-open");
  }

  function isTopLayerOpen(element) {
    if (!element) return false;
    try {
      if (element.matches(":popover-open") || element.classList.contains(":popover-open")) return true;
    } catch (e) {}
    return element.classList.contains("wintrip-legacy-open");
  }

  // Detecteer site & thema
  function detectSiteContext() {
    var scriptEl = document.querySelector("script[data-wintrip-site], script[src*='wintrip-guide']");
    var forcedSite = scriptEl ? scriptEl.getAttribute("data-wintrip-site") : null;
    var forcedApi = scriptEl ? scriptEl.getAttribute("data-wintrip-api") : null;
    var path = (window.location.pathname || "/").toLowerCase();
    var title = document.title || "";

    var siteId = forcedSite || "landingspagina";
    if (!forcedSite) {
      if (path.indexOf("/signup") !== -1 || path.indexOf("mkb-uptime") !== -1 || title.indexOf("MKB Website") !== -1) {
        siteId = "mkb_uptime";
      } else if (path.indexOf("/cp/") !== -1 || path.indexOf("contentboost") !== -1 || path.indexOf("content-repurposer") !== -1 || title.indexOf("ContentBoost") !== -1) {
        siteId = "contentboost";
      } else if (path.indexOf("/web") !== -1 || title.indexOf("spiritueel") !== -1 || document.getElementById("aanvraag-formulier")) {
        siteId = "web_spiritueel";
      }
    }

    var themes = {
      mkb_uptime: {
        name: "MKB Uptime Assistent",
        subtitle: "Kent alle pakketten (€3/€5/€7) & leidt je rond",
        primary: "#10b981",
        primaryHover: "#059669",
        accentSoft: "rgba(16, 185, 129, 0.16)",
        borderGlow: "rgba(16, 185, 129, 0.45)",
        btnGrad: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
        btnText: "#022c22",
        badge: "MKB Uptime & FormulierWacht"
      },
      contentboost: {
        name: "ContentBoost Assistent",
        subtitle: "Kent Solo, Pro & Agency + geeft rondleidingen",
        primary: "#6366f1",
        primaryHover: "#4f46e5",
        accentSoft: "rgba(99, 102, 241, 0.18)",
        borderGlow: "rgba(139, 92, 246, 0.5)",
        btnGrad: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        btnText: "#ffffff",
        badge: "ContentBoost Studio"
      },
      web_spiritueel: {
        name: "Website & Pakket Gids",
        subtitle: "Kent alle pakketten, sfeerkeuzes & het formulier",
        primary: "#f59e0b",
        primaryHover: "#d97706",
        accentSoft: "rgba(245, 158, 11, 0.16)",
        borderGlow: "rgba(245, 158, 11, 0.48)",
        btnGrad: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #d97706 100%)",
        btnText: "#0f172a",
        badge: "Websites voor het Spiritueel Vlak"
      },
      landingspagina: {
        name: "Wintrip Studio Gids",
        subtitle: "Kent MKB Uptime, ContentBoost & Websites",
        primary: "#10b981",
        primaryHover: "#059669",
        accentSoft: "rgba(16, 185, 129, 0.15)",
        borderGlow: "rgba(99, 102, 241, 0.48)",
        btnGrad: "linear-gradient(135deg, #10b981 0%, #6366f1 52%, #f59e0b 100%)",
        btnText: "#ffffff",
        badge: "Philip Wintrip Web & SaaS Studio"
      }
    };

    var apiEndpoints = [];
    if (forcedApi) apiEndpoints.push(forcedApi);
    apiEndpoints.push("https://philip-wintrip.nl/agent/public/api/chat");
    if (window.location.origin.indexOf("philip-wintrip.nl") !== -1) {
      apiEndpoints.unshift("/agent/public/api/chat");
    }

    return {
      siteId: siteId,
      pagePath: path,
      pageTitle: title,
      theme: themes[siteId] || themes.landingspagina,
      apiEndpoints: apiEndpoints
    };
  }

  // Bouw rondleiding-stappen per pagina
  function getTourSteps(ctx) {
    var path = ctx.pagePath;

    if (ctx.siteId === "mkb_uptime") {
      return [
        {
          selector: "main section:first-of-type",
          title: "1. Elke 60 seconden website- & formulierbewaking",
          body: "MKB Uptime controleert elke minuut je laadtijd, HTTP-status, SSL-certificaat én of bezoekers je contactformulier echt kunnen invullen."
        },
        {
          selector: "#step-1-packages section:nth-of-type(2), #step-1-packages .grid",
          title: "2. Kies je pakket (€ 3, € 5 of € 7 p/m)",
          body: "Basis (€ 3) bewaakt uptime & SSL. Pro Formulier (€ 5, meest gekozen) test ook je contactformulier in een echte Chromium-browser. Compleet (€ 7) stuurt daarnaast direct WhatsApp-alerts."
        },
        {
          selector: "#step-2-checkout, #step-1-packages",
          beforeShow: function () {
            if (typeof window.selectPlan === "function") {
              var step2 = document.getElementById("step-2-checkout");
              if (step2 && step2.classList.contains("hidden")) {
                window.selectPlan("pro");
              }
            }
          },
          title: "3. Direct aanmelden & Tikkie-activatie",
          body: "Vul je bedrijfsnaam, e-mail en de URL van je contactpagina in. Na aanmelding ontvang je een Tikkie-betaalverzoek en wordt je 1-minuut monitor geactiveerd."
        }
      ];
    }

    if (ctx.siteId === "contentboost") {
      return [
        {
          selector: "#hoe-het-werkt",
          title: "1. Hoe ContentBoost Studio werkt",
          body: "Je plakt één URL, RSS-feed of ruwe tekstnotitie. Onze worker maakt daar op de achtergrond automatisch jouw content-set van in je eigen Tone-of-Voice."
        },
        {
          selector: "#voorbeeld",
          title: "2. Wat je per bron terugkrijgt",
          body: "Per ingediende bron ontvang je: 1 complete Concept-Nieuwsbrief, 3 LinkedIn-posts (voor dinsdag, donderdag en vrijdag) én een Executive Summary met 5 Key Takeaways."
        },
        {
          selector: "#pakketten",
          title: "3. Vaste pakketten voor ongelimiteerde drafts",
          body: "Kies tussen Solo Maker (€ 15/mnd, 1 stemprofiel), Pro Coach & Creator (€ 22/mnd, 3 stemprofielen & 5 RSS-feeds) of Bureau/Agency (€ 29/mnd, 10 klant-stemmen)."
        },
        {
          selector: "#aanmelden",
          title: "4. Stel je eigen Tone-of-Voice & CTA in",
          body: "Vul hier je gegevens, gewenste schrijfstijl, vaste Call-to-Action en eventueel meteen je eerste URL of notitie in om te starten."
        }
      ];
    }

    if (ctx.siteId === "web_spiritueel") {
      if (path.indexOf("pakketten") !== -1) {
        return [
          {
            selector: "#pakketten",
            title: "1. De vier websitepakketten",
            body: "Van een rustige one-page (Essentieel € 495) tot een complete praktijkwebsite met afsprakenplanner en CMS (Helder € 895) of cursus-/webshopmodule (Uitgelicht € 1.595)."
          },
          {
            selector: "#vergelijking",
            title: "2. Overzichtelijke vergelijking",
            body: "Hier zie je per onderdeel precies wat er standaard in Essentieel, Helder, Uitgelicht en Maatwerk zit."
          },
          {
            selector: "#onderhoud",
            title: "3. Optioneel onderhoud (€ 0 tot € 89 p/m)",
            body: "Je zit nergens aan vast: kies Zelfbeheer (€ 0/mnd) of laat updates, back-ups en tekstwijzigingen door ons verzorgen (Zorgbasis € 25, Zorg plus € 49 of Zorg groei € 89)."
          }
        ];
      }
      if (path.indexOf("aanvraag") !== -1) {
        return [
          {
            selector: "#aanvraag-formulier fieldset:nth-of-type(1)",
            title: "1. Jouw contact- en praktijkgegevens",
            body: "Begin met je naam, e-mailadres en eventuele praktijknaam of huidige website. Je hoeft nog niet alles zeker te weten."
          },
          {
            selector: "#aanvraag-formulier fieldset:nth-of-type(3), #aanvraag-formulier fieldset:nth-of-type(4)",
            title: "2. Sfeer, uiterlijk & kleurpalet kiezen",
            body: "Kies de uitstraling (bijv. Warm & verzorgend of Mystiek & intiem) en het kleurpalet dat bij jouw werk past."
          },
          {
            selector: "#aanvraag-formulier fieldset:nth-of-type(6)",
            title: "3. Websitepakket & onderhoud",
            body: "Selecteer je gewenste pakket en onderhoudsvorm. Ligt je gewenste startdatum minimaal 21 dagen vooruit bij een standaardpakket, dan ontvang je direct een passend voorstel."
          },
          {
            selector: "aside, #indicatie-eenmalig",
            title: "4. Live prijsindicatie & 50/50 betaling",
            body: "In deze zijbalk rekent de pagina direct je eenmalige investering en maandbedrag uit. Betaling gaat veilig in twee delen: 50% bij start en 50% pas na oplevering."
          }
        ];
      }
      return [
        {
          selector: "main section:first-of-type",
          title: "1. Een website die ademt en vertrouwen uitstraalt",
          body: "Speciaal ontworpen voor therapeuten, coaches, yogadocenten, astrologen en retreat-organisaties."
        },
        {
          selector: "#voor-wie",
          title: "2. Afgestemd op jouw praktijk of werkveld",
          body: "Of je nu 1-op-1 sessies geeft, groepslessen en retreats organiseert of een spirituele webshop hebt: de structuur sluit aan op jouw bezoekers."
        },
        {
          selector: "#werkwijze",
          title: "3. In 4 rustige stappen naar een live website",
          body: "Van gratis kennismakingsgesprek (30 min) en moodboard binnen 3 werkdagen tot oplevering in 3 tot 5 weken."
        },
        {
          selector: "a[href*='aanvraag.html']",
          title: "4. Vraag vrijblijvend je website aan",
          body: "Klik op 'Vraag je website aan' om je sfeer, kleuren en pakket samen te stellen met live prijsindicatie."
        }
      ];
    }

    // Centrale Landingspagina
    return [
      {
        selector: "main section:first-of-type",
        title: "1. Welkom bij Philip Wintrip Web & SaaS Studio",
        body: "Vanaf deze centrale hub kies je direct tussen 24/7 website-bewaking, slimme AI content-automatisering of een op maat gemaakte website."
      },
      {
        selector: "#producten article:nth-of-type(1)",
        title: "2. MKB Uptime & FormulierWacht (vanaf € 3/mnd)",
        body: "Controleert elke 60 seconden je website, laadtijd, SSL én test je contactformulier in een echte browser. Met directe alerts via E-mail, Telegram en WhatsApp."
      },
      {
        selector: "#producten article:nth-of-type(2)",
        title: "3. ContentBoost Studio (vanaf € 15/mnd)",
        body: "Lever 1 URL, RSS-feed of ruwe notitie aan en ontvang automatisch een complete nieuwsbrief + 3 LinkedIn-posts in jouw eigen Tone-of-Voice."
      },
      {
        selector: "#producten article:nth-of-type(3)",
        title: "4. Websites voor het Spiritueel Vlak (vanaf € 495)",
        body: "Rustige, vertrouwenwekkende websites voor coaches, therapeuten en retreats. Inclusief heldere pakketten en optioneel onderhoud vanaf € 0/mnd."
      },
      {
        selector: "#vergelijking",
        title: "5. Vergelijk alle pakketten in één oogopslag",
        body: "Onderaan de pagina vind je een compleet overzicht van alle prijzen en onderdelen. Klik op een dienst om direct te starten!"
      }
    ];
  }

  function formatMarkdownReply(text) {
    var safe = String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/`([^`]+)`/g, "<code class='wg-code'>$1</code>");
    safe = safe.replace(/\n/g, "<br>");
    return safe;
  }

  function initWidget() {
    var ctx = detectSiteContext();
    var t = ctx.theme;
    var tourSteps = getTourSteps(ctx);
    var currentTourIndex = -1;
    var activeAnchorEl = null;
    var chatHistory = [];

    // Injecteer CSS met ondersteuning voor @starting-style, allow-discrete, overlay en CSS Anchor Positioning
    var style = document.createElement("style");
    style.id = "wintrip-guide-styles";
    style.textContent =
      ":root {" +
      "  --wg-primary: " + t.primary + ";" +
      "  --wg-primary-hover: " + t.primaryHover + ";" +
      "  --wg-accent-soft: " + t.accentSoft + ";" +
      "  --wg-border-glow: " + t.borderGlow + ";" +
      "  --wg-btn-grad: " + t.btnGrad + ";" +
      "  --wg-btn-text: " + t.btnText + ";" +
      "}\n" +
      ".wg-LauncherWrap {" +
      "  position: fixed; right: 1.35rem; bottom: 1.35rem; z-index: 9990;" +
      "  display: flex; align-items: center; gap: 0.65rem; font-family: Inter, system-ui, -apple-system, sans-serif;" +
      "}\n" +
      ".wg-HintPill {" +
      "  display: inline-flex; align-items: center; gap: 0.45rem;" +
      "  background: rgba(15, 23, 42, 0.94); color: #f8fafc;" +
      "  border: 1px solid var(--wg-border-glow); border-radius: 9999px;" +
      "  padding: 0.48rem 0.9rem; font-size: 0.78rem; font-weight: 600;" +
      "  box-shadow: 0 14px 34px -8px rgba(0, 0, 0, 0.65), 0 0 20px -4px var(--wg-accent-soft);" +
      "  backdrop-filter: blur(12px); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" +
      "}\n" +
      ".wg-HintPill:hover { transform: translateY(-2px); border-color: var(--wg-primary); }\n" +
      ".wg-HintDot { width: 8px; height: 8px; border-radius: 9999px; background: var(--wg-primary); box-shadow: 0 0 10px var(--wg-primary); }\n" +
      ".wg-FabBtn {" +
      "  width: 60px; height: 60px; border-radius: 9999px; border: 2px solid rgba(255,255,255,0.22);" +
      "  background: var(--wg-btn-grad); color: var(--wg-btn-text);" +
      "  display: inline-flex; align-items: center; justify-content: center; position: relative;" +
      "  cursor: pointer; box-shadow: 0 18px 40px -8px rgba(0, 0, 0, 0.75), 0 0 28px -2px var(--wg-border-glow);" +
      "  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease;" +
      "}\n" +
      ".wg-FabBtn:hover { transform: scale(1.06) translateY(-2px); }\n" +
      ".wg-FabBtn:focus-visible { outline: 3px solid #ffffff; outline-offset: 3px; }\n" +
      ".wg-FabOnline {" +
      "  position: absolute; top: 2px; right: 2px; width: 13px; height: 13px;" +
      "  border-radius: 9999px; background: #22c55e; border: 2px solid #020617;" +
      "}\n" +
      /* Top-layer non-modal dialog & tour popover base + discrete transitions */
      "#wintrip-guide-dialog, #wintrip-tour-step {" +
      "  opacity: 0; transform: translateY(12px) scale(0.96);" +
      "  transition-property: opacity, transform, display, overlay;" +
      "  transition-duration: 0.26s;" +
      "  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);" +
      "  transition-behavior: allow-discrete;" +
      "  font-family: Inter, system-ui, -apple-system, sans-serif;" +
      "}\n" +
      "#wintrip-guide-dialog {" +
      "  position: fixed; inset: auto 1.35rem 5.6rem auto; margin: 0; padding: 0;" +
      "  width: min(400px, calc(100vw - 1.75rem)); max-height: min(630px, calc(100vh - 7.2rem));" +
      "  border-radius: 1.35rem; border: 1px solid var(--wg-border-glow);" +
      "  background: rgba(9, 14, 28, 0.97); color: #f1f5f9;" +
      "  box-shadow: 0 28px 70px -12px rgba(0, 0, 0, 0.85), 0 0 36px -8px var(--wg-accent-soft);" +
      "  backdrop-filter: blur(18px); overflow: hidden; z-index: 9995;" +
      "}\n" +
      "#wintrip-guide-dialog:is([open], :popover-open, .\\:popover-open, .wintrip-legacy-open):where(:not([data-closing])) {" +
      "  display: flex; flex-direction: column; opacity: 1; transform: translateY(0) scale(1);" +
      "  @starting-style { opacity: 0; transform: translateY(12px) scale(0.96); }" +
      "}\n" +
      /* Tour target spotlight & CSS Anchor Positioning */
      ".wg-TourActiveTarget {" +
      "  anchor-name: --wintrip-tour-target;" +
      "  outline: 2px solid var(--wg-primary) !important;" +
      "  outline-offset: 6px !important;" +
      "  box-shadow: 0 0 0 6px var(--wg-accent-soft), 0 0 32px -4px var(--wg-border-glow) !important;" +
      "  border-radius: 1rem;" +
      "  transition: outline 0.25s ease, box-shadow 0.25s ease;" +
      "}\n" +
      "#wintrip-tour-step {" +
      "  position: fixed; position-anchor: --wintrip-tour-target;" +
      "  inset: auto; margin: 0; padding: 1.1rem 1.2rem;" +
      "  width: min(350px, calc(100vw - 2rem));" +
      "  border-radius: 1.1rem; border: 1px solid var(--wg-primary);" +
      "  background: rgba(9, 14, 28, 0.98); color: #f8fafc;" +
      "  box-shadow: 0 24px 60px -10px rgba(0,0,0,0.85), 0 0 28px -4px var(--wg-border-glow);" +
      "  z-index: 9998;" +
      "}\n" +
      "#wintrip-tour-step:is(:popover-open, .\\:popover-open, .wintrip-legacy-open):where(:not([data-closing])) {" +
      "  display: block; opacity: 1; transform: translateY(0) scale(1);" +
      "  @starting-style { opacity: 0; transform: translateY(8px) scale(0.96); }" +
      "}\n" +
      "@supports not (anchor-name: --foo) {" +
      "  #wintrip-tour-step {" +
      "    position: fixed; left: 1.25rem; bottom: 1.35rem; right: auto; top: auto;" +
      "  }" +
      "}\n" +
      "@media (prefers-reduced-motion: reduce) {" +
      "  #wintrip-guide-dialog, #wintrip-tour-step {" +
      "    transform: none !important; transition-duration: 0.1s !important;" +
      "  }" +
      "}\n" +
      ".wg-Header {" +
      "  padding: 0.95rem 1.1rem; background: linear-gradient(180deg, rgba(30,41,59,0.75) 0%, rgba(15,23,42,0.4) 100%);" +
      "  border-bottom: 1px solid rgba(148,163,184,0.16); display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;" +
      "}\n" +
      ".wg-Avatar {" +
      "  width: 38px; height: 38px; border-radius: 0.85rem; background: var(--wg-btn-grad); color: var(--wg-btn-text);" +
      "  display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0;" +
      "}\n" +
      ".wg-CloseBtn {" +
      "  background: rgba(30,41,59,0.7); border: 1px solid rgba(148,163,184,0.22); color: #cbd5e1;" +
      "  width: 32px; height: 32px; border-radius: 0.65rem; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;" +
      "}\n" +
      ".wg-CloseBtn:hover { color: #ffffff; border-color: var(--wg-primary); }\n" +
      ".wg-TourBanner {" +
      "  padding: 0.6rem 1.1rem; background: var(--wg-accent-soft); border-bottom: 1px solid rgba(148,163,184,0.14);" +
      "  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.76rem;" +
      "}\n" +
      ".wg-TourStartBtn {" +
      "  background: var(--wg-btn-grad); color: var(--wg-btn-text); border: none; border-radius: 0.6rem;" +
      "  padding: 0.36rem 0.72rem; font-size: 0.73rem; font-weight: 700; cursor: pointer; white-space: nowrap;" +
      "}\n" +
      ".wg-Messages {" +
      "  padding: 1rem; overflow-y: auto; flex: 1 1 auto; display: flex; flex-direction: column; gap: 0.75rem;" +
      "  max-height: 335px; overscroll-behavior: contain;" +
      "}\n" +
      ".wg-Msg {" +
      "  padding: 0.75rem 0.9rem; border-radius: 1rem; font-size: 0.82rem; line-height: 1.5; max-width: 92%; word-break: break-word;" +
      "}\n" +
      ".wg-MsgBot {" +
      "  background: rgba(30, 41, 59, 0.78); border: 1px solid rgba(148, 163, 184, 0.18); color: #f1f5f9; align-self: flex-start; border-bottom-left-radius: 0.3rem;" +
      "}\n" +
      ".wg-MsgUser {" +
      "  background: var(--wg-btn-grad); color: var(--wg-btn-text); font-weight: 600; align-self: flex-end; border-bottom-right-radius: 0.3rem;" +
      "}\n" +
      ".wg-Chips {" +
      "  padding: 0 1rem 0.65rem 1rem; display: flex; flex-wrap: wrap; gap: 0.4rem;" +
      "}\n" +
      ".wg-Chip {" +
      "  background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(148, 163, 184, 0.25); color: #e2e8f0;" +
      "  border-radius: 9999px; padding: 0.32rem 0.7rem; font-size: 0.72rem; cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease;" +
      "}\n" +
      ".wg-Chip:hover { border-color: var(--wg-primary); background: var(--wg-accent-soft); color: #ffffff; }\n" +
      ".wg-Form {" +
      "  padding: 0.75rem 0.95rem; border-top: 1px solid rgba(148, 163, 184, 0.16); background: rgba(2, 6, 23, 0.85);" +
      "  display: flex; align-items: center; gap: 0.5rem;" +
      "}\n" +
      ".wg-Input {" +
      "  flex: 1 1 auto; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(148, 163, 184, 0.28);" +
      "  border-radius: 0.75rem; padding: 0.58rem 0.8rem; color: #ffffff; font-size: 0.82rem; outline: none;" +
      "}\n" +
      ".wg-Input:focus { border-color: var(--wg-primary); }\n" +
      ".wg-SendBtn {" +
      "  background: var(--wg-btn-grad); color: var(--wg-btn-text); border: none; border-radius: 0.75rem;" +
      "  padding: 0.58rem 0.9rem; font-size: 0.8rem; font-weight: 700; cursor: pointer;" +
      "}\n" +
      ".wg-FooterNote {" +
      "  padding: 0.35rem 0.95rem 0.55rem; font-size: 0.66rem; color: #64748b; text-align: center; background: rgba(2, 6, 23, 0.92);" +
      "}\n" +
      ".wg-code { background: rgba(15,23,42,0.9); padding: 0.1rem 0.35rem; border-radius: 0.3rem; font-family: monospace; }";
    document.head.appendChild(style);

    // 1. Launcher (rechtsonder)
    var launcherWrap = document.createElement("div");
    launcherWrap.className = "wg-LauncherWrap";
    launcherWrap.innerHTML =
      '<button type="button" class="wg-HintPill" id="wg-hint-pill" aria-label="Open Wintrip Assistent of start rondleiding">' +
      '  <span class="wg-HintDot"></span>' +
      '  <span>Vraag of rondleiding?</span>' +
      "</button>" +
      '<button type="button" class="wg-FabBtn" id="wg-fab-btn" aria-label="Open Wintrip Chat & Rondleiding" aria-haspopup="dialog">' +
      '  <span class="wg-FabOnline" aria-hidden="true"></span>' +
      '  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>' +
      "  </svg>" +
      "</button>";
    document.body.appendChild(launcherWrap);

    // 2. Non-modal Chat Dialog Popover (<dialog popover="manual">)
    var chatDialog = document.createElement("dialog");
    chatDialog.id = "wintrip-guide-dialog";
    chatDialog.setAttribute("popover", "manual");
    chatDialog.setAttribute("aria-labelledby", "wintrip-guide-title");
    chatDialog.innerHTML =
      '<div class="wg-Header">' +
      '  <div style="display:flex;align-items:center;gap:0.65rem;min-width:0;">' +
      '    <span class="wg-Avatar">PW</span>' +
      '    <div style="min-width:0;">' +
      '      <h2 id="wintrip-guide-title" style="margin:0;font-size:0.9rem;font-weight:800;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.name + "</h2>" +
      '      <div style="font-size:0.7rem;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.subtitle + "</div>" +
      "    </div>" +
      "  </div>" +
      '  <button type="button" class="wg-CloseBtn" id="wg-close-btn" popovertarget="wintrip-guide-dialog" popovertargetaction="hide" aria-label="Sluit chatvenster">✕</button>' +
      "</div>" +
      '<div class="wg-TourBanner">' +
      '  <span style="color:#e2e8f0;font-weight:500;">🧭 Wegwijs worden op deze pagina?</span>' +
      '  <button type="button" class="wg-TourStartBtn" id="wg-start-tour-btn">Start rondleiding →</button>' +
      "</div>" +
      '<div class="wg-Messages" id="wg-messages" role="log" aria-live="polite"></div>' +
      '<div class="wg-Chips" id="wg-chips"></div>' +
      '<form class="wg-Form" id="wg-form">' +
      '  <input type="text" class="wg-Input" id="wg-input" placeholder="Stel je vraag over pakketten, prijzen of aanmelden..." aria-label="Stel je vraag" autocomplete="off" />' +
      '  <button type="submit" class="wg-SendBtn" id="wg-send-btn">Stuur</button>' +
      "</form>" +
      '<div class="wg-FooterNote">AI-assistent (MiniMax) · Prijzen excl. 21% btw · <a href="mailto:info@wintrip.nl" style="color:#94a3b8;text-decoration:underline;">info@wintrip.nl</a></div>';
    document.body.appendChild(chatDialog);

    // 3. Persistent App Tour Popover (<div id="wintrip-tour-step" popover="manual" role="dialog" aria-labelledby="wintrip-tour-title">)
    var tourPopover = document.createElement("div");
    tourPopover.id = "wintrip-tour-step";
    tourPopover.setAttribute("popover", "manual");
    tourPopover.setAttribute("role", "dialog");
    tourPopover.setAttribute("aria-labelledby", "wintrip-tour-title");
    tourPopover.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.4rem;">' +
      '  <span id="wintrip-tour-counter" style="font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:var(--wg-primary);">Rondleiding</span>' +
      '  <button type="button" id="wg-tour-hide-btn" popovertarget="wintrip-tour-step" popovertargetaction="hide" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:0.85rem;" aria-label="Sluit rondleiding">✕</button>' +
      "</div>" +
      '<h2 id="wintrip-tour-title" style="margin:0 0 0.4rem 0;font-size:0.95rem;font-weight:800;color:#ffffff;">Stap 1</h2>' +
      '<p id="wintrip-tour-body" style="margin:0 0 0.9rem 0;font-size:0.8rem;line-height:1.5;color:#cbd5e1;"></p>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">' +
      '  <button type="button" id="wg-tour-prev-btn" style="background:rgba(30,41,59,0.85);border:1px solid rgba(148,163,184,0.28);color:#e2e8f0;border-radius:0.6rem;padding:0.4rem 0.75rem;font-size:0.75rem;font-weight:600;cursor:pointer;">← Vorige</button>' +
      '  <button type="button" id="wg-tour-next-btn" style="background:var(--wg-btn-grad);color:var(--wg-btn-text);border:none;border-radius:0.6rem;padding:0.42rem 0.9rem;font-size:0.76rem;font-weight:800;cursor:pointer;">Volgende →</button>' +
      "</div>";
    document.body.appendChild(tourPopover);

    var messagesEl = document.getElementById("wg-messages");
    var chipsEl = document.getElementById("wg-chips");
    var formEl = document.getElementById("wg-form");
    var inputEl = document.getElementById("wg-input");

    function appendMessage(role, text) {
      var bubble = document.createElement("div");
      bubble.className = "wg-Msg " + (role === "user" ? "wg-MsgUser" : "wg-MsgBot");
      if (role === "user") {
        bubble.textContent = text;
      } else {
        bubble.innerHTML = formatMarkdownReply(text);
      }
      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function renderChips(chips) {
      chipsEl.innerHTML = "";
      (chips || []).forEach(function (label) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "wg-Chip";
        btn.textContent = label;
        btn.addEventListener("click", function () {
          if (label.toLowerCase().indexOf("rondleiding") !== -1) {
            startTour(0);
          } else {
            sendMessage(label);
          }
        });
        chipsEl.appendChild(btn);
      });
    }

    // Welkomstbericht per site
    var welcomeMessages = {
      mkb_uptime: "Hoi! 👋 Ik ben je **MKB Uptime & FormulierWacht** assistent. Ik ken de pakketten (**€ 3**, **€ 5** en **€ 7/mnd**) en help je graag bij het kiezen of invullen. Zal ik je kort rondleiden?",
      contentboost: "Hoi! 👋 Welkom bij **ContentBoost Studio**. Ik leg je graag uit hoe je van 1 URL, RSS-feed of notitie automatisch een nieuwsbrief en 3 LinkedIn-posts maakt, of leid je stap voor stap rond!",
      web_spiritueel: "Welkom! ✨ Ik help je graag bij het verkennen van de **websitepakketten** (*Essentieel* € 495, *Helder* € 895, *Uitgelicht* € 1.595 en *Maatwerk*), het onderhoud of het invullen van het aanvraagformulier.",
      landingspagina: "Welkom bij **Philip Wintrip Web & SaaS Studio**! 👋 Ik ken al onze oplossingen (**MKB Uptime**, **ContentBoost Studio** en **Spirituele Websites**). Stel gerust je vraag of start een korte rondleiding!"
    };
    var initialChips = {
      mkb_uptime: ["🧭 Start rondleiding", "Verschil €3, €5 en €7?", "Hoe werkt de formulier-check?", "Hoe werkt betalen via Tikkie?"],
      contentboost: ["🧭 Start rondleiding", "Wat krijg ik per bron?", "Verschil Solo, Pro & Agency?", "Hoe werkt mijn eigen Tone-of-Voice?"],
      web_spiritueel: ["🧭 Start rondleiding", "Welk pakket past bij mij?", "Hoe werkt de 50/50 betaling?", "Wat houdt onderhoud in?"],
      landingspagina: ["🧭 Start rondleiding", "MKB Uptime (€3-€7/mnd)", "ContentBoost (€15-€29/mnd)", "Spirituele Websites (v.a. €495)"]
    };

    appendMessage("assistant", welcomeMessages[ctx.siteId] || welcomeMessages.landingspagina);
    renderChips(initialChips[ctx.siteId] || initialChips.landingspagina);

    // Rondleiding-logica
    function clearTourHighlight() {
      if (activeAnchorEl) {
        activeAnchorEl.classList.remove("wg-TourActiveTarget");
        activeAnchorEl = null;
      }
    }

    function positionTourCardFallback(targetEl) {
      if (!targetEl) return;
      var rect = targetEl.getBoundingClientRect();
      var cardWidth = Math.min(350, window.innerWidth - 32);
      var left = Math.max(16, Math.min(rect.left, window.innerWidth - cardWidth - 16));
      var top = rect.bottom + 14;
      if (top + 210 > window.innerHeight) {
        top = Math.max(16, rect.top - 205);
      }
      tourPopover.style.left = left + "px";
      tourPopover.style.top = top + "px";
      tourPopover.style.bottom = "auto";
    }

    function showTourStep(index) {
      if (!tourSteps.length) return;
      if (index < 0 || index >= tourSteps.length) {
        stopTour();
        return;
      }
      currentTourIndex = index;
      var step = tourSteps[index];
      if (typeof step.beforeShow === "function") {
        try { step.beforeShow(); } catch (e) {}
      }
      clearTourHighlight();

      var targetEl = document.querySelector(step.selector) || document.querySelector("main") || document.body;
      activeAnchorEl = targetEl;
      targetEl.classList.add("wg-TourActiveTarget");

      try {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (e) {}

      document.getElementById("wintrip-tour-counter").textContent =
        "Rondleiding · Stap " + (index + 1) + " van " + tourSteps.length;
      document.getElementById("wintrip-tour-title").textContent = step.title;
      document.getElementById("wintrip-tour-body").textContent = step.body;

      var prevBtn = document.getElementById("wg-tour-prev-btn");
      var nextBtn = document.getElementById("wg-tour-next-btn");
      prevBtn.style.visibility = index === 0 ? "hidden" : "visible";
      nextBtn.textContent = index === tourSteps.length - 1 ? "Klaar ✓" : "Volgende →";

      openTopLayer(tourPopover);
      setTimeout(function () {
        positionTourCardFallback(targetEl);
        // MANDATORY: Programmatically route focus into the non-modal popover
        nextBtn.focus();
      }, 120);
    }

    function startTour(startIndex) {
      showTourStep(typeof startIndex === "number" ? startIndex : 0);
    }

    function stopTour() {
      clearTourHighlight();
      currentTourIndex = -1;
      closeTopLayer(tourPopover);
    }

    document.getElementById("wg-start-tour-btn").addEventListener("click", function () {
      startTour(0);
    });
    document.getElementById("wg-tour-prev-btn").addEventListener("click", function () {
      showTourStep(currentTourIndex - 1);
    });
    document.getElementById("wg-tour-next-btn").addEventListener("click", function () {
      if (currentTourIndex >= tourSteps.length - 1) {
        stopTour();
      } else {
        showTourStep(currentTourIndex + 1);
      }
    });
    document.getElementById("wg-tour-hide-btn").addEventListener("click", function (e) {
      e.preventDefault();
      stopTour();
    });

    // Open/sluit chatpaneel
    function toggleChatDialog(forceOpen) {
      var openNow = isTopLayerOpen(chatDialog);
      var shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !openNow;
      var hintPill = document.getElementById("wg-hint-pill");
      if (shouldOpen) {
        if (hintPill) hintPill.style.display = "none";
        openTopLayer(chatDialog);
        setTimeout(function () {
          inputEl.focus();
        }, 60);
      } else {
        closeTopLayer(chatDialog);
      }
    }

    document.getElementById("wg-fab-btn").addEventListener("click", function () {
      toggleChatDialog();
    });
    document.getElementById("wg-hint-pill").addEventListener("click", function () {
      toggleChatDialog(true);
    });
    document.getElementById("wg-close-btn").addEventListener("click", function (e) {
      e.preventDefault();
      toggleChatDialog(false);
    });

    // Verstuur bericht naar MiniMax backend (met lokale kennis-fallback als offline)
    async function sendMessage(text) {
      var clean = String(text || "").trim();
      if (!clean) return;
      inputEl.value = "";
      appendMessage("user", clean);
      chatHistory.push({ role: "user", content: clean });

      var loadingBubble = document.createElement("div");
      loadingBubble.className = "wg-Msg wg-MsgBot";
      loadingBubble.textContent = "Even kijken...";
      messagesEl.appendChild(loadingBubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      var payload = {
        message: clean,
        site_id: ctx.siteId,
        page_path: ctx.pagePath,
        page_title: ctx.pageTitle,
        history: chatHistory.slice(-6)
      };

      var data = null;
      for (var i = 0; i < ctx.apiEndpoints.length; i++) {
        try {
          var resp = await fetch(ctx.apiEndpoints[i], {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(payload)
          });
          if (resp.ok) {
            data = await resp.json();
            break;
          }
        } catch (err) {}
      }

      loadingBubble.remove();

      if (!data || !data.reply) {
        data = {
          reply:
            "Ik help je graag! Onze diensten zijn:\n" +
            "• **MKB Uptime & FormulierWacht:** € 3 / € 5 / € 7 p/m excl. btw\n" +
            "• **ContentBoost Studio:** € 15 / € 22 / € 29 p/m excl. btw\n" +
            "• **Websites voor het Spiritueel Vlak:** Essentieel (€ 495), Helder (€ 895), Uitgelicht (€ 1.595) of Maatwerk (v.a. € 2.395) excl. btw.\n\n" +
            "Klik hierboven op **Start rondleiding →** om de pagina stap voor stap te bekijken!",
          start_tour: clean.toLowerCase().indexOf("rondleiding") !== -1,
          quick_replies: initialChips[ctx.siteId] || initialChips.landingspagina
        };
      }

      appendMessage("assistant", data.reply);
      chatHistory.push({ role: "assistant", content: data.reply });
      if (Array.isArray(data.quick_replies) && data.quick_replies.length) {
        renderChips(data.quick_replies);
      }
      if (data.start_tour) {
        startTour(0);
      } else if (data.highlight_selector) {
        var el = document.querySelector(data.highlight_selector);
        if (el) {
          clearTourHighlight();
          activeAnchorEl = el;
          el.classList.add("wg-TourActiveTarget");
          try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
          setTimeout(clearTourHighlight, 5000);
        }
      }
    }

    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage(inputEl.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
