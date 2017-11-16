new Vue({
    el: '#app',
    mixins: [friendFetcher],
    data: {
        user: 'Firebottle',
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
				app.outputMixerFollows(username)
					.then((res) => {
                        app.friends = res;
						resolve(true);
					}, (err) => {
						console.log(err);
						reject(false);
                    });
			});
		},
		addFriend: function(friend){
			let app = this;
			let arr = app.friends;
			let obj = arr.find(o => o.token === friend);
			this.friendsShown.push(obj);
		},
		removeFriend: function(friend){
			let app = this;
			let arr = app.friendsShown;
			let obj = arr.find(o => o.token === friend);
			let index = arr.indexOf(obj);
			arr.splice(index, 1);
		}
    },
	mounted: function() {
		let app = this;
		// When Vue is ready
		//app.fetchFriends(app.user);
	}
})