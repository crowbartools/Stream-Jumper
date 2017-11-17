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
			console.log('Making some friends...');
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
		}
    },
	mounted: function() {
		let app = this;
		// When Vue is ready
	}
})