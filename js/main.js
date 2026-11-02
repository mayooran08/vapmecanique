const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Theme (initial value is set by the inline script in <head>) */
const themeBtn = $("#theme-toggle");
const applyTheme = (t) => {
  document.documentElement.dataset.theme = t;
  if (themeBtn) {
    themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
    themeBtn.setAttribute("aria-label", t === "dark" ? "Activer le thème clair" : "Activer le thème sombre");
  }
};
applyTheme(document.documentElement.dataset.theme || "light");
themeBtn?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch {}
});

/* Mobile menu */
const toggle = $(".menu-toggle");
const nav = $(".nav");
toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
$$(".nav a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  })
);

/* Header shadow + back-to-top */
const header = $(".site-header");
const toTop = $(".to-top");
const onScroll = () => {
  header?.classList.toggle("scrolled", scrollY > 8);
  toTop?.classList.toggle("show", scrollY > 600);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* Scroll reveal with stagger */
const targets = $$(".card, .badge, .panel, .section h2, .section .lead, .section .eyebrow, .split > *, .page-hero .container > *, form, .map");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !reduce) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el) => {
    el.classList.add("reveal");
    const idx = [...(el.parentElement?.children || [])].indexOf(el);
    el.style.setProperty("--d", `${Math.min(idx, 5) * 0.08}s`);
    io.observe(el);
  });
}

/* Animated counters */
$$("[data-count]").forEach((el) => {
  const end = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (reduce || !("IntersectionObserver" in window)) { el.textContent = end + suffix; return; }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  io.observe(el);
});

/* Booking form (Web3Forms; falls back to the visitor's email app until a key is set) */
const form = $("#booking-form");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $(".form-status", form);
  const btn = $("button[type=submit]", form);
  const data = new FormData(form);
  const show = (ok, msg) => {
    status.hidden = false;
    status.className = "form-status " + (ok ? "ok" : "err");
    status.textContent = msg;
  };

  if (data.get("access_key") === "YOUR_WEB3FORMS_ACCESS_KEY") {
    const d = Object.fromEntries(data);
    const body = `Nom : ${d.nom}\nTéléphone : ${d.telephone}\nCourriel : ${d.courriel}\nService : ${d.service}\nDate souhaitée : ${d.date || "—"}\nVéhicule : ${d.vehicule || "—"}\n\n${d.message || ""}`;
    location.href = `mailto:info@mecaniquevap.com?subject=${encodeURIComponent("Demande de rendez-vous – " + d.service)}&body=${encodeURIComponent(body)}`;
    show(true, "Votre application de courriel va s'ouvrir pour envoyer la demande.");
    return;
  }

  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = "Envoi en cours…";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });
    const json = await res.json();
    if (json.success) {
      form.reset();
      show(true, "Merci ! Votre demande a bien été envoyée. Nous vous répondrons rapidement.");
    } else {
      throw new Error(json.message);
    }
  } catch {
    show(false, "Une erreur est survenue. Veuillez nous appeler au (450) 736-3744.");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});
