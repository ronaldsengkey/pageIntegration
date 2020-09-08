$(async function() {
    var currentUser = parseUserData();
    if (currentUser) {
        console.log('Already Sign-in', currentUser);
        dashboard();
    } else {
        console.log('Login First');
        location.href = '/';
    };
})

function dashboard() {
    var currentUser = parseUserData();
    getPage('index');
    sayHello(currentUser.name);
}

function sayHello(name) {
    var myDate = new Date();
    var hrs = myDate.getHours();
    var greet;
    
    if (hrs < 12)
        greet = 'Good morning,';
    else if (hrs >= 12 && hrs <= 17)
        greet = 'Good afternoon,';
    else if (hrs >= 17 && hrs <= 24)
        greet = 'Good evening,';
    $('.greeting .currentGreet').html(greet).show();
    $('.greeting .currentName').html(name +'!');
    $('.greeting button').hide();
}

async function getPage(target) {
    loadingActivated();
    const targetDashboard = 'dashboard/'+ target;
    let content = await getContent(targetDashboard);
    $('#mainContent').html(content);
    loadingDeactivated();
}

function parseUserData() {
    var currentUser = localStorage.getItem('userData');
    var dataUser = JSON.parse(currentUser);
    var dataUser = JSON.parse(dataUser);
    return dataUser;
}

function logout(){
    location.href = '/';
    localStorage.clear();
}
