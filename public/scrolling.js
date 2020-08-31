function scrollable(hash) {
    $('html, body').animate({
        scrollTop: $(hash).offset().top
    }, 100, function () {
        window.location.hash = hash;
    });
}
