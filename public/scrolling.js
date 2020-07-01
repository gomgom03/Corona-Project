
$("#aboutButton").click(() => {
    $('html, body').animate({
        scrollTop: $("#about").offset().top
    }, 1000);
});