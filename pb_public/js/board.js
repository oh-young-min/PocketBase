import PocketBase from 'https://cdnjs.cloudflare.com/ajax/libs/pocketbase/0.26.2/pocketbase.es.mjs';

const pb = new PocketBase('http://127.0.0.1:8090');

async function getPocketBaseDataForDatatables(data) {
    const page = data.start / data.length + 1;
    const perPage = data.length;

    const sortColumnIndex = data.order[0].column;
    const sortColumnName = data.columns[sortColumnIndex].data;
    const sortDir = data.order[0].dir === 'asc' ? '' : '-';
    const sortField = sortDir + sortColumnName;

    let filter = '';
    const searchValue = data.search.value;
    if (searchValue){
        filter = `title ~ '${searchValue}'`;
    }

    try {
        const resultList = await pb.collection('board').getList(page, perPage, {
            sort: sortField,
            filter: filter,
            expand: 'user',
        });

        return {
            draw: data.draw,
            recordsTotal: resultList.totalItems,
            recordsFiltered: resultList.totalItems,
            data: resultList.items
        };
    } catch (error){
        console.error("PocketBase 데이터 요청 실패 ", error);
        return {draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data:[]};
    }
}

function checkLogin(){
    if(!pb.authStore.isValid){
        window.location.href = 'index.html';
    }
}

checkLogin();

$(document).ready(function(){
    $("#board").DataTable({
        processing: true,
        serverSide: true,
        order: [[2,'desc']],
        ajax: function(data, callback, settings){
            getPocketBaseDataForDatatables(data).then(pocketbaseResponse => {
                callback(pocketbaseResponse);
            })
            .catch(error => {
                console.error("DataTables 연동 중 에러 발생 ",error);
                callback({draw: data.draw, recordsTotal:0, recordsFiltered:0, data:[]});
            });
        },
        columns: [
            {
                data: 'title',
                title: '제목',
                createdCell: function(td, cellData, rowData){
                    $(td).css('cursor', 'pointer');

                    $(td).on("click", function(){
                        window.location.href=`post.html?id=${rowData.id}`;
                    });
                }
            },
            {
                data: null,
                title: '작성자',
                render: function(data, type, row){
                    if (row.expand && row.expand.user){
                        return row.expand.user.name || row.expand.user.email || '비공개';
                    } else {
                        return '비공개';
                    }
                }
            },
            {
                data: 'created',
                title: '작성일자',
                name: 'created'
            },
            {
                data: 'updated',
                title: '수정일자',
                name: 'updated'
            }
        ]
    });

    $("#logout").on('click', function(){
        pb.authStore.clear();

        console.log("로그아웃 성공");

        window.location.href = 'index.html';
    });

    $("#newPost").on('click', function(){window.location.href='post.html';});

    $("#account").on("click", function(){window.location.href='account.html';});
});