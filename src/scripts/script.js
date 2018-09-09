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
        console.log(friend_member_id);
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
}());