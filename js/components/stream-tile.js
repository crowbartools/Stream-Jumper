Vue.component('stream-tile', {
    props: ['stream'],
    data: function() {
        return {
            friendShown: false,
            videoReady: false,
            hover:false
        }
    },
    template: `
        <div class="stream" v-bind:data='channelToken' v-bind:watching='watchStreamCheck'>
            <div class="stream-top">
                <button class="btn btn-danger" v-on:click="removeFriend" v-bind:data='channelToken'>X</button>
            </div>
            <div class="stream-info p-2">
                <div class="streamToken" v-bind:partner="channelPartner">
                    <a v-bind:href="channelLink" target="_blank">{{stream.token}}</a>
                </div>
                <div class="streamGame">
                    {{channelGame}}
                </div>
                <div class="streamTitle">
                    {{channelTitle}}
                </div>
                <div class="streamWatch">
                    <button class="btn" v-on:click="watchStream" v-bind:data='channelToken' v-show="!watchStreamCheck">Watch</button>
                    <button class="btn btn-danger" v-on:click="stopStream" v-bind:data='channelToken' v-show="watchStreamCheck">Stop Watching</button>
                </div>
            </div>
            <div class="streamContent">
                <div class="streamVideo" v-if="watchStreamCheck">
                    <div class="responsiveIframe">
                        <iframe allowfullscreen="true" v-bind:src="channelEmbed" class="video-frame"></iframe>
                    </div>
                </div>
                <div class="thumbnail" v-else @mouseover="hover = true" @mouseleave="hover = false, videoReady = false">
                    <img v-bind:src="channelImgUrl" v-show="videoReady === false">
                    <video autoplay="true" loop="true" @canplay="if(hover) { videoReady = true }" v-if="hover === true" v-show="videoReady === true" v-bind:src="channelVidUrl">                   
                    </video>
                </div>
                <div class="streamChat">
                    <iframe allowfullscreen="true" v-bind:src="channelChatUrl" class="chat-frame"></iframe>
                </div>
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