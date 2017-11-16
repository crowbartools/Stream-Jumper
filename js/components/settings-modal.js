Vue.component('friend-list-item', {
    props: ['stream', 'shown'],
    data: function() {
        return {
            friendShown: false,
            videoReady: false,
            hover:false
        }
    },
    template: `
        <li>
            <div class="thumbnail" @mouseover="hover = true" @mouseleave="hover = false, videoReady = false">
                <img v-bind:src="channelImgUrl" v-show="videoReady === false">
                <video autoplay="true" loop="true" @canplay="if(hover) { videoReady = true }" v-if="hover === true" v-show="videoReady === true" v-bind:src="channelVidUrl">                   
                </video>
                <div class="friend-header">
                    <span class="friendName">{{stream.token}}</span>
                    <span class="friendViewers">{{stream.viewersCurrent}}</span>
                </div>
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
                <button class="btn btn-primary" v-on:click="addFriend" v-bind:data='channelToken' v-show="friendCheck(channelToken) === false">Add</button>
                <button class="btn btn-danger" v-on:click="removeFriend" v-bind:data='channelToken' v-show="friendCheck(channelToken)">Remove</button>
            </div>
        </li>
    `,
    methods:{
        addFriend: function(e){
            // This will add a friend to the list.
            var friend = e.target.attributes.data.value;
            this.$emit('add-friend', friend);
            this.friendShown = true;
        },
        removeFriend: function(e){
            // This will remove a friend from the list.
            var friend = e.target.attributes.data.value;
            this.$emit('remove-friend', friend);
            this.friendShown = false;
        },
        friendCheck: function(friend){
            // Checks to see if a friend is shown or not.
            let arr = this.shown;
            let obj = arr.find(o => o.token === friend);
            let index = arr.indexOf(obj);
            if(index > -1){
                return true
            } else {
                return false
            }
        }
    },
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
        },
        channelToken: function(){
            return `${this.stream.token}`;
        }
	}
});

Vue.component('settings-modal', {
    template: `
        <transition name="modal">
            <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Settings</h2>
                        <button class="modal-default-button btn btn-danger" @click="$emit('close')">
                            X
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="onlineLabel">
                            <span class="setting-title">Online Friends</span>
                            <button class="btn btn-primary" @click="$emit('add-all-friends')">Add All</button>
                        </div>
                        <div class="online-friends">
                            <slot name="friendList">No Friends!</slot>
                        </div>
                    </div>

                    <div class="modal-footer">
                        Footer
                    </div>
                </div>
            </div>
            </div>
        </transition>
    `
})