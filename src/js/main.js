var x = 0;
var typed = new Typed('#typed', {

  strings: ["I am a UI DEVELOPER", "I am a JAVASCRIPT EXPLORER", "I am a Web Developer", "I am a SEO Enthusiast", "I am a Netizen", "I am a Upcoming Fullstack Developer", "I am a Learner...."],
  typeSpeed: 100,
  loop: true,
  loopCount: false,
  onStringTyped: function () {

    x++;
    if (x == 7) {
      x = 1;
    }

    if (x == 1) {
      $(".intro-container").addClass("intro-grad1").removeClass("intro-grad2 intro-grad3 intro-grad4 intro-grad5 intro-grad6 intro-grad7");

    }
    if (x == 2) {
      $(".intro-container").addClass("intro-grad2").removeClass("intro-grad1 intro-grad3 intro-grad4 intro-grad5 intro-grad6 intro-grad7");

    }
    if (x == 3) {
      $(".intro-container").addClass("intro-grad3").removeClass("intro-grad1 intro-grad2 intro-grad4 intro-grad5 intro-grad6 intro-grad7");

    }
    if (x == 4) {
      $(".intro-container").addClass("intro-grad4").removeClass("intro-grad3 intro-grad2 intro-grad1 intro-grad5 intro-grad6 intro-grad7");

    }
    if (x == 5) {
      $(".intro-container").addClass("intro-grad5").removeClass("intro-grad2 intro-grad3 intro-grad4 intro-grad1 intro-grad6 intro-grad7");

    }
    if (x == 6) {
      $(".intro-container").addClass("intro-grad6").removeClass("intro-grad2 intro-grad3 intro-grad4 intro-grad5 intro-grad1 intro-grad7");

    }
    if (x == 7) {
      $(".intro-container").addClass("intro-grad7").removeClass("intro-grad2 intro-grad3 intro-grad4 intro-grad5 intro-grad6 intro-grad1");

    }


  }
});

$('.link-scroll').click(function () {
  $(".main-menu").addClass('hide-menu').removeClass('show-menu');
  let scrollToName = "#" + this.id;
  $.scrollify.move(scrollToName);
});


$('.link-scroll-top').click(function () {
  $.scrollify.move("#home");
});

$.scrollify({
  section: ".main-section",
  sectionName: "section-name",
  interstitialSection: "",
  easing: "easeOutExpo",
  scrollSpeed: 1100,
  offset: 0,
  scrollbars: true,
  standardScrollElements: "",
  setHeights: true,
  overflowScroll: true,
  updateHash: true,
  touchScroll: true,
  before: function (index) {
    console.log(index);
    if(index==0){
      $(".scroll-to-top").fadeOut();

    }else{
      $(".scroll-to-top").fadeIn();
    }
    if ($.scrollify.current().hasClass("skill-class")) {

      $('.skillbar').each(function () {
        $(this).find('.skillbar-bar').animate({
          width: $(this).attr('data-percent')
        }, 6000);
      });

    }

    // scroll-to-top
  },
  after: function () { },
  afterResize: function () { },
  afterRender: function () { }
});
var scrolldown = function () {
  // $('html, body').animate({ scrollTop: 400 });
  $.scrollify.move("#about");
}


var scrollPos = $(window).scrollTop();
document.getElementsByClassName('click-me-button')[0].onclick = scrolldown;

var pageTitle = $("title").text();

// Change page title on blur
$(window).blur(function () {
  $("title").text("😭 I miss you ");
});

// Change page title back on focus
$(window).focus(function () {
  $("title").text(pageTitle);
});

$("#cross-me").click(function () {

  $(".main-menu").addClass('hide-menu').removeClass('show-menu');
});



$("#menu-bar").click(function () {

  $(".main-menu").addClass('show-menu').removeClass('hide-menu');
});

$.each(function () {
  var videoAspectRatio = $(this).data('height') / $(this).data('width');

  $(this).width(windowWidth);

  if (windowWidth < 1000) {
    videoHeight = windowHeight;
    videoWidth = videoHeight / videoAspectRatio;
    $(this).css({ 'margin-top': 0, 'margin-left': -(videoWidth - windowWidth) / 2 + 'px' });

    $(this).width(videoWidth).height(videoHeight);
  }

  $('.homepage-hero-module .video-container video').addClass('fadeIn animated');

});

