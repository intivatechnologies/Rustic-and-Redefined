<template>
    <class-anim target-class="chat-messenger-container" alternate-classes="transition" ref="chat-messenger-container">
        <div id="chat-messenger">
            <div id="chat-header">
                <button ref="exit-btn">Back To Page</button>
                <class-anim target-class="chat-capture" alternate-classes="transition" ref="chat-capture">
                    <image-loader-clickable @clicked="fileInputClicked" path="icon/capture.png" alt-value="Send an image" />
                    <input type="file" ref="file-upload-btn" id="file-upload-btn" @change="attachmentUploaded"
                        accept="image/png, image/jpg, image/jpeg" hidden />
                </class-anim>
            </div>
            <div id="chat-body" ref="chat-body">
                <class-anim toggle-on-render="true" v-for="message in messages" :key="message.identifier"
                    :target-class="message.isClient ? 'message-client' : 'message-server'" alternate-classes="message">
                    <div v-if="!message.imageContent">
                        {{ message.content }}
                    </div>
                    <div v-else>
                        <img :src="message.imageContent" alt="Your uploaded image" />
                    </div>
                </class-anim>
            </div>
            <div id="chat-input">
                <textarea placeholder="Type Message Here..." ref="input"></textarea>
                <image-loader-clickable @clicked="returnMessage"
                    path="icon/arrow_teal.png" alt-value="Submit Message" ref="input-icon" />
            </div>
        </div>
    </class-anim>
</template>

<script>
    import ClassAnim from '../../anim/class/ClassAnim.vue';
    import ImageLoaderClickable from '../../image/ImageLoaderClickable.vue';
    import Inquiry from '@/assets/js/InquiryScript.js';
    import wait from '@/assets/js/wait.js';

    export default {
        components: {
            ClassAnim,
            ImageLoaderClickable
        },

        data(){
            return {
                isFirstOpen: true,
                inquiry: new Inquiry(),
                messages: [
                    /*
                    {
                        imageContent: '${URL}',
                        content: '',
                        isClient: false,
                        identifier: 0 -> messagesSent
                    }
                    */
                ],
                chatState: 0,
                messagesSent: 0
            }
        },

        methods: {
            locateMessageBottom(){
                wait.millis(100, () => this.$refs['chat-body'].scrollTo(0, this.$refs['chat-body'].clientHeight
                    > this.$refs['chat-body'].scrollHeight ? this.$refs['chat-body'].clientHeight
                    : this.$refs['chat-body'].scrollHeight));
            },

            receiveMessage(options){
                let txt = this.$refs['input'];
                txt.value = '';
                txt.focus(); 
                txt.setSelectionRange(0, 0);

                this.messages.push(options);
                this.locateMessageBottom();
            },

            message(content, isClient = false){
                this.receiveMessage({
                    content: content,
                    isClient: isClient,
                    identifier: this.messagesSent++
                });
            },

            messageImage(imageContent){
                this.receiveMessage({
                    imageContent: imageContent,
                    isClient: true,
                    identifier: this.messagesSent++
                });
            },

            toggleNative(){
                this.$refs['chat-messenger-container'].toggle();
                if(this.$refs['chat-messenger-container'].isToggled() && this.isFirstOpen){
                    this.isFirstOpen = false;
                    wait.millis(500, () => this.message(
                        "Hello. This is an automated message service where I can view any inquiries"
                        + " or suggestions. To start this process, what is your email?"
                    ));
                }
            },

            toggle(){
                this.toggleNative();
                this.$emit('exited');
            },

            returnMessage(prevIsImageContent = false){
                if(!prevIsImageContent){
                    let msg = this.$refs['input'].value;
                    if(msg.length > 0){
                        this.message(msg, true);

                        wait.millis(500, () => {
                            switch(this.chatState){
                                case 0:
                                    if(msg.includes('@')){
                                        ++this.chatState;
                                        this.inquiry.email = msg;
                                        this.message("Before we hear your message, what is your name?");
                                    } else
                                        this.message("Your email must be valid. Please try again.");
                                    break;
                                case 1:
                                    ++this.chatState;
                                    this.inquiry.name = msg;
                                    this.message(`Nice to meet you, ${msg}. How can we help?`);
                                    this.$refs['chat-capture'].toggle();
                                    break;
                                case 2:
                                    ++this.chatState;
                                    this.inquiry.addMessage(msg);
                                    this.message("Are you ready to send? Please type Yes to submit,"
                                        + " or No to continue your message.");
                                    break;
                                case 3:
                                    if(msg.toLowerCase() === "yes"){
                                        ++this.chatState;
                                        this.message("Please wait until the message finishes sending...");
                                        this.$refs['chat-capture'].toggle();

                                        let exitChat = () => {
                                            wait.millis(1400, () => {
                                                this.toggle();
                                                wait.millis(500, () => {
                                                    //reset data
                                                    this.isFirstOpen = true;
                                                    this.inquiry = new Inquiry();
                                                    this.messages = [];
                                                    this.chatState = 0;
                                                    this.messagesSent = 0;
                                                });
                                            })
                                        };

                                        let responseCount = 0;
                                        let checkResponse = window.setInterval(() => {
                                            if(++responseCount * 200 >= 2600 && !this.inquiry.isStatusComplete()){
                                                this.message("Message failed to send. Please ensure your WiFi is active.");
                                                exitChat();
                                                window.clearInterval(checkResponse);
                                            } else if(this.inquiry.isStatusComplete()){
                                                this.message("Thank you for reaching out to us! We will get"
                                                    + " back to you shortly.");
                                                exitChat();
                                                window.clearInterval(checkResponse);
                                            }
                                        }, 200);
                                        this.inquiry.submit();
                                    } else {
                                        --this.chatState;
                                        this.message("By all means, continue on!");
                                    }
                                    break;
                            }
                        });
                    }
                } else {
                    wait.millis(500, () => {
                        this.chatState = 3;
                        if(this.inquiry.messages.length == 0)
                            this.inquiry.messages.push("");
                        this.message("Are you ready to send? Please type Yes to submit, or No to continue your message.");
                    });
                }
            },

            keyPressed(){
                if(window.event.keyCode == 13)
                    this.returnMessage();
            },

            fileInputClicked(){
                this.$refs['file-upload-btn'].click();
            },

            attachmentUploaded(ev){
                if(this.inquiry.attachmentAmount < 4){
                    this.messageImage(URL.createObjectURL(ev.target.files[0]));
                    this.inquiry.addAttachment(ev.target.files[0]);
                } else
                    this.message("Image attachments are at full capacity.");

                this.returnMessage(true);
            }
        },

        mounted(){
            this.$refs['exit-btn'].addEventListener("click", this.toggle);
            this.$refs['input'].addEventListener("keypress", this.keyPressed);
        },

        beforeUnmount(){
            this.$refs['exit-btn'].removeEventListener("click", this.toggle);
            this.$refs['input'].removeEventListener("keypress", this.keyPressed);
        }
    }
