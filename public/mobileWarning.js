$('#popupModal').modal({ show: false })

function popupMessage(title, message) {
    $('#modalLabel').text(title)
    $('#popupBody').text(message)
    $('#popupModal').modal('show');
}

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    sessionStorage.getItem('mwCheck') ? null : (sessionStorage.setItem('mwCheck', true), popupMessage('Device Compatibility', 'This website does not fully support mobile web browsers. Styling and some features may be off.'));
}
