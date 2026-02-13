import PocketBase from 'https://cdnjs.cloudflare.com/ajax/libs/pocketbase/0.26.2/pocketbase.es.mjs';

const pb = new PocketBase('http://127.0.0.1:8090');

const id = new URLSearchParams(location.search).get("id");

let quill;
const toolbarOptions = [
    [{'header': [1,2,3,4,5,6,false]}],
    [{'align': []}],
    ['bold', 'italic', 'underline', 'strike'],
    [{'color': []}, {'background': []}],
    [{'list': 'bullet'}, {'list': 'ordered'}],
    ['link', 'image', 'code-block']
];

async function postBoard(title, summary, user) {
    try {
        const data = {
            "title" : title,
            "summary" : summary,
            "user" : user
        };

        const record = await pb.collection('board').create(data);

        console.log("게시글 등록 성공");
        window.location.href = 'board.html';
    } catch (error) {
        console.error("게시글 등록 실패 ", error.message);
        alert("게시글 등록에 실패했습니다.");
    }
}

async function setPost(board) {
    if (!board) return;

    try {
        const record = await pb.collection('board').getOne(board, {});

        $("#title").val(record.title).prop("disabled", true);
        $("#summary").html(record.summary);
        quill.enable();
        $(".create").hide();

        if (record.user === pb.authStore.model.id) {
            $(".owner").show();
        } else {
            $(".visitor").show();
        }
        $(".detail").show();

        await checkAndUpdateLike(board);

        const initialCount = await getLikeCount(board);
        updateDetailPageLikeUI(initialCount);
        subscribeToPostLikes(board);

        fetchComments(board);
        subscribeToComments(board);

    } catch (error) {
        console.error("게시글 불러오기 실패", error.message);
        alert("게시글을 불러오는 데 실패했습니다.");
        window.location.href = 'board.html';
    }
}

async function modifyPost(board, title, summary) {
    try {
        const data = {
            "title":title,
            "summary":summary
        };

        const record = await pb.collection('board').update(board, data);

        console.log("게시글 수정 성공");
        window.location.href = `post.html?id=${board}`;
    } catch (error){
        console.error("게시글 수정 실패 ",error.message);
        alert("게시글 수정을 실패했습니다.");
    }
}

async function getLikeCount(board) {
    const result = await pb.collection('likes').getList(1, 1, {
        filter: `board = '${board}'`,
    });

    return result.totalItems;
}

async function toggleLike(id) {
    const userId = pb.authStore.model.id;

    try{
        const existingLike = await pb.collection('likes').getList(1,1,{
            filter: `board = '${id}' && user = '${userId}'`
        });

        if (existingLike.items.length > 0) {
            const likeId = existingLike.items[0].id;
            await pb.collection('likes').delete(likeId);
            return 'removed';
        } else {
            const data = {
                'board': id,
                'user': userId,
            };
            await pb.collection('likes').create(data);
            return 'added';
        }
    } catch(error){
        console.error("좋아요 토글 실패 ",error.message);
    }
}

async function checkAndUpdateLike(id) {
    const userId = pb.authStore.model.id;

    const result = await pb.collection('likes').getList(1,1,{
        filter: `board = '${id}' && user = '${userId}'`
    });

    const isLiked = result.items.length > 0;

    $("#like").text(isLiked? '♥' : '♡');

    return isLiked;
}

async function createComment(comment, board, user) {
    try {
        const data = {
            "text":comment,
            "board":board,
            "user":user
        };

        const record = await pb.collection('comments').create(data);

        console.log("댓글 등록 성공");
        $("#comment").val('');
    } catch (error) {
        console.error("댓글 등록 실패 ", error.message);
        alert("댓글 등록에 실패했습니다.");
    }
}

async function fetchComments(id) {
    try {
        const resultList = await pb.collection('comments').getList(1, 50, {
            filter: `board='${id}'`,
            sort: 'created',
            expand: 'user'
        });

        renderComments(resultList.items);

        return resultList.items;
    } catch (error) {
        console.error("댓글 목록 조회 실패 ",error.message);
    }
}