</script>

<style>
    .chat-messenger-container, .chat-messenger-container-anim{
        position: fixed;
        bottom: 8pt;
        right: 2pt;
        opacity: 0;
        pointer-events: none;
    }

    .chat-messenger-container-anim{
        right: 8pt;
        opacity: 1;
        pointer-events: auto;
    }

    #chat-messenger{
        width: 225pt;
        height: 425pt;
        background-color: white;
        display: block;
        border-radius: 8pt;
        border: solid rgb(25, 25, 25) 2pt;
    }

    #chat-header{
        background-color: #FFD55E;
        color: rgb(25, 25, 25);
        border-bottom: solid rgb(25, 25, 25) 2pt;
        box-shadow: 2px 4px 8px #888888;
        border-radius: 8pt 8pt 0 0;
        height: 34pt;
        padding-left: 8pt;
    }

    button{
        background: none;
        background-color: rgb(25, 25, 25);
        color: white;
        font-weight: 600;
        font-size: 12pt;
        font-family: 'Archivo Narrow', sans-serif;
        height: 24pt;
        border-radius: 4pt;
        border: none;
        cursor: pointer;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        display: inline-block;
    }

    .chat-capture, .chat-capture-anim{
        position: absolute;
        right: 5pt;
        top: 4pt;
        margin-left: -8pt;
        opacity: 0;
        pointer-events: none;
    }

    .chat-capture-anim{
        margin-left: 0;
        opacity: 1;
        pointer-events: auto;
    }

    .chat-capture img, .chat-capture-anim img{
        width: 30pt;
    }

    #chat-body{
        overflow-y: auto;
        height: calc(100% - 34pt - 50pt);
    }

    .message{
        transition: 0.2s;
        padding: 8pt;
        max-width: 250pt;
        opacity: 0;
        pointer-events: none;
        border-radius: 8pt;
        margin: 12pt 0 0 8pt;
    }

    .message img{
        width: 80pt;
    }

    .message-client-anim, .message-server-anim{
        margin-top: 8pt;
        opacity: 1;
        pointer-events: auto;
    }

    .message-client, .message-client-anim{
        background-color: #FFD55E;
    }

    .message-server, .message-server-anim{
        background-color: rgb(25, 25, 25);
        color: white;
    }

    #chat-body .message:last-child{
        margin-bottom: 12pt;
    }

    #chat-input{
        width: 100%;
        height: 50pt;
        border-top: solid black 1pt;
    }

    #chat-input textarea{
        border-radius: 0 0 0 8pt;
        resize: none;
        font-family: Inter, sans-serif;
        font-size: 12pt;
        border: none;
        height: calc(100% - 6pt);
        display: inline-block;
        width: calc(100% - 53.5pt);
    }

    #chat-input textarea, #chat-input textarea:focus{
        outline: none;
    }

    #chat-input img{
        height: 40pt;
        width: 40pt;
        position: relative;
        bottom: 6pt;
        left: 4pt;
        cursor: pointer;
    }

    @media only screen and (min-width: 1025px){
        #chat-messenger{
            width: 300pt;
            height: 450pt;
        }

        #chat-body{
            height: 366pt;
        }

        /*
        .message-client, .message-client-anim{
            margin-left: 116pt;
        }
            */
    }
</style>