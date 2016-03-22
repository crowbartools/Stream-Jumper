io.sails.autoConnect = false;
io.sails.url = 'wss://realtime.beam.pro/';
io.sails.transports = ['websocket'];
io.sails.useCORSRouteToGetCookie = false;

socket = io.sails.connect();
socket.on('connect', function() {
    console.log('[Socket] Connected - Subscribing to events');

    clickEvents();
});
socket.on('disconnect', function() {
    setTimeout(function() {
        socket = io.sails.connect();
        console.info('Reconnect detected: Resubbing to all channels.');
        reconnectSubscribe();
    }, 5000);
});

function clickEvents(channelID) {

    $('body').click(function(e) {
        // The element that was clicked.
        // Make sure to use Elem everywhere instead of "this".
        var Elem = e.target;

        // Add Streamer Button
        if ($(Elem).hasClass('streamerinputaddbtn')) {
            var username = $('.streamerinputadd').val();

            // Local Storage List
            if (username !== '') {
                if ($('.' + username).length === 0) {
                    singleChannelSubscribe(username);
                    var pastAdds = localStorage.getItem("streamer");
                    if (pastAdds === undefined || pastAdds === null || pastAdds === '') {
                        localStorage.setItem("streamer", username);
                    } else {
                        localStorage.setItem("streamer", pastAdds + "," + username);
                    }
                } else {
                    alert(username + ' is already in your list!');
                }
                $('.streamerinputadd').val('');
            }

        }

        // Add Online Followed button
        if ($(Elem).hasClass('followeraddbtn')) {
            var localUsername = $('.followeradd').val();

            // Local Storage List
            if (localUsername !== '') {
                localStorage.setItem("username", localUsername);
                multiChannelSubscribe(localUsername);
            }
        }

        // Close button
        if ($(Elem).hasClass('closebtn')) {
            var stream = $(Elem).attr('stream');
            var username = $('#' + stream + ' h2').text();
            var savedStreams = localStorage.getItem("streamer");
            $(Elem).closest('.stream').remove();

            // Strip out of local storage and clean up list
            var username = new RegExp("(" + username + ")", "gi");
            var text = savedStreams.replace(username, '');
            var text = text.replace(/,+/g, ',');
            var text = $.trim(text);
            var modifiedList = $.unique(text.split(",")).filter(function(e) {
                return e.length
            }).join(",");
            localStorage.setItem("streamer", modifiedList);
        };

        // Notification Close Button
        if ($(Elem).hasClass('notificationclosebtn')) {
            $('.notification-wrap').fadeOut('fast');
        }

    }); // end on body clicks

}

