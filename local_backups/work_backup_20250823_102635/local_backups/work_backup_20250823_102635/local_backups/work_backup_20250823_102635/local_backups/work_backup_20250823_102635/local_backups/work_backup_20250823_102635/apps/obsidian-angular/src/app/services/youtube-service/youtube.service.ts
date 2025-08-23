import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

declare global {
    interface Window { 
      YT: any;
      onYouTubeIframeAPIReady:any;
       }
}
window.YT = window.YT || {};

export interface MediaSource {
  type: 'youtube' | 'local-mp3' | 'local-video';
  url?: string;
  file?: File;
  videoId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

	public yt_player:any;
	public playerState:number=-1;
	public htmlId:any='player';
	public videoLink:string='';
	public videoId:string='';

  // Local media player
  public localPlayer: HTMLAudioElement | HTMLVideoElement | null = null;
  public currentMediaSource: MediaSource | null = null;

  //Subject
  public apiReady:any;
  public ready:any; 
  public curPos:any;
  public interval:any;//interval

  constructor() { 
    this.apiReady = new Subject();
    this.ready = new Subject();
    this.curPos = new Subject();
  }

  // Load media from various sources
  loadMedia(source: MediaSource) {
    console.log('🎬 YoutubeService.loadMedia called with source:', source);
    this.currentMediaSource = source;
    
    switch (source.type) {
      case 'youtube':
        console.log('🌐 Loading YouTube media');
        if (source.url) {
          this.createVideo(source.url);
        }
        break;
      case 'local-mp3':
        console.log('🎵 Loading local MP3 media');
        if (source.file) {
          this.loadLocalAudio(source.file);
        }
        break;
      case 'local-video':
        console.log('🎬 Loading local video media');
        if (source.file) {
          this.loadLocalVideo(source.file);
        }
        break;
    }
  }

  // Load local MP3 file
  loadLocalAudio(file: File) {
    console.log('🎵 YoutubeService.loadLocalAudio called for:', file.name);
    this.destroy(); // Clean up existing player
    
    const audioUrl = URL.createObjectURL(file);
    console.log('🔗 Created audio URL:', audioUrl);
    this.localPlayer = new Audio(audioUrl);
    console.log('🎵 Audio element created');
    this.setupLocalPlayerEvents();
    console.log('🎧 Local player events set up');
    
    // Update the DOM element
    const container = document.getElementById(this.htmlId);
    if (container) {
      console.log('📦 Found container, updating DOM');
      container.innerHTML = '';
      container.appendChild(this.localPlayer);
      console.log('✅ Audio element added to DOM');
    } else {
      console.log('❌ Container not found:', this.htmlId);
    }
    
    this.ready.next(`local-audio:${file.name}`);
    console.log('✅ Local audio ready event sent');
  }

  // Load local video file
  loadLocalVideo(file: File) {
    console.log('🎬 YoutubeService.loadLocalVideo called for:', file.name);
    this.destroy(); // Clean up existing player
    
    const videoUrl = URL.createObjectURL(file);
    console.log('🔗 Created video URL:', videoUrl);
    this.localPlayer = document.createElement('video');
    this.localPlayer.src = videoUrl;
    this.localPlayer.controls = true;
    console.log('🎬 Video element created');
    this.setupLocalPlayerEvents();
    console.log('🎧 Local player events set up');
    
    // Update the DOM element
    const container = document.getElementById(this.htmlId);
    if (container) {
      console.log('📦 Found container, updating DOM');
      container.innerHTML = '';
      container.appendChild(this.localPlayer);
      console.log('✅ Video element added to DOM');
    } else {
      console.log('❌ Container not found:', this.htmlId);
    }
    
    this.ready.next(`local-video:${file.name}`);
    console.log('✅ Local video ready event sent');
  }

