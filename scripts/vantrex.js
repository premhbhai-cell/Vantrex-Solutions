(function ($) {
  $(function () {
    // sticky header (desktop >=1440, mobile below)
    var $d = $('.main-header'), $m = $('.mob-header');
    function stick() {
      var y = $(window).scrollTop(), w = $(window).width();
      if (w >= 1440) { $d.toggleClass('sticky', y > 90); $m.removeClass('sticky'); }
      else { $m.toggleClass('sticky', y > 90); $d.removeClass('sticky'); }
    }
    $(window).on('scroll resize', stick); stick();

    // close mobile menu when a link is tapped
    $('.mob-header .nav-link a, .mob-header .nav-cta').on('click', function () {
      $('body').removeClass('menu-open');
    });
    // keep body class in sync with bootstrap collapse state
    var col = document.getElementById('navbarSupportedContent');
    if (col) {
      col.addEventListener('hidden.bs.collapse', function () { $('body').removeClass('menu-open'); });
      col.addEventListener('shown.bs.collapse', function () { $('body').addClass('menu-open'); });
    }
    $('.navbar-toggler-icon').off('click');

    // region dropdowns (tap on touch devices)
    $('.region-count').on('click', function (e) {
      e.stopPropagation();
      $('.region-count').not(this).removeClass('active');
      $(this).toggleClass('active');
    });
    $(document).on('click', function () { $('.region-count').removeClass('active'); });

    // contact form -> WhatsApp / email
    var form = document.getElementById('quoteForm');
    if (form) {
      var qp = new URLSearchParams(location.search).get('product');
      var sel = document.getElementById('productSelect');
      if (qp && sel) {
        var found = false;
        for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].text.trim() === qp) { sel.selectedIndex = i; found = true; break; } }
        if (!found) sel.value = 'Other';
      }
      var note = document.getElementById('formNote');
      function build() {
        var f = form.elements;
        if (!f.name.value.trim() || !f.phone.value.trim()) { note.textContent = 'Please enter your name and phone number.'; return null; }
        note.textContent = '';
        return 'Hello Vantrex Solutions, I would like a quote.\n' +
          'Name: ' + f.name.value.trim() + '\n' +
          'Phone: ' + f.phone.value.trim() + '\n' +
          (f.email.value.trim() ? 'Email: ' + f.email.value.trim() + '\n' : '') +
          (f.product.value ? 'Product: ' + f.product.value + '\n' : '') +
          (f.message.value.trim() ? 'Requirement: ' + f.message.value.trim() : '');
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault(); var t = build(); if (!t) return;
        window.open('https://wa.me/919217450628?text=' + encodeURIComponent(t), '_blank');
      });
      document.getElementById('emailBtn').addEventListener('click', function () {
        var t = build(); if (!t) return;
        location.href = 'mailto:vantrexsolutions0@gmail.com?subject=' + encodeURIComponent('Quote Request – ' + (form.elements.product.value || 'Construction Materials')) + '&body=' + encodeURIComponent(t);
      });
    }
  });
})(jQuery);