function singleChannelSubscribe(username) {
    socket.request({
        url: '/api/v1/channels/' + username + '?fields=id,online,token,name,type,partnered,numFollowers',
        method: 'get'
    }, function(body, response) {
        // If response recieved and the div isn't already on the page.
        if (response.statusCode == 200 && $('.' + body.token).length === 0) {
            var channelID = body.id;
            var cName = body.token;
            var cTitle = body.name;
            if (body.type !== null || body.type !== undefined) {
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

            // Unfortunately since the channel is always visible in this mode we need to subscribe to all events.
            // Subscribe to channel updates.
            var updateSlug = ["channel:" + channelID + ":update"];
            socket.request({
                url: '/api/v1/live',
                method: 'put',
                params: {
                    slug: updateSlug
                }
            }, function(body, response) {
                if (response.statusCode == 200) {
                    socket.on(updateSlug, function(data) {
                        onChannelUpdate(channelID, cName, cTitle, cGame, data, cPartnered);
                    });
                } else if (response.statusCode == 420) {
                    console.error('Too many subscriptions');
                } else {
                    console.error('There was an error subbing to the channel update event.', cName);
                }
            });

            // If partnered subscribe to that channel also.
            if (cPartnered === true) {
                var updateSlug = ["channel:" + channelID + ":subscribed"];
                socket.request({
                    url: '/api/v1/live',
                    method: 'put',
                    params: {
                        slug: updateSlug
                    }
                }, function(body, response) {
                    if (response.statusCode == 200) {
                        // Debug
                        console.log('Subscribed to subscriber channel', cName);
                        socket.on(updateSlug, function(data) {
                            subscriber(channelID);
                        });
                    } else if (response.statusCode == 420) {
                        console.error('Error: Too many subscriptions.');
                        $('#' + channelID + ' .stream-notice').text('Error.');
                    } else {
                        console.error('There was an error subbing to the channel update event.', cName, response.statusCode);
                    }
                });
            };
        } else {
            console.error('Error checking the online state for the channel', username);
        }
    });
}

function multiChannelSubscribe(localUsername) {
    // Get user ID.
    socket.request({
        url: '/api/v1/channels/' + localUsername + '?fields=userId',
        method: 'get'
    }, function(body, response) {
        // Get list of people user follows.
        if (response.statusCode == 200) {
            var userID = body.userId;
            localStorage.setItem('userID', userID);
            socket.request({
                url: '/api/v1/users/' + userID + '/follows',
                method: 'get'
            }, function(body, response) {
                if (response.statusCode == 200) {
                    // Loop through list.
                    $.each(body, function(index, element) {
                        // If channel not suspended and they aren't already on the page (and thus subscribed in websocket)...
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

                            if (element.online === true) {
                                // Sub to channel updates for all followed channels.
                                var updateSlug = ["channel:" + channelID + ":update"];
                                socket.request({
                                    url: '/api/v1/live',
                                    method: 'put',
                                    params: {
                                        slug: updateSlug
                                    }
                                }, function(body, response) {
                                    if (response.statusCode == 200) {
                                        socket.on(updateSlug, function(data) {
                                            // Debug to log all events for all channels.
                                            // console.log(data, cName);
                                            onChannelUpdate(channelID, cName, cTitle, cGame, data, cPartnered);
                                        });
                                    } else if (response.statusCode == 420) {
                                        console.error('Error: Too many subscriptions.');
                                        $('#' + channelID + ' .stream-notice').text('No updates.');
                                    } else {
                                        console.error('There was an error subbing to the channel update event.', cName, response.statusCode);
                                    }
                                });
                                // If partnered subscribe to that channel.
                                if (cPartnered === true) {
                                    var updateSlug = ["channel:" + channelID + ":subscribed"];
                                    socket.request({
                                        url: '/api/v1/live',
                                        method: 'put',
                                        params: {
                                            slug: updateSlug
                                        }
                                    }, function(body, response) {
                                        if (response.statusCode == 200) {
                                            // Debug
                                            console.log('Subscribed to subscriber channel', cName);
                                            socket.on(updateSlug, function(data) {
                                                subscriber(channelID);
                                            });
                                        } else if (response.statusCode == 420) {
                                            console.error('Error: Too many subscriptions.');
                                            $('#' + channelID + ' .stream-notice').text('Error.');
                                        } else {
                                            console.error('There was an error subbing to the channel update event.', cName, response.statusCode);
                                        }
                                    });
                                };

                                // If the channel is online then go ahead and build it.
                                buildChannel(channelID, cName, cTitle, cGame, cPartnered, cFollowers);
                            };
                        } else if ($('#' + element.id).length > 0 && element.online === false) {
                            // If channel is on the page, but we get an offline response then remove the channel.
                            $('#' + element.id).fadeOut('fast');
                        }
                    });

                    // Hide the online notification if it is shown because all online should be added now.
                    $('.notification-wrap').fadeOut('fast');
                    $('.notification-name').remove();

                } else {
                    console.error('Error getting the follower list.');
                }
            });

        } else {
            console.error('Error getting the userID number.');
        }
    });
}

