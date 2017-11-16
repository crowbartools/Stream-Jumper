Vue.component('stream-tile', {
    props: ['stream'],
    template: `
        <div class="stream">
            <div class="stream-info">
                <div>
                    <a v-bind:href="channelLink" target="_blank">{{stream.token}}</a>
                </div>
                <div>
                    {{channelGame}}
                </div>
                <div>
                    {{channelTitle}}
                </div>
            </div>
            <iframe allowfullscreen="true"  v-bind:src="channelChatUrl"></iframe>
        </div>
    `,
	computed: {
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
		}
	}
})