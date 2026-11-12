// Onglets « Espace Patient / Espace Praticien » de la page de connexion.
// Le formulaire de connexion est le même pour les deux ; seul le message sous le bouton change.
document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('[data-ml-tab]');
  var patient = document.querySelector('[data-ml-patient]');
  var practitioner = document.querySelector('[data-ml-practitioner]');
  if (!tabs.length || !patient || !practitioner) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var isPro = tab.getAttribute('data-ml-tab') === 'practitioner';
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      patient.hidden = isPro;
      practitioner.hidden = !isPro;
    });
  });
});
