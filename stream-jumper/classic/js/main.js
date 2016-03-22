// Case insensitive contains selector
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
    return function(elem) {
        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});
// Initial Load
if (localStorage.getItem("streamer") === null || localStorage.getItem("streamer") === '') {
    localStorage.setItem("streamer", '');
}
var initialList = localStorage.getItem("streamer");
var noEmptyComma = initialList.replace('null', '').replace(/^,*|,(?=,)|,$/g, '');
var streamerArray = noEmptyComma.split(',');

// Load up all past saved streams.
if (streamerArray == '') {
    //Nothing to load.
} else {
    $.each(streamerArray, function(i, val) {
        // Create chat boxes
        $('.channelwrapper').append('<div class="channel" id="' + val + '"><button class="removeChannel">x</button><h2><a href=https://beam.pro/' + val + ' target="_blank">' + val + '</a></h2><div class="watchlink"><button class="watchstream">Watch Stream</button></div><iframe class="chatembed" src=https://beam.pro/embed/chat/' + val + '></iframe></div>');
		
        // Test each for live
        $.getJSON("https://beam.pro/api/v1/channels/" + val, function(data) {
            var dataString = JSON.stringify(data, function(key, value){
			if(value === null){
				return "";
			}
			return value;
			});
	        var strippedString =  dataString.replace(/(<([^>]+)>)/ig,"");
	        var parsedData = JSON.parse(strippedString);
            var username = parsedData.token;
            var status = parsedData.online;
            var streamtitle = parsedData.name;
            var gamename = parsedData.type.name;
			
            if (status == true) {
                var modifiedstatus = "online";
            } else {
                var modifiedstatus = "offline";
            }
			if(gamename === undefined){
				gamename = "No Game Set."
			}
			if(streamtitle === undefined || streamtitle === null){
				streamtitle = "No Title Set."
			}
            $('.channel h2:Contains(' + username + ')').append(' <p class="status">- ' + modifiedstatus + '</p>');
            $('.channel h2:Contains(' + username + ')').after('<p class="streamtitle">' + streamtitle + '</p>').after('<p class="gamename">' + gamename + '</p>');
        })
		
		// Watch Stream
	    $('#' + val + ' .watchstream').click(function() {
	        $('#'+val).before('<div class="stream"><button class="stopwatching">x</button><h2>'+val+'</h2><div class="streamembedwrap"><iframe class="streamembed" src=https://beam.pro/embed/player/' + val + '></iframe></div></div>');
			$('.stopwatching').click(function() {
				$(this).closest('.stream').remove();
			});
	    });

		//Remove button
		$('#' + val + ' .removeChannel').click(function() {
			var streamNameRemove = $(this).closest('.channel').attr('id');
			console.log('Removing ' + streamNameRemove);
			$(this).closest('.channel').remove();
			var pastRemoves = localStorage.getItem("streamer")
            var newString = removeValue(pastRemoves, streamNameRemove, ',')
			localStorage.setItem("streamer", newString);
		});

    });
}

// Remove item from comma separated list and return a new clean list.
var removeValue = function(list, value, separator) {
  separator = separator || ",";
  var values = list.split(separator);
  for(var i = 0 ; i < values.length ; i++) {
    if(values[i] == value) {
      values.splice(i, 1);
      return values.join(separator);
    }
  }
  return list;
}

// If username has been entered in the add online followed box in the past put it in the box.
	function userName(){
		var username = localStorage.getItem("username");
		if (username == undefined || username == null){
			console.log('No username saved.')
		} else {
			$('.followeradd').val(username);
		}	
	}
	userName();

// Add Username
$('.streamerinputaddbtn').click(function() {
    var streamNameAdd = $('.streamerinputadd').val();
    if (streamNameAdd != ''){
        if ( $('#'+streamNameAdd).length == 0 ){
            addStreamer(streamNameAdd);
            var pastAdds = localStorage.getItem("streamer")
            if (pastAdds === undefined || pastAdds === null || pastAdds == ''){
                localStorage.setItem("streamer", streamNameAdd);
            }else{
                localStorage.setItem("streamer", pastAdds + "," + streamNameAdd);
            }
        }else{
            alert(streamNameAdd+' is already in your list!');
        } 
        $('.streamerinputadd').val('');
    }
});

// Add all people a username is following
$('.followeraddbtn').click(function() {
    var username = $('.followeradd').val();
    checkUserId(username);
    $('.lurk-wrap').css('visibility','visible');
});
// Add all people a username is following functions
function checkUserId(username){
	$.getJSON("https://beam.pro/api/v1/channels/" + username, function(data) {
		var dataString = JSON.stringify(data, function(key, value){
			if(value === null){
				return "";
			}
			return value;
		});
        var strippedString =  dataString.replace(/(<([^>]+)>)/ig,"");
        var parsedData = JSON.parse(strippedString);
		userId = parsedData.userId;
		username = parsedData.token;
		addAllFollows(userId);
		localStorage.setItem("username", username);
	})
}
function addAllFollows(username){
	$.getJSON("https://beam.pro/api/v1/users/"+username+"/follows", function(data) {
		var dataString = JSON.stringify(data, function(key, value){
			if(value === null){
				return "";
			}
			return value;
		});
        var parsedData = JSON.parse(dataString);
		var time = 2000;
        $.each(data, function(index, element) {
			setTimeout( function(){ 
				var streamerName = element.token;
				if(element.online == 1 && $('#'+streamerName).length == 0){
					addStreamer(streamerName);
				}

			}, time)
			time += 2000;
        });

	})
};

