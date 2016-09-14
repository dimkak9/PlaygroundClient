function Init() {
    document.getElementById("test").innerHTML = window.location.href;

}

function myFunction() {
    document.getElementById("test").innerHTML = "click";

    try {
        facebookConnectPlugin.login(["public_profile"],
        fbLoginSuccess,
        function (error) { showAlert("" + error); }
    );
    } catch (e) {
        document.getElementById("test").innerHTML = e;
    }
    
}

var fbLoginSuccess = function (userData) {
    showAlert("UserInfo: " + JSON.stringify(userData));
}


function showAlert(msg) {
    document.getElementById("test").innerHTML = msg;
}