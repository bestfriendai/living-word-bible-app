import TrackPlayer, {
  Capability,
  Event,
  State,
  RepeatMode,
  Track,
} from "react-native-track-player";

export interface AudioChapter {
  bookId: number;
  bookName: string;
  chapter: number;
  audioUrl: string;
  duration?: number;
}

export class AudioBibleService {
  private isInitialized = false;

  /**
   * Initialize the audio player service
   * Call this once when the app starts
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await TrackPlayer.setupPlayer();

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });

      this.isInitialized = true;
      console.log("🎵 Audio Bible service initialized");
    } catch (error) {
      console.error("❌ Error initializing audio player:", error);
      throw error;
    }
  }

  /**
   * Play a specific Bible chapter
   */
  async playChapter(
    bookName: string,
    chapter: number,
    audioUrl: string,
    translation: string = "NIV",
  ): Promise<void> {
    try {
      await this.initialize();

      // Reset the player
      await TrackPlayer.reset();

      // Add the track
      const track: Track = {
        url: audioUrl,
        title: `${bookName} ${chapter}`,
        artist: `Bible Audio (${translation})`,
        artwork: require("../../assets/app-icons/icon-default.png"), // Default Bible icon
        duration: 0,
      };

      await TrackPlayer.add(track);
      await TrackPlayer.play();

      console.log(`▶️ Playing ${bookName} ${chapter}`);
    } catch (error) {
      console.error("❌ Error playing chapter:", error);
      throw error;
    }
  }

  /**
   * Play a list of chapters (e.g., reading plan)
   */
  async playChapters(
    chapters: AudioChapter[],
    translation: string = "NIV",
  ): Promise<void> {
    try {
      await this.initialize();
      await TrackPlayer.reset();

      const tracks: Track[] = chapters.map((chapter) => ({
        url: chapter.audioUrl,
        title: `${chapter.bookName} ${chapter.chapter}`,
        artist: `Bible Audio (${translation})`,
        artwork: require("../../assets/app-icons/icon-default.png"),
        duration: chapter.duration || 0,
      }));

      await TrackPlayer.add(tracks);
      await TrackPlayer.play();

      console.log(`▶️ Playing ${chapters.length} chapters`);
    } catch (error) {
      console.error("❌ Error playing chapters:", error);
      throw error;
    }
  }

  /**
   * Play/pause toggle
   */
  async togglePlayback(): Promise<void> {
    try {
      const state = await TrackPlayer.getPlaybackState();

      if (state.state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error("❌ Error toggling playback:", error);
    }
  }

  /**
   * Pause audio
   */
  async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error("❌ Error pausing:", error);
    }
  }

  /**
   * Resume audio
   */
  async play(): Promise<void> {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error("❌ Error playing:", error);
    }
  }

  /**
   * Stop audio
   */
  async stop(): Promise<void> {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error("❌ Error stopping:", error);
    }
  }

  /**
   * Skip to next chapter
   */
  async skipToNext(): Promise<void> {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error("❌ Error skipping to next:", error);
    }
  }

  /**
   * Skip to previous chapter
   */
  async skipToPrevious(): Promise<void> {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error("❌ Error skipping to previous:", error);
    }
  }

  /**
   * Seek to a specific position (in seconds)
   */
  async seekTo(position: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error("❌ Error seeking:", error);
    }
  }

  /**
   * Set playback speed
   */
  async setSpeed(speed: number): Promise<void> {
    try {
      await TrackPlayer.setRate(speed);
      console.log(`⚡ Playback speed set to ${speed}x`);
    } catch (error) {
      console.error("❌ Error setting speed:", error);
    }
  }

  /**
   * Get current playback state
   */
  async getState(): Promise<State> {
    try {
      const state = await TrackPlayer.getPlaybackState();
      return state.state;
    } catch (error) {
      console.error("❌ Error getting state:", error);
      return State.None;
    }
  }

  /**
   * Get current track information
   */
  async getCurrentTrack(): Promise<Track | null> {
    try {
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      if (trackIndex === null || trackIndex === undefined) return null;

      const track = await TrackPlayer.getTrack(trackIndex);
      return track || null;
    } catch (error) {
      console.error("❌ Error getting current track:", error);
      return null;
    }
  }

  /**
   * Get current playback position and duration
   */
  async getProgress(): Promise<{ position: number; duration: number }> {
    try {
      const position = await TrackPlayer.getProgress();
      return {
        position: position.position,
        duration: position.duration,
      };
    } catch (error) {
      console.error("❌ Error getting progress:", error);
      return { position: 0, duration: 0 };
    }
  }

  /**
   * Set sleep timer (auto-pause after specified minutes)
   */
  async setSleepTimer(minutes: number): Promise<void> {
    try {
      const milliseconds = minutes * 60 * 1000;

      setTimeout(async () => {
        await this.pause();
        console.log("😴 Sleep timer activated - audio paused");
      }, milliseconds);

      console.log(`⏰ Sleep timer set for ${minutes} minutes`);
    } catch (error) {
      console.error("❌ Error setting sleep timer:", error);
    }
  }

  /**
   * Set repeat mode
   */
  async setRepeatMode(mode: "off" | "track" | "queue"): Promise<void> {
    try {
      const repeatMode = {
        off: RepeatMode.Off,
        track: RepeatMode.Track,
        queue: RepeatMode.Queue,
      }[mode];

      await TrackPlayer.setRepeatMode(repeatMode);
      console.log(`🔁 Repeat mode: ${mode}`);
    } catch (error) {
      console.error("❌ Error setting repeat mode:", error);
    }
  }

  /**
   * Get Bible audio URL (placeholder - integrate with API)
   * In production, this would fetch from API.Bible or similar service
   */
  getAudioUrl(
    bookId: number,
    chapter: number,
    translation: string = "NIV",
  ): string {
    // Placeholder URLs - replace with actual API integration
    // API.Bible provides audio endpoints: https://scripture.api.bible/livedocs#/Audio

    const translationIds: Record<string, string> = {
      NIV: "06125adad2d5898a-01",
      KJV: "de4e12af7f28f599-02",
      ESV: "f421fe261da7624f-01",
    };

    const bibleId = translationIds[translation] || translationIds.NIV;

    // Example URL structure (you'll need API.Bible credentials)
    return `https://audio.bible.example.com/${bibleId}/book-${bookId}/chapter-${chapter}.mp3`;
  }

  /**
   * Check if audio is currently playing
   */
  async isPlaying(): Promise<boolean> {
    try {
      const state = await this.getState();
      return state === State.Playing;
    } catch (error) {
      return false;
    }
  }

  /**
   * Download chapter for offline playback (placeholder)
   * Would implement with expo-file-system in production
   */
  async downloadChapter(
    bookName: string,
    chapter: number,
    audioUrl: string,
  ): Promise<string> {
    // Placeholder - implement with expo-file-system
    console.log(
      `📥 Would download ${bookName} ${chapter} for offline playback`,
    );
    return audioUrl;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      await TrackPlayer.reset();
      this.isInitialized = false;
      console.log("🧹 Audio player cleaned up");
    } catch (error) {
      console.error("❌ Error cleaning up:", error);
    }
  }
}

// Singleton instance
export const audioBibleService = new AudioBibleService();

/**
 * Setup service for background playback
 * Register this in your index.js or App.tsx
 */
export async function setupAudioService(): Promise<void> {
  TrackPlayer.registerPlaybackService(() => async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteNext, () =>
      TrackPlayer.skipToNext(),
    );
    TrackPlayer.addEventListener(Event.RemotePrevious, () =>
      TrackPlayer.skipToPrevious(),
    );
  });
}
