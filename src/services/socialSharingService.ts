import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

export interface ShareContent {
  title?: string;
  text: string;
  url?: string;
  type?: "verse" | "journal" | "achievement" | "insight";
}

export interface ShareOptions {
  dialogTitle?: string;
  subject?: string;
  excludedActivityTypes?: string[];
}

class SocialSharingService {
  /**
   * Share content using native sharing dialog
   */
  async share(content: ShareContent, options?: ShareOptions): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        // Fallback to clipboard if sharing is not available
        await this.copyToClipboard(content);
        return false;
      }

      await Sharing.shareAsync(content.text, {
        dialogTitle: options?.dialogTitle || "Share via",
        UTI: options?.subject,
        mimeType: "text/plain",
      });

      return true;
    } catch (error) {
      console.error("Error sharing content:", error);
      // Fallback to clipboard on error
      await this.copyToClipboard(content);
      return false;
    }
  }

  /**
   * Copy content to clipboard
   */
  async copyToClipboard(content: ShareContent): Promise<void> {
    try {
      await Clipboard.setStringAsync(content.text);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      throw new Error("Failed to copy to clipboard");
    }
  }

  /**
   * Share a Bible verse
   */
  async shareVerse(
    reference: string,
    text: string,
    translation?: string,
    note?: string,
  ): Promise<boolean> {
    const shareText = this.formatVerseShare(reference, text, translation, note);

    return this.share(
      {
        title: `Bible Verse - ${reference}`,
        text: shareText,
        type: "verse",
        url: this.generateVerseUrl(reference),
      },
      {
        dialogTitle: "Share Bible Verse",
      },
    );
  }

  /**
   * Share a journal entry
   */
  async shareJournalEntry(
    title: string,
    content: string,
    category?: string,
    isAnswered?: boolean,
  ): Promise<boolean> {
    const shareText = this.formatJournalShare(
      title,
      content,
      category,
      isAnswered,
    );

    return this.share(
      {
        title: `Journal Entry - ${title}`,
        text: shareText,
        type: "journal",
      },
      {
        dialogTitle: "Share Journal Entry",
      },
    );
  }

  /**
   * Share an achievement
   */
  async shareAchievement(
    achievementName: string,
    description: string,
    points: number,
  ): Promise<boolean> {
    const shareText = this.formatAchievementShare(
      achievementName,
      description,
      points,
    );

    return this.share(
      {
        title: `Achievement Unlocked!`,
        text: shareText,
        type: "achievement",
      },
      {
        dialogTitle: "Share Achievement",
      },
    );
  }

  /**
   * Share a spiritual insight
   */
  async shareInsight(
    insight: string,
    verseReference?: string,
    verseText?: string,
  ): Promise<boolean> {
    const shareText = this.formatInsightShare(
      insight,
      verseReference,
      verseText,
    );

    return this.share(
      {
        title: "Spiritual Insight",
        text: shareText,
        type: "insight",
      },
      {
        dialogTitle: "Share Insight",
      },
    );
  }

  /**
   * Share reading progress
   */
  async shareReadingProgress(
    streakDays: number,
    totalVerses: number,
    completedPlans: number,
  ): Promise<boolean> {
    const shareText = this.formatProgressShare(
      streakDays,
      totalVerses,
      completedPlans,
    );

    return this.share(
      {
        title: "My Bible Reading Progress",
        text: shareText,
        type: "achievement",
      },
      {
        dialogTitle: "Share Progress",
      },
    );
  }

  /**
   * Format verse for sharing
   */
  private formatVerseShare(
    reference: string,
    text: string,
    translation?: string,
    note?: string,
  ): string {
    let shareText = `📖 ${reference}\n\n"${text}"`;

    if (translation && translation !== "NIV") {
      shareText += `\n\n— ${translation}`;
    }

    if (note) {
      shareText += `\n\n💭 My note: ${note}`;
    }

    shareText += "\n\nShared via Living Word Bible App";

    return shareText;
  }

  /**
   * Format journal entry for sharing
   */
  private formatJournalShare(
    title: string,
    content: string,
    category?: string,
    isAnswered?: boolean,
  ): string {
    let shareText = `📝 ${title}\n\n${content}`;

    if (category) {
      const categoryEmoji = this.getCategoryEmoji(category);
      shareText += `\n\n${categoryEmoji} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    }

    if (isAnswered) {
      shareText += "\n\n✅ Prayer Answered!";
    }

    shareText += "\n\nShared via Living Word Bible App";

    return shareText;
  }

  /**
   * Format achievement for sharing
   */
  private formatAchievementShare(
    name: string,
    description: string,
    points: number,
  ): string {
    return `🏆 Achievement Unlocked!\n\n${name}\n${description}\n\n+${points} points\n\nShared via Living Word Bible App`;
  }

  /**
   * Format insight for sharing
   */
  private formatInsightShare(
    insight: string,
    verseReference?: string,
    verseText?: string,
  ): string {
    let shareText = `💡 Spiritual Insight\n\n${insight}`;

    if (verseReference && verseText) {
      shareText += `\n\n📖 ${verseReference}\n"${verseText}"`;
    }

    shareText += "\n\nShared via Living Word Bible App";

    return shareText;
  }

  /**
   * Format progress for sharing
   */
  private formatProgressShare(
    streakDays: number,
    totalVerses: number,
    completedPlans: number,
  ): string {
    return `🔥 My Bible Reading Journey\n\n📅 ${streakDays} day streak!\n📖 ${totalVerses} verses studied\n✅ ${completedPlans} reading plans completed\n\nShared via Living Word Bible App`;
  }

  /**
   * Get emoji for journal category
   */
  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      prayer: "🙏",
      praise: "🌟",
      reflection: "💭",
      request: "📋",
      answered: "✅",
    };
    return emojis[category] || "📝";
  }

  /**
   * Generate URL for Bible verse (placeholder for future integration)
   */
  private generateVerseUrl(reference: string): string {
    // This could integrate with Bible Gateway, YouVersion, or other Bible sites
    const encodedReference = encodeURIComponent(reference);
    return `https://www.biblegateway.com/passage/?search=${encodedReference}&version=NIV`;
  }

  /**
   * Check if sharing is available on this device
   */
  async isSharingAvailable(): Promise<boolean> {
    try {
      return await Sharing.isAvailableAsync();
    } catch (error) {
      console.error("Error checking sharing availability:", error);
      return false;
    }
  }

  /**
   * Share to specific platform (if needed in the future)
   */
  async shareToSpecificPlatform(
    content: ShareContent,
    platform: "facebook" | "twitter" | "instagram" | "whatsapp",
  ): Promise<boolean> {
    // This would require platform-specific URLs or deep links
    // For now, fall back to general sharing
    return this.share(content, {
      dialogTitle: `Share to ${platform}`,
    });
  }
}

export const socialSharingService = new SocialSharingService();
