function clickEvents() {

    $('body').click(function(e) {
        // The element that was clicked.
        // Make sure to use Elem everywhere instead of "this".
        var Elem = e.target;

        // Add Online Streamer
        if ($(Elem).hasClass('addonline')) {
            var username = $(Elem).attr('name');
            console.log('Clicked online for ' + username);
            singleChannelSubscribe(username)
        }

        // Go Button!
        // Finds username and userid then updates notifications.
        if ($(Elem).hasClass('followeraddbtn')) {
            var localUsername = $('.followeradd').val();
            if (localUsername !== '') {
                localStorage.setItem("username", localUsername);
                $.getJSON("https://beam.pro/api/v1/channels/" + localUsername + "?fields=userId", function(body) {
                    var userID = body.userId;
                    localStorage.setItem('userID', userID);
                    jumperUpdate(0);
                });
            }
        }

        // Add Other Box
        if ($(Elem).hasClass('streamerinputaddbtn')) {
            var username = $('.streamerinputadd').val();

            // Local Storage List
            if (username !== '') {
                if ($('.' + username).length === 0) {
                    singleChannelSubscribe(username);
                    var pastAdds = localStorage.getItem("streamer");
                }
                $('.streamerinputadd').val('');
            }

        }

        // Add All Button
        if ($(Elem).hasClass('addallbutton')) {
            var localUsername = localStorage.getItem('username');

            // Local Storage List
            if (localUsername !== '' && localUsername !== undefined) {
                multiChannelSubscribe(localUsername, 0);
            }
        }

        // Close button
        if ($(Elem).hasClass('closebtn')) {
            var stream = $(Elem).attr('stream');
            var username = $('#' + stream + ' h2').text();
            var savedStreams = localStorage.getItem("streamer");
            $(Elem).closest('.stream').remove();
        };

    }); // end on body clicks

}

function singleChannelSubscribe(username) {
    $.getJSON('https://beam.pro/api/v1/channels/' + username + '?fields=id,online,token,name,type,partnered,numFollowers', function(body, response) {
        // If response recieved and the div isn't already on the page.
        if ($('.' + body.token).length === 0) {
            var channelID = body.id;
            var cName = body.token;
            var cTitle = body.name;
            if (body.type !== null && body.type !== undefined && body.type !== "") {
                var cGame = body.type.name;
            } else {
                var cGame = "No Game Set";
            }
            var cPartnered = body.partnered;
            var cFollowers = body.numFollowers;

            var cOnline = body.online;
            buildChannel(channelID, cName, cTitle, cGame, cPartnered, cFollowers);

            // If channel is offline when added, make title gray.
            if (cOnline === false) {
                $('#' + channelID + ' h2').addClass('offline');
            };

        } else {
            console.error('Error checking the online state for the channel', username);
        }
    });
}

function multiChannelSubscribe(localUsername, page) {
    // Get user ID.
    $.getJSON('https://beam.pro/api/v1/channels/' + localUsername + '?fields=userId', function(body, response) {
        // Get list of people user follows.
        var userID = body.userId;
        localStorage.setItem('userID', userID);
        $.getJSON('https://beam.pro/api/v1/users/' + userID + '/follows?limit=50&where=online:eq:1&page=' + page, function(body, response) {
            // Loop through list.
            $.each(body, function(index, element) {
                // If channel not suspended and they aren't already on the page...
                if (element.suspended !== true && $('#' + element.id).length === 0) {
                    var channelID = element.id;
                    var cName = element.token;
                    var cTitle = element.name;
                    if (element.type !== null && element.type !== undefined && element.type !== "") {
                        var cGame = element.type.name;
                    } else {
                        var cGame = "No Game Set";
                    }
                    var cPartnered = element.partnered;
                    var cFollowers = element.numFollowers;

                    // If the channel is online then go ahead and build it.
                    buildChannel(channelID, cName, cTitle, cGame, cPartnered, cFollowers);
                }
            });

            // If the number of results equals 50, then we need to check the next page for new items.
            // Otherwise, we've cycled through all of their followers.
            if (body.length === 50) {
                var pageCount = parseInt(page, 10) + 1;
                multiChannelSubscribe(localUsername, pageCount);
            }
        });
    });
}

