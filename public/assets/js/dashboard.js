$(async function() {
    var currentUser = localStorage.getItem('userData');
    if (currentUser) {
        var currentUser = parseUserData(parseUserData(currentUser));
        console.log('Already Sign-in', currentUser);
        sayHello(currentUser.name);
    } else {
        console.log('Login First');
        location.href = '/';
    };
})

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
    $('.greeting .currentGreet').html(greet);
    $('.greeting .currentName').html(name +'!');
}

function parseUserData(data) {
    var dataUser = JSON.parse(data);
    return dataUser;
}

function logout(){
    location.href = '/';
    localStorage.clear();
}