// Reconnect Function
// This function is run only when the websocket reconnects.
// It will loop through all divs on page and resubscribe to updates.
function reconnectSubscribe() {
    // When socket reconnects we need to resub to all events.
    var streamerList = []

    // Cycle through all streams on the page already and add them to array.
    // These are the only ones we need to re-sub to in order to get updates again.
    $(".stream").each(function(index) {
        if ($(this).hasClass('streamembed') === false) {
            var streamName = $(this).find('h2').text();
            streamerList.push(streamName);
        }
    });

    $.each(streamerList, function(index, value) {

        socket.request({
            url: '/api/v1/channels/' + value + '?fields=id,online,token,name,type,partnered',
            method: 'get'
        }, function(body, response) {
            // If response recieved
            if (response.statusCode == 200) {
                var channelID = body.id;
                var cName = body.token;
                var cTitle = body.name;
                if (body.type !== null || body.type !== undefined) {
                    var cGame = body.type.name;
                } else {
                    var cGame = "No Game Set";
                }
                var cPartnered = body.partnered;
                var cOnline = body.online;

                // If channel is offline when added, make title gray.
                if (cOnline === false) {
                    $('#' + channelID + ' h2').addClass('offline');
                };

                // Unfortunately since the channel is always visible in this mode we need to subscribe to all events.
                // Subscribe to channel updates.
                var updateSlug = ["channel:" + channelID + ":update"];
                socket.request({
                    url: '/api/v1/live',
                    method: 'put',
                    params: {
                        slug: updateSlug
                    }
                }, function(body, response) {
                    if (response.statusCode == 200) {
                        socket.on(updateSlug, function(data) {
                            onChannelUpdate(channelID, cName, cTitle, cGame, data, cPartnered);
                        });
                    } else if (response.statusCode == 420) {
                        console.error('Too many subscriptions');
                    } else {
                        console.error('There was an error subbing to the channel update event.', cName);
                    }
                });

                // If partnered subscribe to that channel also.
                if (cPartnered === true) {
                    var updateSlug = ["channel:" + channelID + ":subscribed"];
                    socket.request({
                        url: '/api/v1/live',
                        method: 'put',
                        params: {
                            slug: updateSlug
                        }
                    }, function(body, response) {
                        if (response.statusCode == 200) {
                            // Debug
                            console.log('Subscribed to subscriber channel', cName);
                            socket.on(updateSlug, function(data) {
                                subscriber(channelID);
                            });
                        } else if (response.statusCode == 420) {
                            console.error('Error: Too many subscriptions.');
                            $('#' + channelID + ' .stream-notice').text('Error.');
                        } else {
                            console.error('There was an error subbing to the channel update event.', cName, response.statusCode);
                        }
                    });
                };
            } else {
                console.error('Error checking the online state for the channel', username);
            }
        });
    }); // End each statement
}

// Saved Channels
// This grabs the list of saved channels and adds each of them to the page.
function savedChannels() {
    var savedStreams = localStorage.getItem("streamer");
    if (savedStreams !== undefined && savedStreams !== null && savedStreams !== "") {
        $.each(savedStreams.split(','), function() {
            singleChannelSubscribe(this);
        });
    }
}