// Build Channel
// This function adds the channel to teh page using gathered info.
function buildChannel(channelID, username, title, game, partnered, followers) {

    // If the channel is partnered we're gonna make the name purple.
    if (partnered === true) {
        var partnered = "partnered";
    } else {
        var partnered = "not-partnered";
    }
    // If channel is not already on the page...
    if ($('#' + channelID).length === 0) {
        var streamEmbed = "https://beam.pro/embed/player/" + username;
        var chatEmbed = "https://beam.pro/embed/chat/" + username;

        // Build out the stream on the page.
        $('.channelwrapper').append('<div id="' + channelID + '" stream="' + username + '" followers="' + followers + '" class="stream" style="display:none"><div class="streambar"><div class="stream-notice" style="display:none"></div><div class="closestream"><button class="closebtn" stream="' + channelID + '">X</button></div></div><div class="streamtop"><div class="streamname"><h2 class="' + partnered + '"></h2></div><div class="cGame"></div><div class="cTitle"></div></div><div class="chatwrap"></div></div>');
        $('#' + channelID + ' .chatwrap').html('<iframe class="chatembed" src="https://beam.pro/embed/chat/' + username + '"></iframe>');
        $('#' + channelID + ' .streamtop h2').html('<a href="https://beam.pro/' + username + '" target="_blank">' + username + '</a>');
        $('#' + channelID + ' .cGame').text(game);
        $('#' + channelID + ' .cTitle').text(title);
        $('#' + channelID + ' .streamtop').append('<button class="watch" stream="' + username + '">Watch</button>');
        $('#' + channelID).css('display', 'block');

        // Watch Button to watch streams..
        $('#' + channelID + ' .watch').click(function() {
            $('#' + channelID).before('<div stream="' + channelID + '" stream="' + username + '" class="stream streamembed"><div class="streambar"><div class="stream-notice" style="display:none"></div><div class="closestreamembed"><button class="closebtn" stream="' + channelID + '">X</button></div></div><div class="streamtop"><div class="streamname"><h2 class="' + partnered + '"><a href="http://www.beam.pro/' + username + '" target="_blank">' + username + '</a></h2></div><div class="cGame"></div><div class="cTitle"></div></div><div class="streamwrap"><iframe src="https://beam.pro/embed/player/' + username + '"></iframe></div></div>');

            // Set height of chat window to the same height as the video..
            var newHeight = $('.streamembed[stream="' + channelID + '"] iframe').height();
            $('.chatembed').css('height', newHeight);

            // Scroll to element to account for new chat height.
            $('html, body').delay(750).animate({
                scrollTop: $('.streamembed[stream="' + channelID + '"]').offset().top
            }, 1500);


            $('.streamembed[stream="' + channelID + '"] .closestreamembed .closebtn').click(function() {
                $('.streamembed[stream="' + channelID + '"]').remove();
                // Set related chat window back to regular height.
                $('.chatembed').css('height', '400px');
            });
        });

    }
}

// Displays an alert if a new channel comes online that isn't already shown.
function jumperUpdate(page) {

    var userID = localStorage.getItem('userID');
    if (userID !== '' && userID !== undefined && userID !== null) {
        $.getJSON('https://beam.pro/api/v1/users/' + userID + '/follows?limit=50&where=online:eq:1&page=' + page, function(body, response) {
            // Loop through list.
            $.each(body, function(index, element) {
                var cName = element.token;
                var partnered = element.partnered;
                if (partnered === true) {
                    var partnered = "partner-notification";
                } else {
                    var partnered = "regular-notification";
                }

                // Remove default notification text
                $('.default-notify-text').remove();

                // If channel not suspended and they aren't already on the page...
                if (element.suspended !== true && $('#' + element.id).length === 0 && element.online === true) {
                    // Add line to notification box
                    if ($('.' + cName + '-notification').length < 1) {
                        $('.notification').prepend('<div class="' + cName + '-notification notification-name"><button class="addonline" name="' + cName + '">Add</button><span class="' + partnered + '">' + cName + '</span><span class="notification-new">New</span></div>');
                    }

                    // If menu is not opened then add a notification alert.
                    if ($('.menu-link.active').length === 0) {
                        // Update notification number to match number of new notifications.
                        var notificationNumber = parseInt($('.menu-notification-alert').html());
                        var notificationList = $('.notification .notification-new').length;
                        if (notificationNumber !== notificationList) {
                            $('.menu-notification-alert').text(notificationList);
                            $('.menu-notification-alert').fadeIn('fast');
                        }
                    }

                    // Show scroll bar once notification area hits 600 px tall.
                    if ($('.notification').height() >= 400) {
                        $('.notification').css('overflow-y', 'scroll');
                    } else {
                        $('.notification').css('overflow-y', 'hidden');
                    }

                    // Throw in the add all button if people are online and local username is set.
                    var localUser = localStorage.getItem('username');
                    var onlinePeople = $('.notification-name').length;
                    if (localUser !== undefined && localUser !== '' && $('.addallbutton').is('visible') === false && onlinePeople > 2) {
                        $('.addallbutton').fadeIn('fast');
                    } else {
                        $('.addallbutton').fadeOut('fast');
                    }

                } else if ($('#' + element.id).length > 0 && element.online === false) {

                    // Remove their line from the notification box.
                    $('.' + cName + '-notification').remove();
                }
            });

            // If the number of results equals 50, then we need to check the next page for new items.
            // Otherwise, we've cycled through all of their followers.
            if (body.length === 50) {
                var pageCount = parseInt(page, 10) + 1;
                console.log("Finished page " + page + " moving on to page " + pageCount + ".");
                jumperUpdate(pageCount);
            }
        });
    }
}

// Navigation Open and Closed Triggers
function navOpen() {
    // When menu is opened, clear alert number and hide alert.
    $('.menu-notification-alert').text('0');
    $('.menu-notification-alert').hide();
}

function navClosed() {
    // Remove new notification in notification list.
    $('.notification-new').remove();
}

function stickyHeader() {
    $(window).scroll(function() {
        if ($(this).scrollTop() > 1) {
            $('.top').addClass("sticky");
        } else {
            $('.top').removeClass("sticky");
        }
    });
}


$(document).ready(function() {
    clickEvents();

    // Load up past username.
    var localUsername = localStorage.getItem('username');
    $('.followeradd').val(localUsername);

    // Make streams sortable.
    $(".channelwrapper").sortable({
        placeholder: 'stream-placeholder'
    });

    // Run notification
    setInterval(function() {
        jumperUpdate(0);
    }, 60000)

    // Settings Menu
    $('.menu-link').bigSlide({
        easyClose: true,
        state: 'open',
        afterOpen: function() {
            navOpen();
        },
        afterClose: function() {
            navClosed();
        }
    });

    stickyHeader();
    $('.settings').show();

});
