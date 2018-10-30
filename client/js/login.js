function postLogin(login) {
    $.ajax({
        method: 'POST',
        url: `${baseUrl}/login`,
        data: login,
    }).done(function() {
        console.log('okkkkkkkkkkk');
        // alertMessage('Okkkk');
    }).fail(function() {
        console.log('Erro');
        // alertMessage('Erro no login.');
    });
}

function saveFormLogin() {
    $('#form-login').submit(function(e) {
        e.preventDefault();
        let user = new Object();
        user.login = $("#login").val();
        user.gender = $("#password").val();
        postLogin(user);
        clearFormLogin();
    });
}

function verifyInputRequire() {
    if ($('#password').val() !== '' && $('#login').val() !== '') {
        $('#btn-salvar').removeClass("disabled");
    } else {
        $('#btn-salvar').addClass("disabled");
    }
}

function clearFormLogin() {
    let inputs = $('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}

$(document).ready(() => {
    // Limpa modal e adiciona method post
    $('#form-login').click(function() {
        clearFormLogin();
    });

    $('.require').on('keyup select change', function() {
        verifyInputRequire();
    });

    saveFormLogin();
});