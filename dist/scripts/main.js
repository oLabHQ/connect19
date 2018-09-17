(function() {
    $(document).ready(function(){    
        $("#img").click(function(){
            $("#file").click();
        });
    });


    $('.request-btn').on("click", function(){
        var clicked_button = $(this);
        $.ajax({
            method:"POST",
            url:"/friends",
            contentType: "application/json",
            data: JSON.stringify({"member_id": clicked_button.attr("id")}),            
            success: function(){                
                console.log('friend request has been sent');
                //clicked_button.parent().remove();
                //document.getElementById(member_id).disabled = true;
                clicked_button.html('Friend request sent').attr("disabled", "disabled");
            }
        });
    });

    $(".pending-request__accept-btn").on("click", function(){
        var friend_member_id = $(this).parent().attr("id");
        //console.log(friend_member_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"member_id": friend_member_id}),
            contentType: 'application/json',
            url: "/friends/friend-requests",            
            success: function(){
                console.log('friend request has been accepted');
            },
            complete: function (data) {
                $("#accept_friend_request").html('Friend request accepted').attr("disabled", "disabled");
               }  
        });
    });

    // flag-post
    $(".flag-post").on("click", function(){
        var flag_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(flag_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"flag_post_id": flag_post_id}),
            contentType: 'application/json',
            url: "/",            
            success: function(){
                console.log('This post has been flagged');
            },
            complete: function (data) {
                clicked_button.html('This post has been flagged').attr("disabled", "disabled");
               }
        });
    });


    // Trash-post
    $(".trash-post").on("click", function(){
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"trash_post_id": trash_post_id}),
            contentType: 'application/json',
            url: "/flags",            
            success: function(){
                console.log('This post has been trashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been trashed').attr("disabled", "disabled");
            }
        });
    });

    // Undo-Trash-post
    $(".trash-block__undo-btn").on("click", function(){
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"trash_post_id": trash_post_id}),
            contentType: 'application/json',
            url: "/trash",            
            success: function(){
                console.log('This post has been untrashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been untrashed').attr("disabled", "disabled");
            }
        });
    });


    // Delete-Trash-post
    $(".trash-block__delete-btn").on("click", function(){
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"trashed_post_id": trash_post_id}),
            contentType: 'application/json',
            url: "/trash/delete",            
            success: function(){
                console.log('This post has been Deleted');
                $('.trash-block').hide();
            },
            complete: function () {
                clicked_button.html('This post has been Deleted').attr("disabled", "disabled");
            }
        });
    });


    // Delete-Trash-post
    $(".friend-list__select-btn").on("change", function(){
        var admin_value = $(this).is(":checked");
        var admin_user_id = $(this).attr("id"); 
        //console.log(admin_value);
        //console.log(admin_user_id);        
        $.ajax({
            method: "POST",
            data: JSON.stringify({"admin_user_id": admin_user_id, "admin_value": admin_value}),
            contentType: 'application/json',
            url: "/admin",            
            success: function(){
                $('#notify').show().html("User has been added as admin");
                console.log('This user has been added as admin');                
            },
            setTimeout(function() {
                $("#notify").hide('blind', {}, 500)
            }, 5000),
            complete: function () { 
               
            }
        });
    });
    

}());