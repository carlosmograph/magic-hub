/* /contato: liga os botões ao WhatsApp e ao Instagram de config.js (CRMO_SITE.whatsapp e
   .instagram). Sem o número ou o @, o botão fica desligado com "em breve". */
(function () {
  "use strict";
  var C = window.CRMO_SITE || {};
  var numero = String(C.whatsapp || "").replace(/\D/g, "");
  var arroba = String(C.instagram || "").replace(/^@/, "").trim();
  var links = {
    whatsapp: numero ? "https://wa.me/" + numero + "?text=" + encodeURIComponent("Oi, Carlos! Vim pelo site do Magic Hub.") : "",
    instagram: arroba ? "https://instagram.com/" + encodeURIComponent(arroba) : ""
  };
  document.querySelectorAll("[data-canal]").forEach(function (a) {
    var url = links[a.dataset.canal];
    var rotulo = a.querySelector("span");
    if (url) {
      a.href = url;
      if (a.dataset.canal === "instagram" && a.parentNode.querySelector(".canal-id")) { a.parentNode.querySelector(".canal-id").textContent = "@" + arroba; }
      return;
    }
    a.removeAttribute("href");
    a.setAttribute("aria-disabled", "true");
    a.classList.add("desligado");
    if (rotulo) { rotulo.textContent = "Em breve"; }
  });
}());