  // Setup event listeners for local media player
  setupLocalPlayerEvents() {
    console.log('🎧 setupLocalPlayerEvents called');
    if (!this.localPlayer) {
      console.log('❌ No local player to set up events for');
      return;
    }

    this.localPlayer.addEventListener('play', () => {
      console.log('▶️ Local player play event');
      this.playerState = 1;
      this.curPos.next('play');
      this.startPositionTracking();
    });

    this.localPlayer.addEventListener('pause', () => {
      console.log('⏸️ Local player pause event');
      this.playerState = 2;
      this.curPos.next('pause');
      this.stopInterval();
    });

    this.localPlayer.addEventListener('ended', () => {
      console.log('⏹️ Local player ended event');
      this.playerState = 0;
      this.curPos.next('stop');
      this.stopInterval();
    });

    this.localPlayer.addEventListener('timeupdate', () => {
      if (this.localPlayer) {
        this.curPos.next(this.localPlayer.currentTime);
      }
    });

    this.localPlayer.addEventListener('loadeddata', () => {
      console.log('📊 Local player loadeddata event');
    });

    this.localPlayer.addEventListener('canplay', () => {
      console.log('🎵 Local player canplay event');
    });

    this.localPlayer.addEventListener('error', (e) => {
      console.error('❌ Local player error event:', e);
    });

    console.log('✅ Local player events set up');
  }

  // Start tracking position for local media
  startPositionTracking() {
    console.log('⏱️ startPositionTracking called');
    this.stopInterval();
    this.interval = setInterval(() => {
      if (this.localPlayer && !this.localPlayer.paused) {
        this.curPos.next(this.localPlayer.currentTime);
      }
    }, 100);
    console.log('✅ Position tracking started');
  }

  // Create YouTube video (existing method, updated)
  createVideo(link:string){
    console.log('🌐 YoutubeService.createVideo called with link:', link);
    if(link) {
      let id = (new URL(link)).searchParams.get('v');
      if(id == '')
        throw "Youtube Service : changeVideo() => no v parameter in url !";

      this.videoLink = link;
      this.videoId = id;
      console.log('🎬 YouTube video ID:', this.videoId);
    }

    // Ensure YouTube API is loaded
    if (!window.YT || !window.YT.Player) {
      console.log('🔌 YouTube API not loaded, adding to DOM');
      this.addApiToDom();
      // Wait for API to be ready
      this.apiReady.subscribe(() => {
        console.log('✅ YouTube API ready, creating player');
        this.createYouTubePlayer();
      });
    } else {
      console.log('✅ YouTube API already loaded, creating player');
      this.createYouTubePlayer();
    }
  }

  private createYouTubePlayer() {
    this.yt_player = null;
    console.log('🎬 Creating YouTube player for element:', this.htmlId);
    
    // Check if the player element exists
    const playerElement = document.getElementById(this.htmlId);
    if (!playerElement) {
      console.error('❌ YouTube player element not found:', this.htmlId);
      console.log('🔍 Available elements with "player" in ID:');
      document.querySelectorAll('[id*="player"]').forEach(el => {
        console.log('  -', el.id, el.tagName, el.className);
      });
      return;
    }
    
    // Check if the element is visible and accessible
    const rect = playerElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️ YouTube player element has zero dimensions, might be hidden:', this.htmlId);
      console.log('  - Element dimensions:', rect.width, 'x', rect.height);
      console.log('  - Element display:', window.getComputedStyle(playerElement).display);
      console.log('  - Element visibility:', window.getComputedStyle(playerElement).visibility);
    }
    
