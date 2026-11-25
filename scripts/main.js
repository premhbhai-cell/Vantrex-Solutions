;(function ($) {
  $(document).ready(function () {
    $(".navbar-toggler-icon").click(function () {
      $("body").toggleClass("menu-open")
    })

    var whoWorkSlider = $(".our-products-slider")

    whoWorkSlider.owlCarousel({
      loop: true,
      margin: 30,
      nav: false,
      dots: false,
      smartSpeed: 700,
      autoplay: true,
      autoplayTimeout: 2000,
      autoplaySpeed: 2000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 2,
        },
        900: {
          items: 2,
        },
        1200: {
          items: 3,
        },
      },
    })
  })
})(jQuery)