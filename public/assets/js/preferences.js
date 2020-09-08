async function preferences() {
    await getPage('preferences');
    $('.greeting p').hide();
    $('.greeting h3').html('Preferences');
    $('.greeting button').show().attr('onclick', `dashboard()`);

    const gp = new Grapick({
        el: '#gp',
        direction: '40deg'
      });

    // Handlers are color stops
    gp.addHandler(0, '#ffd86f');
    gp.addHandler(100, '#fc6262');
  
    // Do stuff on change of the gradient
    gp.on('change', complete => {
        if (complete === 1) {
            $('#background-color').val(gp.getSafeValue());
            console.log('color', $('#background-color').val());
        }
    })
}
