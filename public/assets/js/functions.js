function loadingActivated() {
    const loading = `<div id="loadingWrap">
        <div class="d-flex align-items-center justify-content-center contentLoadingWrap">
            <div class="lds-ripple"><div></div><div></div></div>
        </div>
    </div>`;
    $(loading).insertBefore('head');
    $('#loadingWrap').fadeIn('slow');
}

function loadingDeactivated() {
    $('#loadingWrap').fadeOut('slow', function () {
        $('#loadingWrap').remove();
    });
}

function loadingInline() {
    const loading = `<div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>`;
    $('.container-login').html(loading);
}
