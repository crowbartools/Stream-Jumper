new Vue({
    el: '#app',
    mixins: [friendFetcher],
    data: {
        user: null,
		friends: [],
		friendsShown: [],
		showSettings: false
    },
    methods: {
        findMixerId: function() {
			return this.getMixerId();
		},
        fetchFriends: function() {
			return new Promise((resolve, reject) => {
				var app = this;
				var username = this.user;
				if(username != null){
					app.outputMixerFollows(username)
					.then((res) => {
						app.friends = res;
						resolve(true);
					}, (err) => {
						console.log(err);
						reject(false);
					});
					
					// Run cleanup.
					this.cleanStreams();
				} else {
					reject('No user logged in. Skipping api call.');
				}
			});
		},
		addFriend: function(friend){
			let app = this;
			let arr = this.friends;
			let obj = arr.find(o => o.token === friend);
			this.friendsShown.push(obj);
		},
		removeFriend: function(friend){
			let app = this;
			let arr = this.friendsShown;
			let obj = arr.find(o => o.token === friend);
			let index = arr.indexOf(obj);
			arr.splice(index, 1);
		},
		addAllFriends: function(){
			let app = this;
			this.showSettings = false;
			this.friendsShown = this.friends;
		},
		watchStream: function(friend){
			let app = this;
			let arr = this.friendsShown;
			let obj = arr.find(o => o.token === friend);
			obj.watchVideo = true;
		},
		stopStream: function(friend){
			let app = this;
			let arr = this.friendsShown;
			let obj = arr.find(o => o.token === friend);
			obj.watchVideo = false;
		},
		updateUsername: function(username){
			let app = this;
			this.user = username;
			this.friends = [];
			this.friendsShown = [];
			this.fetchFriends();
			this.setStorage('username', username, 30);
		},
		cleanStreams: function(){
			let app = this;
			// Cycle through friends that are showing.
			for(friend in this.friendsShown){
				friend = this.friendsShown[friend];
				let friendsArray = this.friends,
					friendsShownArray = this.friendsShown;

				// If friend is showing, but not in main friends array then they are offline.
				let obj = friendsArray.find(o => o.token === friend.token);
				if(obj === null || obj === undefined){
					// This person is offline.
					if(friend.offlineStrikes >= 5){
						// Person has been offline for 5 checks (5 min roughly).
						console.log(friend.token + ' has been offline for awhile. Removing them.');
						let index = friendsShownArray.indexOf(friend);
						friendsShownArray.splice(index, 1);
					} else if (friend.offlineStrikes >= 0){
						// Person has not struck out yet. Count up one.
						console.log(friend.token + ' is offline and has ' + friend.offlineStrikes + '/5 strikes.');
						friend.offlineStrikes = friend.offlineStrikes + 1;
					} else {
						// We don't have offline strikes yet for some reason. Set it to one.
						friend.offlineStrikes = 1;
					}
				} else {
					// This person is online again! Set strikes to zero.
					friend.offlineStrikes = 0;
				}
			}			
		},
		setStorage: function(name, value){
			localStorage.setItem(name, value);
		},
		getStorage: function(name){
			let savedValue = localStorage.getItem(name);
			if(savedValue != null){
				return savedValue
			}
			return null;
		},
		setStorageUsername: function(){
			// This will set the username in the app based on saved cookies from past sessions.
			let savedName = this.getStorage('username');
			console.log(savedName);
			if(savedName != null){
				this.user = savedName;
			}
		}
    },
	mounted: function() {
		// When Vue is ready
		this.setStorageUsername();

		// Friend loop
		setInterval(function(){ 
			this.fetchFriends();
		}.bind(this), 60000);
	}
})