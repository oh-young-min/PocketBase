import PocketBase from 'https://cdnjs.cloudflare.com/ajax/libs/pocketbase/0.26.2/pocketbase.es.mjs';

const pb = new PocketBase('http://127.0.0.1:8090');

async function signinUser(email, emailVisibility, verified, password, checkPassword, name, image) {
    try {
        const data = new FormData();

        data.append("email", email);
        data.append("emailVisibility", emailVisibility)
        data.append("verified", verified)
        data.append("password", password)
        data.append("passwordConfirm", checkPassword)
        data.append("name", name)
        if (image) data.append("avatar", image);

        const record = await pb.collection('users').create(data);

        console.log("회원가입 성공");
        alert("회원가입이 완료되었습니다.");

        window.location.href = 'index.html';
    } catch (error){
        console.error("회원가입 실패", error.message);
        alert("회원가입에 실패했습니다.");
    }
}

async function setAccount() {
    if (!pb.authStore.isValid) return;

    $(".account").show();
    $("#email").prop("disabled", true);
    $("#password, #checkPassword").prop("required", false);
    $(".signup").hide(); 

    try {
        const record = await pb.collection('users').getOne(pb.authStore.model.id, {});

        $("#email").val(record.email);
        $("#emailVisibility").prop('checked', record.emailVisibility);
        $("#verified").prop('checked', record.verified);
        $("#name").val(record.name);
    } catch (error){
        console.error("게정 불러오기 실패", error.message);
        alert("계정 정보를 불러오는 데 실패했습니다.");
        window.location.href = 'board.html';
    }
}

async function updateAccount(emailVisibility, verified, oldPass, password, checkPass, name, image) {
    try {
        const data = new FormData();

        data.append("emailVisibility", emailVisibility);
        data.append("verified", verified);
        data.append("name", name);

        if (password){
            data.append("oldPassword", oldPass);
            data.append("password", password);
            data.append("passwordConfirm", checkPass);
        }

        if (image) data.append("avatar", image);

        const record = await pb.collection('users').update(pb.authStore.model.id, data);

        console.log("계정 수정 성공");
        window.location.href = 'board.html';
    } catch (error){
        console.error("계정 수정 실패 ", error.message);
        alert("계정 정보를 수정하는 데 실패했습니다.");
    }
}

$(document).ready(function(){
    setAccount();

    $("#password").on("input", function(){
        if($(".account").is(':visible')){
            if($(this).val().trim() === ''){
                $(this).prop("required", false);
                $("#checkPassword").prop("required", false);
                $("#oldPassword").prop("required", false);
            } else {
                $(this).prop("required", true);
                $("#checkPassword").prop("required", true);
                $("#oldPassword").prop("required", true);
            }
        }
    })

    $("#password, #checkPassword").on("input", function(){
        if($("#checkPassword").val() === ''){
            $("#status").text('');
        } else if ($("#password").val() === $("#checkPassword").val()) {
            $("#status").text("비밀번호가 일치합니다.").css('color', '#4DAF50');
        } else {
            $("#status").text("비밀번호가 일치하지 않습니다.").css('color', '#d32f2f');
        }
    });

    $("#accountForm").on("submit", function(e){
        e.preventDefault();

        const clickedButton = $(document.activeElement).attr('id');

        if ($("#password").val() !== $("#checkPassword").val() && $("#checkPassword").val().trim() != '') {
            alert("비밀번호가 일치하지 않습니다.");
            $("#checkPassword").focus();
            return;
        }
        
        if (clickedButton === 'signin'){
            signinUser($("#email").val(), $("#emailVisibility").prop("checked"), $("#verified").prop("checked"), $("#password").val(), $("#checkPassword").val(), $("#name").val(), $("#image").prop("files")[0]);
        } else if (clickedButton === 'updateAccount'){
            updateAccount($("#emailVisibility").prop("checked"), $("#verified").prop("checked"), $("#oldPassword").val(), $("#password").val(), $("#checkPassword").val(), $("#name").val(), $("#image").prop("files")[0]);
        }
    });

    $("#delete").on("click", async function () {
        try {
            await pb.collection('users').delete(pb.authStore.model.id)
            pb.authStore.clear();

            console.log("계정 삭제 성공");
            alert("계정을 삭제했습니다.");
            window.location.href = 'index.html';
        } catch (error){
            console.error("계정 삭제 실패 ", error.message);
            alert("계정을 삭제하는데 실패했습니다.");
        }
    });

    $(".back-link").on("click", function(){history.back();});
});