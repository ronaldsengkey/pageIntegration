$(async function() {
    var checkUser = localStorage.getItem('userData');
    if (checkUser) {
        window.location = 'dashboard';
        console.log('Already Sign-in', localStorage.getItem('userData'));
    } else {
        console.log('Login First');
        let content = await getContent('register');
        $('.container-login').html(content);
    };

    $(document).on('keypress', '#onKeyPress input', function(e) {
        switch(e.keyCode) {
            case 13:
                if ($(this).attr('id') == 'email' || $(this).attr('id') == 'password') {
                    $('button').click();
                }
            break;
        }
    });
    
    $(document).on('click', '#login', async function() {
        loadingActivated();
        var data = {
            'params': {
                'email': $('#email').val(),
                'password': $('#password').val()
            }
        };
        var result = await authAjax(data, 'login');
        console.log('result', result.responseCode);
        if (result.responseCode === '200') {
            successAuth(result.data);
        } else {
            console.log('Server error', result.responseCode);
        }
        loadingDeactivated();
    });
})

async function getPage(button) {
    loadingInline();
    const target = button === 'register' ? 'register' : !$(button).data('target') ? 'login' : $(button).data('target');
    console.log('target', target);
    let content = await getContent(target);

    if (target === 'login') {
        content = $('<div>').html(content);
        const targetApp = !$(button).data('app') ? 'Dashboard' : $(button).data('app');
        console.log('targetApp', targetApp);

        content.find('#loginTitle').html(targetApp);
    }

    $('.container-login').html(content);
}

function successAuth(callbackData) {
    callbackData.origin = 'browser';
    localStorage.setItem('userData', JSON.stringify(callbackData));
    window.location = 'dashboard';
}

async function getContent(url) {
    return new Promise (async function (resolve, reject) {
        $.ajax({
            url: url,
            crossDomain: true,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache"
            },
            success: function (callback) {
                if (callback.indexOf('clouds') > -1) {
                    reject(404);
                } else {
                    resolve(callback);
                }
            },
            error: function(error) {
                reject(error);
            }
        })
    })
}

async function authAjax(data, parameter) {
    return new Promise (async function (resolve, reject) {
        $.ajax({
            url: "/postData/" + parameter,
            crossDomain: true,
            method: "POST",
            processData : true,
            contentType: "application/json",
            dataType: "json",
            contentLength: data.length,
            tryCount : 0,
            retryLimit : 3,
            timeout: 60000,
            data: JSON.stringify(data),
            success: function (callback) {
                resolve(callback);
            },
            error: function (error) {
                reject(error);
            }
        })
    })
}