    try {
      this.yt_player = new window.YT.Player(this.htmlId, {
        height: '460',
        width: '640',
        videoId: this.videoId,
        playerVars: {
          autoplay: 0, 
          controls: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          disablekb: 1,
          rel: 0,
          showinfo: 0,
          loop: 1,
          playlist: this.videoId,
          fs: 1,
          mute: 1  // Always mute the player
        },
        events: {
          'onReady': ()=>{
            console.log('✅ YouTube player ready - ensuring muted state');
            this.yt_player.mute();
            this.yt_player.pauseVideo();
            this.ready.next(this.videoLink)
          },
          'onStateChange': (s)=>{
            console.log('🔄 YouTube player state change:', s.data);
            // Ensure player stays muted on any state change
            if (this.yt_player && this.yt_player.mute) {
              this.yt_player.mute();
            }
            this.onStateChange(s);
          }
        }
      });
      console.log('✅ YouTube player created successfully');
    } catch (error) {
      console.error('❌ Error creating YouTube player:', error);
    }
  }

  // Check if player element is visible and create player if needed
  checkAndCreatePlayer() {
    console.log('🔍 Checking if player element is now visible');
    const playerElement = document.getElementById(this.htmlId);
    
    if (playerElement) {
      const rect = playerElement.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      
      console.log('📏 Player element dimensions:', rect.width, 'x', rect.height, 'Visible:', isVisible);
      
      if (isVisible && !this.yt_player && this.videoId) {
        console.log('✅ Player element is now visible, creating YouTube player');
        this.createYouTubePlayer();
      }
    } else {
      console.log('❌ Player element still not found:', this.htmlId);
    }
  }

  // Play media (works for both YouTube and local media)
  playMedia() {
    console.log('▶️ playMedia called, current source:', this.currentMediaSource?.type);
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      console.log('🌐 YouTube media - only seeking for video display (no audio)');
      // Don't actually play YouTube, just ensure it's muted and at current position
      this.yt_player.mute();
    } else if (this.localPlayer) {
      console.log('🎵 Playing local media');
      this.localPlayer.play();
    } else {
      console.log('ℹ️ No media player available - no media has been loaded yet');
    }
  }

  // Pause media (works for both YouTube and local media)
  pauseMedia() {
    console.log('⏸️ pauseMedia called, current source:', this.currentMediaSource?.type);
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      console.log('🌐 YouTube media - only seeking for video display (no audio)');
      // Don't actually pause YouTube, just ensure it's muted
      this.yt_player.mute();
    } else if (this.localPlayer) {
      console.log('🎵 Pausing local media');
      this.localPlayer.pause();
    }
  }

  // Stop media (works for both YouTube and local media)
  stopMedia() {
    console.log('⏹️ stopMedia called, current source:', this.currentMediaSource?.type);
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      console.log('🌐 YouTube media - seeking to beginning for video display (no audio)');
      this.yt_player.seekTo(0, true);
      this.yt_player.mute();
    } else if (this.localPlayer) {
      console.log('🎵 Stopping local media');
      this.localPlayer.pause();
      this.localPlayer.currentTime = 0;
    }
  }

  // Seek to position (works for both YouTube and local media)
  seekTo(time_s: number) {
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      console.log('🔍 Seeking YouTube to position:', time_s, 'for video display');
      this.yt_player.seekTo(time_s, true);
      this.yt_player.mute(); // Ensure it stays muted
    } else if (this.localPlayer) {
      this.localPlayer.currentTime = time_s;
    }
  }

  // Get current time (works for both YouTube and local media)
  getCurrentTime(): number {
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      return this.yt_player.getCurrentTime();
    } else if (this.localPlayer) {
      return this.localPlayer.currentTime;
    }
    return 0;
  }

  // Get duration (works for both YouTube and local media)
  getDuration(): number {
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      return this.yt_player.getDuration();
    } else if (this.localPlayer) {
      return this.localPlayer.duration || 0;
    }
    return 0;
  }

  // Skip time (works for both YouTube and local media)
  skip(time: number) {
    let t = this.getCurrentTime() + time;
    console.log("t =>", t);
    this.seekTo(t);
  }

  // Check if media is playing
  isPlaying(): boolean {
    if (this.currentMediaSource?.type === 'youtube' && this.yt_player) {
      // YouTube is only used for video display, not audio playback
      // Always return false since WaveSurfer handles the actual audio
      return false;
    } else if (this.localPlayer) {
      return !this.localPlayer.paused && !this.localPlayer.ended;
    }
    return false;
  }

  // File upload handler
  handleFileUpload(file: File): MediaSource {
    console.log('📁 handleFileUpload called for:', file.name, file.type);
    const fileType = file.type;
    
    if (fileType.startsWith('audio/')) {
      console.log('🎵 Detected audio file');
      return {
        type: 'local-mp3',
        file: file
      };
    } else if (fileType.startsWith('video/')) {
      console.log('🎬 Detected video file');
      return {
        type: 'local-video',
        file: file
      };
    } else {
      console.log('❌ Unsupported file type:', fileType);
      throw new Error('Unsupported file type. Please upload audio or video files.');
    }
  }

  // YouTube URL handler
  handleYouTubeUrl(url: string): MediaSource {
    console.log('🌐 handleYouTubeUrl called for:', url);
    return {
      type: 'youtube',
      url: url
    };
  }

  addApiToDom(){
    console.log('🔌 addApiToDom called');
    
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      console.log('✅ YouTube API already loaded');
      this.apiReady.next(true);
      return;
    }
    
    // Check if script tag already exists
    if($('#youtubeScript').length){
      console.log('✅ YouTube API script already exists, waiting for callback');
      // Set up the callback in case it hasn't been called yet
      window.onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTube API ready callback (from existing script)');
        this.apiReady.next(true);
      };
      return;
    }
    
    console.log('📜 Creating YouTube API script');
    
    // Set up the callback before adding the script
    window.onYouTubeIframeAPIReady = () => {
      console.log('✅ YouTube API ready callback');
      this.apiReady.next(true);
    };
    
  	const tag = document.createElement('script');
  	tag.src = "https://www.youtube.com/iframe_api";
  	tag.id = "youtubeScript";
  	document.body.appendChild(tag);
    
    console.log('✅ YouTube API script added to DOM');
  }

  removeApiFromDom(){
   $('#youtubeScript').remove(); 
  }

  onStateChange(s:any){
    if(s.data == 1 ){ //en lecture
      this.curPos.next( this.yt_player.getCurrentTime() );
      this.curPos.next('play');
    }else if(s.data == 0){  //arrété
      this.curPos.next('stop');
    }else if(s.data == 2){ //en pause
      this.curPos.next('pause');
    }else if(s.data == 5 || s.data == -1){ // 5 en file d'attente -1 non demarré
      return;
      this.curPos.next( this.yt_player.getCurrentTime() );
    };
  }

  changeVideoUrl(link:string=''){
  	if(link =='')return;

  	let id = (new URL(link)).searchParams.get('v');

  	if(id == '')
  		throw "Youtube Service : changeVideo() => no v parameter in url !";

  	this.videoLink = link;
  	this.videoId = id;

  	if(!this.hasOwnProperty('yt_player') || this.yt_player == undefined || this.yt_player.loadVideoById == undefined){
      this.addApiToDom();
  		console.warn( "Youtube Service : changeVideo() => yt_player not instanciated !" );
  	  return;
  	}
  	this.yt_player.loadVideoById(this.videoId, 5, "large");

  	this.ready.next(this.videoLink);
  }

  stopVideo() {
    console.log('⏹️ stopVideo - seeking to beginning for video display');
    this.yt_player.seekTo(0, true);
    this.yt_player.mute();
  }

  resumeVideo() {
    console.log('▶️ resumeVideo - ensuring muted state for video display');
    this.playerState = 1;
    if(this.yt_player && this.yt_player.mute) {
      this.yt_player.mute();
    }
  }

  pauseVideo() {
    console.log('⏸️ pauseVideo - ensuring muted state for video display');
    this.playerState = 2;
    if(this.yt_player && this.yt_player.mute) {
      this.yt_player.mute();
    }
  }

	getPlayerState(){
    let state;
    try{
      state = this.yt_player.getPlayerState();
    }catch(e){
      console.error('Error YoutubeService : getPlayerState() => cant access youtube ?');
      state = 5;
    }
		return state;
	}

  stopInterval(){
    clearInterval(this.interval);
  }

  destroy(){
    console.log('🗑️ YoutubeService.destroy called');
    // Clean up YouTube player
    if(this.yt_player) {
      console.log('🌐 Destroying YouTube player');
      this.yt_player.destroy();
      delete(this.yt_player);
    }

    // Clean up local player
    if (this.localPlayer) {
      console.log('🎵 Destroying local player');
      this.localPlayer.pause();
      this.localPlayer.src = '';
      this.localPlayer.load();
      this.localPlayer = null;
    }

    // Clean up object URLs
    if (this.currentMediaSource?.file) {
      URL.revokeObjectURL(this.localPlayer?.src || '');
    }

    this.stopInterval();
    this.videoId='';
    this.videoLink='';
    this.currentMediaSource = null;
    console.log('✅ YoutubeService.destroy completed');
  }
}
