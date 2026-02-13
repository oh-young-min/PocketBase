import PocketBase from 'https://cdnjs.cloudflare.com/ajax/libs/pocketbase/0.26.2/pocketbase.es.mjs';

const pb = new PocketBase('http://127.0.0.1:8090');

async function loginUser(email, password) {
    try {
        const authData = await pb.collection('users').authWithPassword(email, password,);

        console.log("로그인 성공");
        
        window.location.href = 'board.html';
    } catch (error){
        console.error("로그인 실패", error.message);
        alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        throw new Error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
}

$(document).ready(function(){
    $("#login").on("click", function(){
        loginUser($("#email").val(), $("#password").val());
    });
});
