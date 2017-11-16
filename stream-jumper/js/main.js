new Vue({
    el: '#app',
    mixins: [friendFetcher],
    data: {
        user: 'Firebottle',
        friends: []
    },
    methods: {
        findMixerId: function() {
			return this.getMixerId();
		},
        fetchFriends: function(username) {
			console.log('Making some friends...');
			return new Promise((resolve, reject) => {
				var app = this;
				app.outputMixerFollows(username)
					.then((res) => {
                        app.friends = res;
						resolve(true);
					}, (err) => {
						console.log(err);
						reject(false);
                    });
			});
		}
    },
	mounted: function() {
		var app = this;
		// When Vue is ready
		app.fetchFriends(app.user);
	}
})