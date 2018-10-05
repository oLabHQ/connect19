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


    // Add user as admin
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
            complete: function () { 
                
            }
        });
    });


    // Flag Group-post
    $(".flag-group-post").on("click", function(){      
        var group_id = $("#group-id").attr("data-id");
        var flag_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(flag_post_id);
        console.log(group_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"flag_post_id": flag_post_id}),
            contentType: 'application/json',
            url: "/groups/"+group_id,
            success: function(){
                console.log('This group post has been flagged');
            },
            complete: function (data) {
                clicked_button.html('This post has been flagged').attr("disabled", "disabled");
               }
        });
    });


     // Trash Group-post
     $(".group-flag-block__trash-post").on("click", function(){      
        var group_id = $("#group-id").attr("data-id");
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        console.log(trash_post_id);
        console.log(group_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"trash_post_id": trash_post_id}),
            contentType: 'application/json',
            url: "/groups/"+group_id+"/flags",
            success: function(){
                console.log('This post has been trashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been trashed').attr("disabled", "disabled");
               }
        });
    });


    // Undo-Group-Trash-post
    $(".group-trash-block__undo-btn").on("click", function(){
        var group_id = $("#group-id").attr("data-id");
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"trash_post_id": trash_post_id}),
            contentType: 'application/json',
            url: "/groups/"+group_id+"/trash",            
            success: function(){
                console.log('This Group post has been untrashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been untrashed').attr("disabled", "disabled");
            }
        });
    });


    // Delete-Group-Trash-post
    $(".group-trash-block__delete-btn").on("click", function(){
        var group_id = $("#group-id").attr("data-id");
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"trashed_post_id": trash_post_id}),
            contentType: 'application/json',
            url: "/groups/"+group_id+"/trash/delete",            
            success: function(){
                console.log('This group post has been Deleted');
                $('.trash-block').hide();
            },
            complete: function () {
                clicked_button.html('This post has been Deleted').attr("disabled", "disabled");
            }
        });
    });


    // Accept Group Invitation
    $(".group-invitation-block__accept-invitation").on("click", function(){
        //var group_id = $("#group-id").attr("data-id");
        var group_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({"group_id": group_id}),
            contentType: 'application/json',
            url: "/groups/invitations",            
            success: function(){
                console.log('You have accepted Group invitation');               
            },
            complete: function () {
                clicked_button.html('You have accepted Group invitation').attr("disabled", "disabled");
            }
        });
    });


  
}());