(function () {
    // PWA
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('../pwa/service-worker.min.js')
            .then(function () { console.log('Service Worker Registered'); });
    }

    // END PWA

    $(document).ready(function () {
        $("#img").click(function () {
            $("#file").click();
        });

        $(".add-to-homescreen").click(function() {
            showA2HSPrompt();
        });
    });

    $('.request-btn').on("click", function () {
        var clicked_button = $(this);
        $.ajax({
            method: "POST",
            url: "/friends",
            contentType: "application/json",
            data: JSON.stringify({ "member_id": clicked_button.attr("id") }),
            success: function () {
                console.log('friend request has been sent');
                //clicked_button.parent().remove();
                //document.getElementById(member_id).disabled = true;
                clicked_button.html('Friend request sent').attr("disabled", "disabled");
            }
        });
    });

    $(".pending-request__accept-btn").on("click", function () {
        var friend_member_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(friend_member_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "member_id": friend_member_id }),
            contentType: 'application/json',
            url: "/friends/friend-requests",
            success: function () {
                console.log('friend request has been accepted');
            },
            complete: function (data) {
                clicked_button.html('Friend request accepted').attr("disabled", "disabled");
            }
        });
    });

    // flag-post
    $(".flag-post").on("click", function () {
        var flag_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(flag_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "flag_post_id": flag_post_id }),
            contentType: 'application/json',
            url: "/",
            success: function () {
                console.log('This post has been flagged');
            },
            complete: function (data) {
                clicked_button.html('This post has been flagged').attr("disabled", "disabled");
            }
        });
    });


    // Trash-post
    $(".trash-post").on("click", function () {
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "trash_post_id": trash_post_id }),
            contentType: 'application/json',
            url: "/flags",
            success: function () {
                console.log('This post has been trashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been trashed').attr("disabled", "disabled");
            }
        });
    });

    // Undo-Trash-post
    $(".trash-block__undo-btn").on("click", function () {
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "trash_post_id": trash_post_id }),
            contentType: 'application/json',
            url: "/trash",
            success: function () {
                console.log('This post has been untrashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been untrashed').attr("disabled", "disabled");
            }
        });
    });


    // Delete-Trash-post
    $(".trash-block__delete-btn").on("click", function () {
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "trashed_post_id": trash_post_id }),
            contentType: 'application/json',
            url: "/trash/delete",
            success: function () {
                console.log('This post has been Deleted');
                $('.trash-block').hide();
            },
            complete: function () {
                clicked_button.html('This post has been Deleted').attr("disabled", "disabled");
            }
        });
    });


    // Add user as admin
    $(".friend-list__select-btn").on("change", function () {
        var admin_value = $(this).is(":checked");
        var admin_user_id = $(this).attr("id");
        //console.log(admin_value);
        //console.log(admin_user_id);        
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "admin_user_id": admin_user_id, "admin_value": admin_value }),
            contentType: 'application/json',
            url: "/admin",
            success: function () {
                $('#notify').show().html("User has been added as admin");
                console.log('This user has been added as admin');
            },
            complete: function () {

            }
        });
    });


    // Add user as Connect19 member
    $(".friend-list__approve--user").on("change", function () {
        var user_value = $(this).is(":checked");
        var user_id = $(this).attr("id");
        console.log(user_value);
        console.log(user_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "user_id": user_id, "user_value": user_value }),
            contentType: 'application/json',
            url: "/admin/approve",
            success: function () {
                $('#notify').show().html("User has been approved");
                console.log('This user has been approved');
            },
            complete: function () {

            }
        });
    });


    // Flag Group-post
    $(".flag-group-post").on("click", function () {
        var group_id = $("#group-id").attr("data-id");
        var flag_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        console.log(flag_post_id);
        console.log(group_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "flag_post_id": flag_post_id }),
            contentType: 'application/json',
            url: "/groups/" + group_id,
            success: function () {
                console.log('This group post has been flagged');
            },
            complete: function (data) {
                clicked_button.html('This post has been flagged').attr("disabled", "disabled");
            }
        });
    });


    // Trash Group-post
    $(".group-flag-block__trash-post").on("click", function () {
        var group_id = $("#group-id").attr("data-id");
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        console.log(trash_post_id);
        console.log(group_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "trash_post_id": trash_post_id }),
            contentType: 'application/json',
            url: "/groups/" + group_id + "/flags",
            success: function () {
                console.log('This post has been trashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been trashed').attr("disabled", "disabled");
            }
        });
    });


    // Undo-Group-Trash-post
    $(".group-trash-block__undo-btn").on("click", function () {
        var group_id = $("#group-id").attr("data-id");
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "trash_post_id": trash_post_id }),
            contentType: 'application/json',
            url: "/groups/" + group_id + "/trash",
            success: function () {
                console.log('This Group post has been untrashed');
            },
            complete: function (data) {
                clicked_button.html('This post has been untrashed').attr("disabled", "disabled");
            }
        });
    });


    // Delete-Group-Trash-post
    $(".group-trash-block__delete-btn").on("click", function () {
        var group_id = $("#group-id").attr("data-id");
        var trash_post_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "trashed_post_id": trash_post_id }),
            contentType: 'application/json',
            url: "/groups/" + group_id + "/trash/delete",
            success: function () {
                console.log('This group post has been Deleted');
                $('.trash-block').hide();
            },
            complete: function () {
                clicked_button.html('This post has been Deleted').attr("disabled", "disabled");
            }
        });
    });


    // Accept Group Invitation
    $(".group-invitation-block__accept-invitation").on("click", function () {
        //var group_id = $("#group-id").attr("data-id");
        var group_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(trash_post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "group_id": group_id }),
            contentType: 'application/json',
            url: "/groups/invitations",
            success: function () {
                console.log('You have accepted Group invitation');
            },
            complete: function () {
                clicked_button.html('You have accepted Group invitation').attr("disabled", "disabled");
            }
        });
    });


    // Pin Group
    $(".pingroup").on("change", function () {
        var pin_value = $(this).is(":checked");
        //var admin_user_id = $(this).attr("id");
        var group_id = $(this).parent().attr("id");
        console.log(pin_value);
        console.log(group_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "group_id": group_id, "pin_value": pin_value }),
            contentType: 'application/json',
            url: "/groups/pingroup",
            success: function () {
                $('#notify').show().html("This group has pinned");
                console.log('This group has pinned');
            },
            complete: function () {

            }
        });
    });

    // Pin Group Post  
    $(".pinpost").on("change", function () {
        var pin_value = $(this).is(":checked");
        //var admin_user_id = $(this).attr("id");
        var post_id = $(this).parent().attr("id");
        console.log(pin_value);
        console.log(post_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "post_id": post_id, "pin_value": pin_value }),
            contentType: 'application/json',
            url: "/groups/pinpost",
            success: function () {
                $('#notify').show().html("This group has pinned");
                console.log('This group has pinned');
            },
            complete: function () {

            }
        });
    });


    // Delete User from Connect19
    $(".friend-list__delete-user").on("click", function () {
        var user_id = $(this).parent().attr("id");
        var clicked_button = $(this);
        //console.log(user_id);
        $.ajax({
            method: "POST",
            data: JSON.stringify({ "user_id": user_id }),
            contentType: 'application/json',
            url: "/admin/delete-user",
            success: function () {
                console.log('This User has been Deleted');
                $('.trash-block').hide();
            },
            complete: function () {
                // clicked_button.parent().remove();
                clicked_button.html('User Deleted').attr("disabled", "disabled");
            }
        });
    });

    // Find users input focus to send invitation 
    $("#tags").on("focus", function () {
        //console.log('hello');
        $.ajax({
            method: "GET",
            url: "/groups/_dmPkzzXE/join",
            success: function (data) {
                // console.log(data);
            }
        });
    });




    // Script for popup for groups
    // Get the modal 
    var modal = document.getElementById('myModal');

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
    // Script for popup for groups ends here

    // Chat between users
    $('.chat_button').on("click", function () {
        var user_id = $(this).attr("id");
        //console.log(user_id);
        //  var chat_box = '<div class="chat_section" id="'+ user_id +'"><div id="chat_title_section"><span>Node Connect Chat</span><div class="chat_close"><i class="fa fa-times-circle" aria-hidden="true"></i></div></div><div class="all_Chat_messages"></div><div id="send_message"><input id="send_message_input" type="text" placeholder="Send message.."></div></div>';        
        //$("#chat_section_wrapper").append(chat_box);
    });

    $(document).on("click", ".chat_close", function () {
        $('.chat_section').remove();
    });



    $.deparam = $.deparam || function (uri) {
        if (uri === undefined) {
            uri = window.location.pathname;
        }

        var value1 = window.location.pathname;
        var value2 = value1.split('/');
        var value3 = value2.pop();

        return value3;
    };

    $(document).ready(function () {
        var socket = io();

        var paramOne = $.deparam(window.location.pathname);
        //console.log(paramOne);
        var newParam = paramOne.split('.');
        //console.log('1',newParam);
        swap(newParam, 0, 1);
        //console.log('2',newParam);
        var paramTwo = newParam[0] + '.' + newParam[1];

        socket.on('connect', function () {
            var params = {
                room1: paramOne,
                room2: paramTwo
            };

            socket.emit('join PM', params, function () {
                //console.log('User Joined');
            });

            $(document).on("keypress", "#send_message_input", function (e) {
                if (e.keyCode === 13) {
                    var chat_message_content = $(this).val();
                    // console.log(chat_message_content);

                    if (chat_message_content.trim().length > 0) {
                        //  $(".all_Chat_messages").append("<div class='usr_msg'>" + "<span class='user_with_message'>You:</span>" + "<div class='usr_msg_box'><p>" + chat_message_content + "</p>" + "</div>" + "</div>");
                        socket.emit("message_from_client", { "msg": chat_message_content, username: $("#chat_section_wrapper").attr("data-name"), "friend_member_id": $("#chat_section_wrapper").attr("data-id"), "socket_id": socket.id, "room": paramOne });
                        $(this).val("");
                    } else {
                        alert('Please enter some text');
                    }

                }

            });
            socket.on("attach_user_info", function (user_info) {
                socket.member_id = user_info.member_id;
                socket.user_name = user_info.user_name;
                // console.log("socket", socket)
            });
            socket.on("message_from_server", function (received_msg) {
                // console.log("received_msg", received_msg);
                $(".all_Cha_messages").append("<div class='usr_msg'>" + "<span class='user_with_message'>" + received_msg.user_name + ":</span>" + "<div class='usr_msg_box'><p>" + received_msg.msg + "</p>" + "</div>" + "</div>");
            });
        });
    });

    function swap(input, value_1, value_2) {
        var temp = input[value_1];
        input[value_1] = input[value_2];
        input[value_2] = temp;
    }

}());

// Filte User
function filterUser() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("filterUser");
    filter = input.value.toUpperCase();
    table = document.getElementById("friends-list-block");
    tr = table.getElementsByTagName("a");
    tp = table.getElementsByTagName("div");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("h2")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
    for (i = 0; i < tp.length; i++) {
        td = tp[i].getElementsByTagName("h2")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tp[i].style.display = "";
            } else {
                tp[i].style.display = "none";
            }
        }
    }
}