function updateDetailPageLikeUI(count){
    if ($("#like-count")) {
        $("#like-count").text(count);
    }
}

function subscribeToPostLikes(id){
    pb.collection('likes').subscribe('*', async (e) => {
        const changePostId = e.record.board;

        if (changePostId === id){
            const currentCount = await getLikeCount(id);
            updateDetailPageLikeUI(currentCount);
        }
    });

    console.log("게시글에 대한 실시간 좋아요 구독 시작");
}

function renderComments(comments) {
    $("#comments").empty();

    if (comments.length === 0) {
        $("#comments").append('<p class="no-comments">아직 작성된 댓글이 없습니다.</p>');
        return;
    }

    comments.forEach(comment => {
        const userName = comment.expand?.user?.name || comment.expand?.user?.email || '비공개';
        const canDelete = pb.authStore.model.id === comment.expand?.user?.id;

        const commentDiv = `
        <div class="comment">
            <p class="comment-user">${userName}</p>
            <p class="comment-text">${comment.text}</p>
            ${canDelete? `<p class="comment-delete" data-id="${comment.id}">삭제</p>`:''}
        </div>
        `;

        $("#comments").append(commentDiv);
    });
}

function subscribeToComments(id){
    pb.collection('comments').subscribe('*', async (e) => {
        const changePostId = e.record.board;
        if (changePostId === id){
            console.log("댓글 실시간 변화 감지 ");

            if(e.action === 'create' || e.action === 'delete') {
                await fetchComments(id);
            }
        }
    });

    console.log("게시글에 대한 실시간 댓글 구독 시작");
}

function checkLogin(){
    if(!pb.authStore.isValid){
        window.location.href = 'index.html';
    }
}

checkLogin();

$(document).ready(function(){
    quill = new Quill('#summary', {
        theme: 'snow',
        modules: {
            syntax: true,
            toolbar : toolbarOptions
        }
    });

    setPost(id);

    $("#create").on("click", function(){
        if (!id) {
            if ($("#title").val().trim() == ''){
                    alert("제목을 입력해야 합니다.");
                    $("#title").focus();
                } else {
                    postBoard($("#title").val(), quill.root.innerHTML, pb.authStore.model.id);
                }
        } else {
            modifyPost(id, $("#title").val(), quill.root.innerHTML);
        }
        
    });

    $("#cancel, .list").on('click', function(){
        window.location.href='board.html';
    });

    $("#modify").on("click", function(){
        $("#title").prop("disabled", false);
        $(".create").show();
        $("#summary").hide();
        $(".owner").hide();
        $(".detail").hide();
    });

    $("#delete").on("click", async function(){
        try {
            await pb.collection('board').delete(id);

            console.log("게시글 삭제 성공");
            alert("게시물을 삭제했습니다.");
            window.location.href = 'board.html';
        } catch (error) {
            console.error("게시글 삭제 실패 ",error.message);
            alert("게시물을 삭제하는데 실패했습니다.");
        }
    });

    $("#like").on('click', async function () {
        try {
            const action = await toggleLike(id);

            if (action === 'added'){
                $(this).text('♥');
            } else if (action === 'removed') {
                $(this).text('♡');
            }
        } catch (error) {}
    });

    $("#register").on("click", function(){
        if ($("#comment").val().trim() == ''){
            alert("댓글을 입력해주세요.");
            $("#comment").focus();
        } else {
            createComment($("#comment").val(), id, pb.authStore.model.id);
        }
    });

    $("#comments").on('click', ".comment-delete", async function(){
        try {
            await pb.collection('comments').delete($(this).data('id'));

            console.log("댓글 삭제 성공");
            alert("댓글을 삭제했습니다.");
        } catch (error) {
            console.error("댓글 삭제 실패 ",error.message);
            alert("댓글을 삭제하는데 실패했습니다.");
        }
    });
});

$(document).on('beforeunload', function(){
    pb.unsubscribe('*');
    console.log("PocketBase 구독 해제");
})