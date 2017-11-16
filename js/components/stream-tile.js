Vue.component('stream-tile', {
    props: ['stream'],
    template: `
        <div class="stream" v-bind:data='channelToken'>
            <div class="stream-top">
                <button class="btn btn-danger" v-on:click="removeFriend" v-bind:data='channelToken'>X</button>
            </div>
            <div class="stream-info p-2">
                <div class="streamToken" v-bind:partner="channelPartner">
                    <a v-bind:href="channelLink" target="_blank">{{stream.token}}</a>
                </div>
                <div>
                    {{channelGame}}
                </div>
                <div>
                    {{channelTitle}}
                </div>
            </div>
            <iframe allowfullscreen="true"  v-bind:src="channelChatUrl" class="chat-frame"></iframe>
        </div>
    `,
    methods:{
        removeFriend: function(e){
            var friend = e.target.attributes.data.value;
            this.$emit('remove-friend', friend);
        }
    },
	computed: {
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
        }
	}
})