// Build Channel
// This function adds the channel to teh page using gathered info.
function buildChannel(channelID, username, title, game, partnered, followers) {

    // If the channel is partnered...
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
        $('#' + channelID + ' .streamtop h2').html('<a href="http://www.beam.pro/' + username + '" target="_blank">' + username + '</a>');
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

// Function to run when someone gets a subscriber.
function subscriber(channelID) {
    console.error('Subscriber Notice fired!');
    var channelDiv = $('#' + channelID + ' .stream-notice');
    $(channelDiv).text('New Sub!');
    $(channelDiv).addClass('subscriber');
    $.when($(channelDiv).fadeIn('fast').delay(10000).fadeOut('fast')).done(function() {
        $(channelDiv).removeClass('subscriber');
    });
    if ($('.notification-sound-input').prop('checked') === true) {
        $('.subscriber-sound')[0].play();
    }
}

// Displays an alert if a new channel comes online that isn't already shown.
function jumperUpdate() {
    var userID = localStorage.getItem('userID');
    if (userID !== '' && userID !== undefined && userID !== null){
        socket.request({
            url: '/api/v1/users/' + userID + '/follows',
            method: 'get'
        }, function(body, response) {
            if (response.statusCode == 200) {
                // Loop through list.
                $.each(body, function(index, element) {
                    var cName = element.token;
                    var partnered = element.partnered;
                    if (partnered === true){
                        var partnered = "partner-notification";
                    }else{
                        var partnered = "regular-notification";
                    }

                    // If channel not suspended and they aren't already on the page (and thus subscribed in websocket)...
                    if (element.suspended !== true && $('#' + element.id).length === 0 && element.online === true) {
                        // Add line to notification box
                        if ( $('.'+cName+'-notification').length < 1){
                            $('.notification').prepend('<div class="'+cName+'-notification notification-name"><span class="'+partnered+'">'+cName+'</span> is online!</div>');
                            // Show notifications if they are not already shown.
                            if ( $('.notification-wrap').is(':visible') === false){
                                $('.notification-wrap').fadeIn('fast');
                                // If sounds checked, played sound.
                                if ($('.notification-sound-input').prop('checked') === true) {
                                    $('.notification-sound')[0].play();
                                }
                            }
                        }

                        // Show scroll bar once notification area hits 300 px tall.
                        if ( $('.notification').height() >= 300){
                            $('.notification').css('overflow-y','scroll');
                        } else{
                            $('.notification').css('overflow-y','hidden');
                        }

                    } else if ( $('#' + element.id).length > 0 && element.online === false ) {
                        // If channel is on the page, but we get an offline response then remove the channel.
                        $('#' + element.id).fadeOut('fast');

                        // Remove their line from the notification box.
                        $('.'+cName+'-notification').remove();
                    }
                });

            } else {
                console.error('Error getting the follower list.');
            }
        });
    }
}

// Function to run every time new data is recieved from the websocket.
function onChannelUpdate(channelID, username, title, game, data, partnered) {
    // Stream Title Update
    if (data.name !== undefined) {
        var wcTitle = data.name;

        var currentTitle = $('#' + channelID + ' .cTitle').text();
        if (currentTitle != wcTitle) {
            $('#' + channelID + ' .cTitle').text(wcTitle);
        }
    }

    // Stream Game Update
    if (data.type !== undefined) {
        var wGame = data.type.name;
        // Channel Game
        var currentGame = $('#' + channelID + ' .cGame').text();
        if (currentGame != wGame) {
            $('#' + channelID + ' .cGame').text(wGame);
        }
    }

    // Follower gained
    // This works by storing the follower numbers on the stream div, then checking to see if the new follower number from the websocket went up.
    // If it did then it will show an alert, otherwise a follower was lost and nothing will happen.
    if (data.numFollowers !== undefined && data.numFollowers > $('#' + channelID).attr('followers')) {
        var channelDiv = $('#' + channelID + ' .stream-notice');
        $(channelDiv).text('New Follower!');
        $(channelDiv).addClass('follower');
        $.when($(channelDiv).fadeIn('fast').delay(8000).fadeOut('fast')).done(function() {
            $(channelDiv).removeClass('follower');
        });

        // Adjust follower number so only positive changes are showed.
        var currentValue = parseInt($('#' + channelID).attr('followers'), 10);
        var newValue = currentValue + 1;
        $('#' + channelID).attr('followers', newValue);
        if ($('.notification-sound-input').prop('checked') === true) {
            $('.follower-sound')[0].play();
        }
    }

    // Cleanup Bot
    // Runs on every websocket response to add or remove people.
    if (data.online !== undefined && $('.cleanup').prop('checked') === true) {
        var onlineStatus = data.online;
        if (onlineStatus === false) {
            // If offline response recieved then fade the channel out and remove it.
            $('#' + channelID).fadeOut(500, function() {
                $(this).remove();
            });
        }
    } else if (data.online !== undefined && $('.cleanup').prop('checked') === false) {
        if (onlineStatus === false) {
            // If autolurk isn't checked and a channel goes offline the streamer name should turn gray.
            $('#' + channelID + ' h2').addClass('offline');
        } else {
            // Otherwise it should change back to default.
            $('#' + channelID + ' h2').removeClass('offline');
        }
    }
}


$(document).ready(function() {
    // Load up past username.
    var localUsername = localStorage.getItem('username');
    $('.followeradd').val(localUsername);

    // Make streams sortable.
    $(".channelwrapper").sortable({
        placeholder: 'stream-placeholder'
    });

    // Load saved streams
    savedChannels();

    // Fade out Ad
    $('.footer').delay(5000).fadeOut('slow');

    // Run notification
    setInterval(function(){
        jumperUpdate();
    }, 60000)

});