// Create all chat boxes and test for live.
function addStreamer(val) {
    // Create chat boxes
    $('.channelwrapper').append('<div class="channel" id="' + val + '"><button class="removeChannel">x</button><h2><a href=https://beam.pro/' + val + ' target="_blank">' + val + '</a></h2><div class="watchlink"><button class="watchstream">Watch Stream</a></div><iframe class="chatembed" src=https://beam.pro/embed/chat/' + val + '></iframe></div>');

    // Test each for live
    $.getJSON("https://beam.pro/api/v1/channels/" + val, function(data) {
        var dataString = JSON.stringify(data, function(key, value){
			if(value === null){
				return "";
			}
			return value;
		});
        var strippedString =  dataString.replace(/(<([^>]+)>)/ig,"");
        var parsedData = JSON.parse(strippedString);
        var username = parsedData.token;
        var status = parsedData.online;
		var streamtitle = parsedData.name;
		var gamename = parsedData.type.name;
        if (status == true) {
            var modifiedstatus = "online";
        } else {
            var modifiedstatus = "offline";
        }
		if(gamename === undefined){
			gamename = "No Game Set."
		}
		if(streamtitle === undefined || streamtitle === null){
			streamtitle = "No Title Set."
		}
        $('.channel h2:Contains(' + username + ')').append(' <p class="status">- ' + modifiedstatus + '</p>');
        $('.channel h2:Contains(' + username + ')').after('<p class="streamtitle">' + streamtitle + '</p>').after('<p class="gamename">' + gamename + '</p>');
    })

	// Watch Stream
    $('#' + val + ' .watchstream').click(function() {
        $('#'+val).before('<div class="stream"><button class="stopwatching">x</button><h2>'+val+'</h2><div class="streamembedwrap"><iframe class="streamembed" src=https://beam.pro/embed/player/' + val + '></iframe></div></div>');
		$('.stopwatching').click(function() {
			$(this).closest('.stream').remove();
		});
    });
	//Remove button
	$('#' + val + ' .removeChannel').click(function() {
			var streamNameRemove = $(this).closest('.channel').attr('id');
			console.log('Removing ' + streamNameRemove);
			$(this).closest('.channel').remove();
			var pastRemoves = localStorage.getItem("streamer")
			var newString = pastRemoves.replace(streamNameRemove, '');
			localStorage.setItem("streamer", newString);
	});
};

// Updates every 60 seconds.
function updateStatus() {

    $('.channel').each(function(index) {
        var val = $(this).attr('id');

        // Test each for live
        $.getJSON("https://beam.pro/api/v1/channels/" + val, function(data) {
            var dataString = JSON.stringify(data, function(key, value){
			if(value === null){
				return "";
			}
			return value;
			});
	        var strippedString =  dataString.replace(/(<([^>]+)>)/ig,"");
	        var parsedData = JSON.parse(strippedString);
            var username = parsedData.token;
            var status = parsedData.online;
            var streamtitle = parsedData.name;
            var gamename = parsedData.type.name;
            if (status == true) {
                var modifiedstatus = "online";
            } else {
                var modifiedstatus = "offline";
            }
            $('#' + val + ' .status').html(' - ' + modifiedstatus);
            $('#' + val + ' .streamtitle').html(streamtitle);
            $('#' + val + ' .gamename').html(gamename);

            // Auto Lurk
            var autoLurkCheck = $('.auto-lurk').is(":checked");
    		var savedName = localStorage.getItem('username');
            // If auto lurk is on and channe is offline then delete it.
		    if ( autoLurkCheck === true && modifiedstatus == "offline"){
		    	$('#'+val).remove();
		    }
        })
    });

	// If auto lurk is on add all online follows.
	var autoLurkCheck = $('.auto-lurk').is(":checked");
	var savedName = localStorage.getItem('username');
    if ( autoLurkCheck === true && savedName != null && savedName != undefined && savedName != ""){
    	checkUserId(savedName);
    }

}

// Set initial show hide button text
function uiHider(){
    var visible = $('.info').is(':visible');
    if( visible == true){
        $('.uihide').text('Hide UI');
    } else {
        $('.uihide').text('Show UI');
    }
}

$(document).ready(function() {
    //60 seconds is 60000 - Update channel status at that time.
    setInterval(function() {
        updateStatus();
    }, 60000);

    // UI Hider
    uiHider();
    $('.uihide').click(function() {
        $('.info').slideToggle();
        var btnText = $('.uihide').text();
        if (btnText == 'Hide UI'){
            $('.uihide').text('Show UI');
        }else{
            $('.uihide').text('Hide UI');
        }
    });


    // Only show auto lurk if username has been entered before.
	var savedName = localStorage.getItem('username');
    if (savedName != null && savedName != undefined && savedName != ""){
    	$('.lurk-wrap').css('visibility','visible');
    }
	
	// Sortable
	$(function() {
        $( ".channelwrapper" ).sortable({ 
            placeholder: "stream-placeholder" 
        });
    });

});