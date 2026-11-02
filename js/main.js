const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  })
);

const form = document.querySelector("#booking-form");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const body = [
    `Nom : ${d.nom}`,
    `Téléphone : ${d.telephone}`,
    `Courriel : ${d.courriel}`,
    `Service : ${d.service}`,
    `Date souhaitée : ${d.date || "—"}`,
    `Véhicule : ${d.vehicule || "—"}`,
    "",
    d.message || "",
  ].join("\n");
  const url = `mailto:info@mecaniquevap.com?subject=${encodeURIComponent("Demande de rendez-vous – " + d.service)}&body=${encodeURIComponent(body)}`;
  const status = form.querySelector(".form-status");
  status.hidden = false;
  status.textContent = "Votre application de courriel va s'ouvrir pour envoyer la demande.";
  window.location.href = url;
});
