// Salt Line CR tracking: first-touch UTM capture, quote-form hidden fields, and click events.
// Everything is wrapped in try/catch so tracking can never break a page.
(function () {
  var KEY = 'slcr_utm';
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }

  try {
    var params = new URLSearchParams(location.search);
    var stored = read();
    var changed = false;
    UTM.forEach(function (k) {
      if (params.get(k) && !stored[k]) { stored[k] = params.get(k); changed = true; }
    });
    if (!stored.landing_page) { stored.landing_page = location.pathname; changed = true; }
    if (changed) sessionStorage.setItem(KEY, JSON.stringify(stored));
  } catch (e) {}

  // Fill the quote form's hidden fields from the link that brought the visitor here.
  try {
    var form = document.querySelector('form[data-quote]');
    if (form) {
      var q = new URLSearchParams(location.search);
      var stored2 = read();
      var set = function (name, value) {
        var el = form.querySelector('[name="' + name + '"]');
        if (el && value) el.value = value;
      };
      set('source_page', q.get('from'));
      set('template', q.get('template'));
      set('entity', q.get('entity'));
      set('landing_page', stored2.landing_page);
      UTM.forEach(function (k) { set(k, stored2[k]); });
      set('referrer', document.referrer);
    }
  } catch (e) {}

  // Click events for affiliate links and quote links. Feeds dataLayer if one exists.
  try {
    document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest ? ev.target.closest('a[data-track]') : null;
      if (!a) return;
      var detail = {
        event: a.getAttribute('data-track') === 'affiliate' ? 'affiliate_click' : 'quote_click',
        template: a.getAttribute('data-template'),
        entity: a.getAttribute('data-entity'),
        page: location.pathname,
      };
      if (window.dataLayer && window.dataLayer.push) window.dataLayer.push(detail);
      document.dispatchEvent(new CustomEvent('slcr:track', { detail: detail }));
    });
  } catch (e) {}
})();
