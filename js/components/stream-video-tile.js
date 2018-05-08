Vue.component('stream-video-tile', {
    props: ['stream', 'videos'],
    template: `
        <div class="stream-bar-video">
            <iframe allowfullscreen="true" v-bind:src="channelEmbed" class="video-frame"></iframe>
            <div class="friend-header">
                <span class="friendName">{{stream.token}}</span>
                <span class="friendViewers">{{stream.viewersCurrent}}</span>
            </div>
            <div class="info-container">
                <div class="stream-game">
                    {{channelGame}}
                </div>
                <div class="stream-title">
                    {{channelTitle}}
                </div>
            </div>
            <div class="stream-buttons">
                <button class="btn btn-danger" v-on:click="removeFriend" v-bind:data='channelToken'">Remove</button>
            </div>
        </div>
    `,
    methods:{
        removeFriend: function(e){
            let friend = e.target.attributes.data.value;
            this.$emit('remove-friend', friend);
        },
        watchStream: function(e){
            let friend = e.target.attributes.data.value;
            this.$emit('watch-stream', friend);
        },
        stopStream: function(e){
            let friend = e.target.attributes.data.value;
            this.$emit('stop-stream', friend);
        }
    },
	computed: {
        watchStreamCheck: function(){
            console.log(`${this.stream.watchVideo}`);
            return this.stream.watchVideo;
        },
        channelPartner: function(){
            return `${this.stream.partnered}`;
        },
        channelChatUrl: function() {
            return `https://mixer.com/embed/chat/${this.stream.id}`;
        },
		channelImgUrl: function() {
			return `https://thumbs.mixer.com/channel/${this.stream.id}.small.jpg`;
		},
		channelVidUrl: function() {
			return `https://thumbs.mixer.com/channel/${this.stream.id}.m4v`;
		},
		channelLink: function(){
			return `https://mixer.com/${this.stream.token}`;
		},
		channelTitle: function(){
			return `${this.stream.name}`;
		},
		channelGame: function(){
			return `${this.stream.type.name}`;
		},
        channelToken: function(){
            return `${this.stream.token}`;
        },
        channelEmbed: function(){
            return `https://mixer.com/embed/player/${this.stream.id}`
        }
	}
})