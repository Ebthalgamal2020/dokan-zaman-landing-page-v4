/*
 * Dokan Zaman V4 — quotation form (PROTOTYPE).
 *
 * The form never sends or stores anything: it has method="dialog", no action, and submit is
 * always prevented. A valid form only shows an honest "not sent" message.
 *
 * To go live later: confirm the destination with the company (email service, CRM or form
 * plugin), set QUOTE.mode to 'live' and QUOTE.endpoint to that address, implement send(),
 * and remove the noindex meta. Never invent an endpoint.
 *
 * Preselection: any link with data-quote-category="<value>" or data-quote-service="<value>"
 * ticks the matching category checkbox / service radio and moves focus to it.
 */
(function () {
  'use strict';

  var QUOTE = { mode: 'prototype', endpoint: null /* confirmed destination — not provided yet */ };

  var form = document.getElementById('quote-form');
  if (!form) return;
  var status = document.getElementById('quote-status');
  var announce = document.getElementById('quote-selection');

  var MESSAGES = {
    required: 'هذا الحقل مطلوب.',
    contact: 'يُرجى إدخال رقم الهاتف أو البريد الإلكتروني.',
    email: 'يُرجى إدخال بريد إلكتروني صحيح.',
    phone: 'يُرجى إدخال رقم هاتف صحيح (أرقام فقط، ويمكن أن يبدأ بـ +).',
    review: 'يُرجى مراجعة الحقول المعلّمة.',
    selected: 'تم اختيار: ',
    // Honest, customer-facing: nothing was sent, and nothing claims otherwise.
    prototype: 'لم يُرسَل الطلب — استقبال الطلبات عبر هذه الصفحة غير متاح حاليًا، ولم تُحفظ بياناتك أو تُرسَل.'
  };
  var PHONE = /^\+?[0-9٠-٩\s\-()]{7,20}$/;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var field = function (name) { return form.elements[name]; };
  var setError = function (input, message) {
    var box = document.getElementById(input.id + '-error');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (box) { box.textContent = message; box.hidden = false; }
    } else {
      input.removeAttribute('aria-invalid');
      if (box) { box.textContent = ''; box.hidden = true; }
    }
  };

  var validate = function () {
    var invalid = [];
    var name = field('name');
    var company = field('company');
    var phone = field('phone');
    var email = field('email');

    [name, company].forEach(function (input) {
      var bad = !input.value.trim();
      setError(input, bad ? MESSAGES.required : '');
      if (bad) invalid.push(input);
    });

    var p = phone.value.trim();
    var m = email.value.trim();
    setError(phone, '');
    setError(email, '');
    if (!p && !m) {
      setError(phone, MESSAGES.contact);
      invalid.push(phone);
    } else {
      if (p && !PHONE.test(p)) { setError(phone, MESSAGES.phone); invalid.push(phone); }
      if (m && !EMAIL.test(m)) { setError(email, MESSAGES.email); invalid.push(email); }
    }
    return invalid;
  };

  var attempted = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    attempted = true;
    var invalid = validate();
    if (invalid.length) {
      status.textContent = MESSAGES.review;
      invalid[0].focus();
      return;
    }
    if (QUOTE.mode !== 'live' || !QUOTE.endpoint) {
      status.textContent = MESSAGES.prototype;
      return;
    }
  });
  form.addEventListener('input', function () {
    if (!attempted) return;
    if (!validate().length && status.textContent === MESSAGES.review) status.textContent = '';
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-quote-category], [data-quote-service]');
    if (!trigger) return;
    var input = trigger.hasAttribute('data-quote-category')
      ? form.querySelector('input[name="categories"][value="' + trigger.getAttribute('data-quote-category') + '"]')
      : form.querySelector('input[name="service"][value="' + trigger.getAttribute('data-quote-service') + '"]');
    if (!input) return;
    input.checked = true;
    if (announce) announce.textContent = MESSAGES.selected + input.nextElementSibling.textContent;
    if (status.textContent === MESSAGES.prototype) status.textContent = '';
    window.setTimeout(function () { input.focus({ preventScroll: true }); }, 0);
  });
})();
