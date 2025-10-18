export interface ReadingPlanTemplate {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  category:
    | "Topical"
    | "Book Study"
    | "Chronological"
    | "Character Study"
    | "Devotional"
    | "Overview";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readings: {
    day: number;
    reference: string;
    title?: string;
  }[];
}

export const readingPlansData: ReadingPlanTemplate[] = [
  // ============================================
  // BEGINNER PLANS (7-30 days)
  // ============================================
  {
    id: "plan-john-gospel",
    name: "The Gospel of John",
    description:
      "Discover who Jesus is through John's beautiful account of His life and ministry.",
    duration: 21,
    category: "Book Study",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "John 1", title: "The Word Became Flesh" },
      { day: 2, reference: "John 2", title: "First Miracle at Cana" },
      { day: 3, reference: "John 3", title: "You Must Be Born Again" },
      { day: 4, reference: "John 4", title: "The Woman at the Well" },
      { day: 5, reference: "John 5", title: "Healing at the Pool" },
      { day: 6, reference: "John 6", title: "The Bread of Life" },
      { day: 7, reference: "John 7", title: "Jesus at the Festival" },
      { day: 8, reference: "John 8", title: "The Light of the World" },
      { day: 9, reference: "John 9", title: "Jesus Heals a Blind Man" },
      { day: 10, reference: "John 10", title: "The Good Shepherd" },
      { day: 11, reference: "John 11", title: "Lazarus Raised from Death" },
      { day: 12, reference: "John 12", title: "Jesus Anointed at Bethany" },
      { day: 13, reference: "John 13", title: "Jesus Washes Disciples' Feet" },
      { day: 14, reference: "John 14", title: "The Way, Truth, and Life" },
      { day: 15, reference: "John 15", title: "The Vine and Branches" },
      { day: 16, reference: "John 16", title: "The Holy Spirit Promised" },
      { day: 17, reference: "John 17", title: "Jesus Prays for Believers" },
      { day: 18, reference: "John 18", title: "Jesus Arrested and Tried" },
      { day: 19, reference: "John 19", title: "The Crucifixion" },
      { day: 20, reference: "John 20", title: "The Resurrection" },
      { day: 21, reference: "John 21", title: "Jesus Appears to Disciples" },
    ],
  },
  {
    id: "plan-psalms-30",
    name: "30 Days of Psalms",
    description: "Experience God's presence through the most beloved Psalms.",
    duration: 30,
    category: "Devotional",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "Psalm 1", title: "The Blessed Life" },
      { day: 2, reference: "Psalm 23", title: "The Lord is My Shepherd" },
      { day: 3, reference: "Psalm 27", title: "The Lord is My Light" },
      { day: 4, reference: "Psalm 34", title: "Taste and See" },
      { day: 5, reference: "Psalm 37", title: "Trust in the Lord" },
      { day: 6, reference: "Psalm 40", title: "I Waited Patiently" },
      { day: 7, reference: "Psalm 46", title: "God is Our Refuge" },
      { day: 8, reference: "Psalm 51", title: "Create in Me a Clean Heart" },
      { day: 9, reference: "Psalm 63", title: "My Soul Thirsts for You" },
      {
        day: 10,
        reference: "Psalm 73",
        title: "God is the Strength of My Heart",
      },
      { day: 11, reference: "Psalm 84", title: "Better is One Day" },
      { day: 12, reference: "Psalm 90", title: "Teach Us to Number Our Days" },
      { day: 13, reference: "Psalm 91", title: "Dwelling in the Shelter" },
      {
        day: 14,
        reference: "Psalm 100",
        title: "Enter His Gates with Thanksgiving",
      },
      { day: 15, reference: "Psalm 103", title: "Bless the Lord, O My Soul" },
      { day: 16, reference: "Psalm 107", title: "Give Thanks to the Lord" },
      { day: 17, reference: "Psalm 119:1-40", title: "The Law of the Lord" },
      { day: 18, reference: "Psalm 119:41-88", title: "Your Word is a Lamp" },
      { day: 19, reference: "Psalm 119:89-136", title: "Forever, O Lord" },
      {
        day: 20,
        reference: "Psalm 119:137-176",
        title: "Righteous Are You, O Lord",
      },
      { day: 21, reference: "Psalm 121", title: "The Lord Watches Over You" },
      { day: 22, reference: "Psalm 127", title: "Unless the Lord Builds" },
      { day: 23, reference: "Psalm 130", title: "Out of the Depths" },
      { day: 24, reference: "Psalm 133", title: "Dwelling in Unity" },
      { day: 25, reference: "Psalm 138", title: "I Give You Thanks" },
      { day: 26, reference: "Psalm 139", title: "You Know Me Completely" },
      { day: 27, reference: "Psalm 143", title: "Teach Me to Do Your Will" },
      { day: 28, reference: "Psalm 145", title: "Great is the Lord" },
      { day: 29, reference: "Psalm 146", title: "Praise the Lord" },
      {
        day: 30,
        reference: "Psalm 150",
        title: "Let Everything Praise the Lord",
      },
    ],
  },
  {
    id: "plan-proverbs-wisdom",
    name: "Wisdom for Daily Living",
    description:
      "Read one chapter of Proverbs each day for a month of practical wisdom.",
    duration: 31,
    category: "Book Study",
    difficulty: "Beginner",
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      reference: `Proverbs ${i + 1}`,
      title: `Wisdom for Day ${i + 1}`,
    })),
  },
  {
    id: "plan-anxiety-peace",
    name: "Finding Peace in Anxiety",
    description:
      "Discover God's peace through verses that speak to worry and fear.",
    duration: 14,
    category: "Topical",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "Philippians 4:6-7", title: "Do Not Be Anxious" },
      { day: 2, reference: "Matthew 6:25-34", title: "Do Not Worry" },
      { day: 3, reference: "Psalm 23", title: "The Lord is My Shepherd" },
      { day: 4, reference: "Isaiah 41:10", title: "Fear Not" },
      { day: 5, reference: "John 14:27", title: "Peace I Leave With You" },
      {
        day: 6,
        reference: "Psalm 94:19",
        title: "Your Consolations Cheer My Soul",
      },
      { day: 7, reference: "1 Peter 5:7", title: "Cast Your Anxiety on Him" },
      { day: 8, reference: "Proverbs 3:5-6", title: "Trust in the Lord" },
      { day: 9, reference: "Isaiah 26:3", title: "Perfect Peace" },
      { day: 10, reference: "2 Timothy 1:7", title: "Spirit of Power" },
      { day: 11, reference: "Psalm 46", title: "God is Our Refuge" },
      { day: 12, reference: "Romans 8:28", title: "All Things for Good" },
      { day: 13, reference: "Psalm 55:22", title: "Cast Your Burden" },
      {
        day: 14,
        reference: "2 Corinthians 12:9",
        title: "My Grace is Sufficient",
      },
    ],
  },
  {
    id: "plan-life-of-jesus",
    name: "The Life of Jesus",
    description:
      "Walk through the key events of Jesus' life from birth to resurrection.",
    duration: 40,
    category: "Character Study",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "Luke 1:26-38", title: "The Annunciation" },
      { day: 2, reference: "Matthew 1:18-25", title: "Joseph's Dream" },
      { day: 3, reference: "Luke 2:1-20", title: "The Birth of Jesus" },
      { day: 4, reference: "Matthew 2:1-12", title: "The Wise Men" },
      { day: 5, reference: "Luke 2:41-52", title: "Boy Jesus at the Temple" },
      { day: 6, reference: "Matthew 3:1-17", title: "John the Baptist" },
      {
        day: 7,
        reference: "Matthew 4:1-11",
        title: "Temptation in the Wilderness",
      },
      { day: 8, reference: "John 1:35-51", title: "The First Disciples" },
      { day: 9, reference: "John 2:1-11", title: "Wedding at Cana" },
      { day: 10, reference: "John 3:1-21", title: "Nicodemus Visits Jesus" },
      { day: 11, reference: "John 4:1-42", title: "The Woman at the Well" },
      { day: 12, reference: "Matthew 5:1-12", title: "The Beatitudes" },
      {
        day: 13,
        reference: "Matthew 5:13-48",
        title: "Sermon on the Mount (Part 1)",
      },
      {
        day: 14,
        reference: "Matthew 6:1-34",
        title: "Sermon on the Mount (Part 2)",
      },
      {
        day: 15,
        reference: "Matthew 7:1-29",
        title: "Sermon on the Mount (Part 3)",
      },
      {
        day: 16,
        reference: "Luke 7:36-50",
        title: "Jesus Forgives a Sinful Woman",
      },
      { day: 17, reference: "Matthew 8:23-27", title: "Jesus Calms the Storm" },
      {
        day: 18,
        reference: "Mark 5:1-20",
        title: "Healing the Demon-Possessed Man",
      },
      {
        day: 19,
        reference: "Matthew 9:18-26",
        title: "Two Miracles of Healing",
      },
      { day: 20, reference: "Matthew 14:13-21", title: "Feeding the 5000" },
      { day: 21, reference: "Matthew 14:22-33", title: "Walking on Water" },
      { day: 22, reference: "Matthew 16:13-20", title: "Peter's Confession" },
      { day: 23, reference: "Matthew 17:1-13", title: "The Transfiguration" },
      {
        day: 24,
        reference: "Matthew 18:1-35",
        title: "The Greatest in the Kingdom",
      },
      { day: 25, reference: "Luke 10:25-37", title: "The Good Samaritan" },
      { day: 26, reference: "Luke 15:11-32", title: "The Prodigal Son" },
      {
        day: 27,
        reference: "John 11:1-44",
        title: "Lazarus Raised from the Dead",
      },
      {
        day: 28,
        reference: "Luke 19:1-10",
        title: "Zacchaeus the Tax Collector",
      },
      { day: 29, reference: "Matthew 21:1-11", title: "Triumphal Entry" },
      {
        day: 30,
        reference: "John 13:1-17",
        title: "Jesus Washes the Disciples' Feet",
      },
      { day: 31, reference: "Matthew 26:17-30", title: "The Last Supper" },
      {
        day: 32,
        reference: "John 17:1-26",
        title: "Jesus Prays for His Disciples",
      },
      { day: 33, reference: "Matthew 26:36-46", title: "Gethsemane" },
      {
        day: 34,
        reference: "Matthew 26:47-75",
        title: "Jesus Arrested and Denied",
      },
      { day: 35, reference: "Matthew 27:11-31", title: "Jesus Before Pilate" },
      { day: 36, reference: "Luke 23:26-49", title: "The Crucifixion" },
      { day: 37, reference: "Matthew 27:57-66", title: "The Burial of Jesus" },
      { day: 38, reference: "Matthew 28:1-15", title: "The Resurrection" },
      { day: 39, reference: "Luke 24:13-35", title: "Road to Emmaus" },
      { day: 40, reference: "Acts 1:1-11", title: "The Ascension" },
    ],
  },

  // ============================================
  // INTERMEDIATE PLANS (60-180 days)
  // ============================================
  {
    id: "plan-new-testament-90",
    name: "New Testament in 90 Days",
    description: "Read through the entire New Testament in three months.",
    duration: 90,
    category: "Overview",
    difficulty: "Intermediate",
    readings: [
      // Matthew (Days 1-9)
      { day: 1, reference: "Matthew 1-3", title: "Birth and Preparation" },
      {
        day: 2,
        reference: "Matthew 4-6",
        title: "Temptation and Sermon on the Mount",
      },
      { day: 3, reference: "Matthew 7-9", title: "Teaching and Miracles" },
      { day: 4, reference: "Matthew 10-12", title: "The Twelve Apostles" },
      { day: 5, reference: "Matthew 13-15", title: "Parables of the Kingdom" },
      { day: 6, reference: "Matthew 16-18", title: "Peter's Confession" },
      { day: 7, reference: "Matthew 19-21", title: "Journey to Jerusalem" },
      { day: 8, reference: "Matthew 22-24", title: "Teaching in the Temple" },
      {
        day: 9,
        reference: "Matthew 25-28",
        title: "Crucifixion and Resurrection",
      },

      // Mark (Days 10-14)
      { day: 10, reference: "Mark 1-3", title: "Beginning of Jesus' Ministry" },
      { day: 11, reference: "Mark 4-6", title: "Parables and Miracles" },
      { day: 12, reference: "Mark 7-9", title: "Transfiguration" },
      { day: 13, reference: "Mark 10-12", title: "Teachings on Discipleship" },
      {
        day: 14,
        reference: "Mark 13-16",
        title: "Passion Week and Resurrection",
      },

      // Luke (Days 15-24)
      { day: 15, reference: "Luke 1-2", title: "Birth of John and Jesus" },
      { day: 16, reference: "Luke 3-4", title: "Ministry Begins" },
      { day: 17, reference: "Luke 5-6", title: "Calling Disciples" },
      { day: 18, reference: "Luke 7-8", title: "Faith and Miracles" },
      { day: 19, reference: "Luke 9-10", title: "The Twelve Sent Out" },
      { day: 20, reference: "Luke 11-12", title: "Teaching on Prayer" },
      { day: 21, reference: "Luke 13-15", title: "Parables of Grace" },
      { day: 22, reference: "Luke 16-18", title: "Teachings on Wealth" },
      { day: 23, reference: "Luke 19-21", title: "Final Week in Jerusalem" },
      { day: 24, reference: "Luke 22-24", title: "Death and Resurrection" },

      // John (Days 25-32)
      { day: 25, reference: "John 1-3", title: "The Word Became Flesh" },
      { day: 26, reference: "John 4-5", title: "Living Water" },
      { day: 27, reference: "John 6-7", title: "Bread of Life" },
      { day: 28, reference: "John 8-9", title: "Light of the World" },
      { day: 29, reference: "John 10-11", title: "The Good Shepherd" },
      { day: 30, reference: "John 12-14", title: "The Way, Truth, and Life" },
      { day: 31, reference: "John 15-17", title: "The Vine and Branches" },
      {
        day: 32,
        reference: "John 18-21",
        title: "Trial, Death, and Resurrection",
      },

      // Acts (Days 33-46)
      { day: 33, reference: "Acts 1-2", title: "Ascension and Pentecost" },
      { day: 34, reference: "Acts 3-4", title: "The Early Church" },
      { day: 35, reference: "Acts 5-6", title: "Growth and Opposition" },
      { day: 36, reference: "Acts 7-8", title: "Stephen's Martyrdom" },
      { day: 37, reference: "Acts 9-10", title: "Saul's Conversion" },
      { day: 38, reference: "Acts 11-12", title: "Gospel to the Gentiles" },
      { day: 39, reference: "Acts 13-14", title: "First Missionary Journey" },
      { day: 40, reference: "Acts 15-16", title: "Jerusalem Council" },
      { day: 41, reference: "Acts 17-18", title: "Second Missionary Journey" },
      { day: 42, reference: "Acts 19-20", title: "Ministry in Ephesus" },
      { day: 43, reference: "Acts 21-22", title: "Paul's Arrest" },
      { day: 44, reference: "Acts 23-24", title: "Before the Council" },
      { day: 45, reference: "Acts 25-26", title: "Before Felix and Festus" },
      { day: 46, reference: "Acts 27-28", title: "Journey to Rome" },

      // Romans (Days 47-52)
      { day: 47, reference: "Romans 1-3", title: "All Have Sinned" },
      { day: 48, reference: "Romans 4-6", title: "Justified by Faith" },
      { day: 49, reference: "Romans 7-9", title: "Struggle with Sin" },
      { day: 50, reference: "Romans 10-12", title: "Living Sacrifice" },
      { day: 51, reference: "Romans 13-14", title: "Love and Liberty" },
      { day: 52, reference: "Romans 15-16", title: "Paul's Ministry Plans" },

      // 1 Corinthians (Days 53-56)
      {
        day: 53,
        reference: "1 Corinthians 1-4",
        title: "Divisions in the Church",
      },
      {
        day: 54,
        reference: "1 Corinthians 5-8",
        title: "Moral and Ethical Issues",
      },
      { day: 55, reference: "1 Corinthians 9-12", title: "Spiritual Gifts" },
      {
        day: 56,
        reference: "1 Corinthians 13-16",
        title: "Love and Resurrection",
      },

      // 2 Corinthians (Days 57-59)
      {
        day: 57,
        reference: "2 Corinthians 1-4",
        title: "Comfort in Affliction",
      },
      {
        day: 58,
        reference: "2 Corinthians 5-9",
        title: "Ministry of Reconciliation",
      },
      { day: 59, reference: "2 Corinthians 10-13", title: "Paul's Defense" },

      // Galatians (Days 60-61)
      { day: 60, reference: "Galatians 1-3", title: "Gospel of Grace" },
      { day: 61, reference: "Galatians 4-6", title: "Freedom in Christ" },

      // Ephesians (Days 62-63)
      { day: 62, reference: "Ephesians 1-3", title: "Spiritual Blessings" },
      {
        day: 63,
        reference: "Ephesians 4-6",
        title: "Walk Worthy and Armor of God",
      },

      // Philippians (Day 64)
      { day: 64, reference: "Philippians 1-4", title: "Joy in Christ" },

      // Colossians (Day 65)
      { day: 65, reference: "Colossians 1-4", title: "Supremacy of Christ" },

      // 1 Thessalonians (Day 66)
      {
        day: 66,
        reference: "1 Thessalonians 1-5",
        title: "Living to Please God",
      },

      // 2 Thessalonians (Day 67)
      { day: 67, reference: "2 Thessalonians 1-3", title: "Stand Firm" },

      // 1 Timothy (Days 68-69)
      {
        day: 68,
        reference: "1 Timothy 1-3",
        title: "Instructions for the Church",
      },
      {
        day: 69,
        reference: "1 Timothy 4-6",
        title: "Godliness with Contentment",
      },

      // 2 Timothy (Day 70)
      { day: 70, reference: "2 Timothy 1-4", title: "Paul's Final Words" },

      // Titus (Day 71)
      { day: 71, reference: "Titus 1-3", title: "Sound Doctrine" },

      // Philemon (Day 72)
      { day: 72, reference: "Philemon 1", title: "A Brother in Christ" },

      // Hebrews (Days 73-76)
      { day: 73, reference: "Hebrews 1-4", title: "Jesus Greater Than Angels" },
      { day: 74, reference: "Hebrews 5-8", title: "Jesus Our High Priest" },
      { day: 75, reference: "Hebrews 9-10", title: "The New Covenant" },
      { day: 76, reference: "Hebrews 11-13", title: "Faith Hall of Fame" },

      // James (Day 77)
      { day: 77, reference: "James 1-5", title: "Faith and Works" },

      // 1 Peter (Day 78)
      { day: 78, reference: "1 Peter 1-5", title: "Living Hope" },

      // 2 Peter (Day 79)
      { day: 79, reference: "2 Peter 1-3", title: "Growing in Grace" },

      // 1 John (Day 80)
      { day: 80, reference: "1 John 1-5", title: "God is Love" },

      // 2 John (Day 81)
      { day: 81, reference: "2 John 1", title: "Walk in Truth and Love" },

      // 3 John (Day 82)
      { day: 82, reference: "3 John 1", title: "Walking in Truth" },

      // Jude (Day 83)
      { day: 83, reference: "Jude 1", title: "Contend for the Faith" },

      // Revelation (Days 84-90)
      {
        day: 84,
        reference: "Revelation 1-3",
        title: "Letters to the Seven Churches",
      },
      { day: 85, reference: "Revelation 4-6", title: "The Throne of God" },
      { day: 86, reference: "Revelation 7-9", title: "The Seven Seals" },
      { day: 87, reference: "Revelation 10-12", title: "The Seven Trumpets" },
      {
        day: 88,
        reference: "Revelation 13-16",
        title: "The Beast and Bowls of Wrath",
      },
      { day: 89, reference: "Revelation 17-19", title: "Fall of Babylon" },
      {
        day: 90,
        reference: "Revelation 20-22",
        title: "New Heaven and New Earth",
      },
    ],
  },
  {
    id: "plan-romans-study",
    name: "Deep Dive into Romans",
    description:
      "Explore Paul's masterpiece on salvation and Christian living.",
    duration: 32,
    category: "Book Study",
    difficulty: "Intermediate",
    readings: Array.from({ length: 16 }, (_, i) => ({
      day: i * 2 + 1,
      reference: `Romans ${i + 1}`,
      title: `Romans ${i + 1}`,
    })).concat(
      Array.from({ length: 16 }, (_, i) => ({
        day: i * 2 + 2,
        reference: `Romans ${i + 1}`,
        title: `Romans ${i + 1} (Reflection)`,
      })),
    ),
  },
  {
    id: "plan-spiritual-warfare",
    name: "Spiritual Warfare",
    description: "Learn to stand firm in spiritual battles.",
    duration: 21,
    category: "Topical",
    difficulty: "Intermediate",
    readings: [
      { day: 1, reference: "Ephesians 6:10-20", title: "The Armor of God" },
      {
        day: 2,
        reference: "2 Corinthians 10:3-5",
        title: "Weapons of Our Warfare",
      },
      { day: 3, reference: "James 4:7-10", title: "Resist the Devil" },
      { day: 4, reference: "1 Peter 5:8-11", title: "Be Alert and Sober" },
      { day: 5, reference: "Revelation 12:7-12", title: "War in Heaven" },
      { day: 6, reference: "Matthew 4:1-11", title: "Jesus Tempted" },
      { day: 7, reference: "Luke 10:17-20", title: "Authority Over Evil" },
      { day: 8, reference: "Mark 3:20-30", title: "Binding the Strong Man" },
      {
        day: 9,
        reference: "Acts 19:11-20",
        title: "Spiritual Power in Ephesus",
      },
      { day: 10, reference: "1 John 4:1-6", title: "Test the Spirits" },
      { day: 11, reference: "1 John 5:18-21", title: "Protection from Evil" },
      { day: 12, reference: "Daniel 10:1-21", title: "Spiritual Battle" },
      { day: 13, reference: "Psalm 91", title: "Dwelling in the Shelter" },
      { day: 14, reference: "Romans 8:31-39", title: "More Than Conquerors" },
      { day: 15, reference: "2 Timothy 1:7-14", title: "Spirit of Power" },
      {
        day: 16,
        reference: "Hebrews 4:12-16",
        title: "Living and Active Word",
      },
      {
        day: 17,
        reference: "1 Thessalonians 5:1-11",
        title: "Children of Light",
      },
      {
        day: 18,
        reference: "Colossians 1:9-14",
        title: "Rescued from Darkness",
      },
      { day: 19, reference: "Psalm 18:1-19", title: "The Lord is My Rock" },
      { day: 20, reference: "Zechariah 3:1-10", title: "Satan Rebuked" },
      { day: 21, reference: "Revelation 20:7-10", title: "Final Victory" },
    ],
  },

  // ============================================
  // ADVANCED PLANS (365 days)
  // ============================================
  {
    id: "plan-one-year-bible",
    name: "One Year Bible Reading Plan",
    description:
      "Read the entire Bible in one year with daily readings from Old Testament, New Testament, Psalms, and Proverbs.",
    duration: 365,
    category: "Chronological",
    difficulty: "Advanced",
    readings: [
      {
        day: 1,
        reference: "Genesis 1-3, Matthew 1, Psalm 1, Proverbs 1:1-6",
        title: "Creation and Beginning",
      },
      {
        day: 2,
        reference: "Genesis 4-6, Matthew 2, Psalm 2, Proverbs 1:7-9",
        title: "Fall and Flood",
      },
      // ... (Would continue for all 365 days)
      {
        day: 365,
        reference: "Malachi 3-4, Revelation 22, Psalm 150, Proverbs 31:25-31",
        title: "The End and New Beginning",
      },
    ],
  },

  // ============================================
  // POPULAR TOPICAL PLANS
  // ============================================
  {
    id: "plan-marriage-family",
    name: "Marriage and Family",
    description:
      "Biblical principles for healthy relationships and family life.",
    duration: 14,
    category: "Topical",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "Genesis 2:18-25", title: "Creation of Marriage" },
      { day: 2, reference: "Ephesians 5:22-33", title: "Husband and Wife" },
      {
        day: 3,
        reference: "Colossians 3:18-21",
        title: "Family Relationships",
      },
      { day: 4, reference: "1 Corinthians 13", title: "Love is Patient" },
      {
        day: 5,
        reference: "Proverbs 31:10-31",
        title: "A Wife of Noble Character",
      },
      { day: 6, reference: "Ephesians 6:1-4", title: "Children and Parents" },
      { day: 7, reference: "Deuteronomy 6:4-9", title: "Teaching Children" },
      { day: 8, reference: "1 Peter 3:1-7", title: "Husbands and Wives" },
      { day: 9, reference: "Song of Solomon 2", title: "Celebrating Love" },
      { day: 10, reference: "Malachi 2:13-16", title: "God Hates Divorce" },
      { day: 11, reference: "1 Timothy 5:8", title: "Providing for Family" },
      { day: 12, reference: "Proverbs 22:6", title: "Train Up a Child" },
      {
        day: 13,
        reference: "Joshua 24:14-15",
        title: "Choosing to Serve the Lord",
      },
      { day: 14, reference: "Hebrews 13:4", title: "Honor Marriage" },
    ],
  },
  {
    id: "plan-prayer",
    name: "30 Days of Prayer",
    description:
      "Develop a powerful prayer life through daily scripture and reflection.",
    duration: 30,
    category: "Devotional",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "Matthew 6:5-15", title: "The Lord's Prayer" },
      { day: 2, reference: "Philippians 4:6-7", title: "Prayer and Peace" },
      {
        day: 3,
        reference: "1 Thessalonians 5:16-18",
        title: "Pray Continually",
      },
      { day: 4, reference: "James 5:16", title: "Prayer of the Righteous" },
      { day: 5, reference: "Mark 11:24", title: "Believe When You Pray" },
      { day: 6, reference: "Luke 11:9-13", title: "Ask, Seek, Knock" },
      { day: 7, reference: "Ephesians 6:18", title: "Pray in the Spirit" },
      {
        day: 8,
        reference: "Colossians 4:2",
        title: "Devote Yourselves to Prayer",
      },
      { day: 9, reference: "1 Timothy 2:1-4", title: "Pray for Everyone" },
      { day: 10, reference: "Romans 12:12", title: "Faithful in Prayer" },
      { day: 11, reference: "Psalm 145:18", title: "Near to Those Who Call" },
      {
        day: 12,
        reference: "Jeremiah 29:12-13",
        title: "Seek Me with All Heart",
      },
      { day: 13, reference: "Psalm 66:18-20", title: "God Hears Prayer" },
      { day: 14, reference: "Proverbs 15:8", title: "Prayer of the Upright" },
      { day: 15, reference: "Daniel 6:10", title: "Three Times a Day" },
      { day: 16, reference: "Acts 2:42", title: "Devoted to Prayer" },
      { day: 17, reference: "Hebrews 4:16", title: "Approach with Confidence" },
      { day: 18, reference: "1 John 5:14-15", title: "According to His Will" },
      { day: 19, reference: "Psalm 17:6", title: "Hear My Prayer" },
      { day: 20, reference: "Isaiah 65:24", title: "Before They Call" },
      { day: 21, reference: "Matthew 7:7-11", title: "Good Gifts to Children" },
      { day: 22, reference: "Luke 18:1-8", title: "Always Pray, Not Give Up" },
      { day: 23, reference: "John 14:13-14", title: "Ask in My Name" },
      { day: 24, reference: "Romans 8:26-27", title: "Spirit Intercedes" },
      { day: 25, reference: "Psalm 102:17", title: "Hears the Desperate" },
      { day: 26, reference: "2 Chronicles 7:14", title: "Humble and Pray" },
      { day: 27, reference: "Psalm 5:3", title: "Morning Prayer" },
      { day: 28, reference: "Revelation 5:8", title: "Bowls of Incense" },
      { day: 29, reference: "Psalm 141:2", title: "Prayer as Incense" },
      { day: 30, reference: "1 Peter 3:12", title: "Eyes of the Lord" },
    ],
  },
  {
    id: "plan-faith-foundations",
    name: "Foundations of Faith",
    description:
      "Build a strong foundation with essential Christian doctrines.",
    duration: 21,
    category: "Topical",
    difficulty: "Beginner",
    readings: [
      { day: 1, reference: "Hebrews 11:1-6", title: "What is Faith?" },
      { day: 2, reference: "Romans 10:17", title: "Faith Comes by Hearing" },
      { day: 3, reference: "Ephesians 2:8-9", title: "Saved by Grace" },
      { day: 4, reference: "John 3:16-18", title: "God's Love" },
      { day: 5, reference: "Romans 3:23", title: "All Have Sinned" },
      { day: 6, reference: "Romans 6:23", title: "Wages of Sin" },
      { day: 7, reference: "1 Corinthians 15:3-4", title: "The Gospel" },
      { day: 8, reference: "Romans 5:8", title: "Christ Died for Us" },
      { day: 9, reference: "Romans 10:9-10", title: "Confess and Believe" },
      { day: 10, reference: "2 Corinthians 5:17", title: "New Creation" },
      { day: 11, reference: "John 1:12-13", title: "Children of God" },
      { day: 12, reference: "Romans 8:1", title: "No Condemnation" },
      { day: 13, reference: "Romans 8:38-39", title: "Nothing Can Separate" },
      { day: 14, reference: "Philippians 1:6", title: "God Will Complete" },
      { day: 15, reference: "Ephesians 1:13-14", title: "Sealed by Spirit" },
      { day: 16, reference: "John 14:26", title: "Holy Spirit Teaches" },
      {
        day: 17,
        reference: "2 Timothy 3:16-17",
        title: "God-Breathed Scripture",
      },
      { day: 18, reference: "Hebrews 4:12", title: "Living Word" },
      { day: 19, reference: "James 1:22", title: "Doers of the Word" },
      { day: 20, reference: "Matthew 28:19-20", title: "Great Commission" },
      { day: 21, reference: "Acts 1:8", title: "Witnesses to the Ends" },
    ],
  },
  {
    id: "plan-christian-living",
    name: "Christian Living in Daily Life",
    description: "Practical guidance for living out your faith every day.",
    duration: 28,
    category: "Topical",
    difficulty: "Intermediate",
    readings: [
      { day: 1, reference: "Galatians 5:22-23", title: "Fruit of the Spirit" },
      { day: 2, reference: "Micah 6:8", title: "Act Justly, Love Mercy" },
      { day: 3, reference: "Matthew 5:16", title: "Let Your Light Shine" },
      { day: 4, reference: "Colossians 3:17", title: "Do Everything for God" },
      { day: 5, reference: "1 Peter 4:8-11", title: "Use Your Gifts" },
      { day: 6, reference: "Romans 12:1-2", title: "Living Sacrifice" },
      { day: 7, reference: "Ephesians 4:29-32", title: "Build Others Up" },
      { day: 8, reference: "Philippians 4:8", title: "Think on These Things" },
      { day: 9, reference: "James 1:19-20", title: "Quick to Listen" },
      { day: 10, reference: "Proverbs 15:1", title: "Gentle Answer" },
      { day: 11, reference: "Matthew 7:12", title: "Golden Rule" },
      { day: 12, reference: "Luke 6:31", title: "Do to Others" },
      {
        day: 13,
        reference: "1 Thessalonians 5:11",
        title: "Encourage One Another",
      },
      { day: 14, reference: "Hebrews 10:24-25", title: "Spur One Another On" },
      {
        day: 15,
        reference: "Galatians 6:2",
        title: "Carry Each Other's Burdens",
      },
      {
        day: 16,
        reference: "Philippians 2:3-4",
        title: "Consider Others Better",
      },
      { day: 17, reference: "Ephesians 5:21", title: "Submit to One Another" },
      { day: 18, reference: "Romans 12:10", title: "Honor One Another" },
      { day: 19, reference: "1 John 3:17-18", title: "Love with Actions" },
      { day: 20, reference: "Matthew 25:35-40", title: "Care for the Needy" },
      { day: 21, reference: "2 Corinthians 9:7", title: "Cheerful Giver" },
      { day: 22, reference: "Proverbs 11:25", title: "Generous Person" },
      { day: 23, reference: "Colossians 3:23-24", title: "Work for the Lord" },
      { day: 24, reference: "Ephesians 6:5-8", title: "Serve Wholeheartedly" },
      { day: 25, reference: "1 Corinthians 10:31", title: "Do It All for God" },
      { day: 26, reference: "Daniel 1:8", title: "Resolve Not to Defile" },
      { day: 27, reference: "Genesis 39:2-6", title: "God with Joseph" },
      { day: 28, reference: "1 Timothy 4:12", title: "Set an Example" },
    ],
  },
  {
    id: "plan-leadership",
    name: "Biblical Leadership",
    description: "Learn servant leadership principles from Scripture.",
    duration: 21,
    category: "Topical",
    difficulty: "Intermediate",
    readings: [
      {
        day: 1,
        reference: "Exodus 18:13-27",
        title: "Jethro's Advice to Moses",
      },
      { day: 2, reference: "1 Samuel 16:1-13", title: "David Chosen as King" },
      { day: 3, reference: "Nehemiah 1-2", title: "Nehemiah's Leadership" },
      { day: 4, reference: "Matthew 20:20-28", title: "Servant Leadership" },
      { day: 5, reference: "John 13:1-17", title: "Jesus Washes Feet" },
      {
        day: 6,
        reference: "1 Timothy 3:1-13",
        title: "Qualifications for Leadership",
      },
      { day: 7, reference: "Titus 1:5-9", title: "Appointing Elders" },
      { day: 8, reference: "1 Peter 5:1-4", title: "Shepherd the Flock" },
      { day: 9, reference: "Proverbs 11:14", title: "Wisdom in Leadership" },
      { day: 10, reference: "Proverbs 29:18", title: "Vision" },
      {
        day: 11,
        reference: "Acts 6:1-7",
        title: "Delegating Responsibilities",
      },
      { day: 12, reference: "Numbers 27:15-23", title: "Joshua Commissioned" },
      { day: 13, reference: "Daniel 6", title: "Daniel's Integrity" },
      { day: 14, reference: "2 Timothy 2:1-13", title: "Enduring Hardship" },
      { day: 15, reference: "James 1:19-27", title: "Listening and Doing" },
      { day: 16, reference: "Philippians 2:1-11", title: "Christ's Humility" },
      { day: 17, reference: "Acts 15:1-35", title: "Council in Jerusalem" },
      { day: 18, reference: "Exodus 3-4", title: "Moses Called to Lead" },
      { day: 19, reference: "1 Kings 3:5-15", title: "Solomon's Wisdom" },
      { day: 20, reference: "Galatians 6:1-10", title: "Bearing Burdens" },
      { day: 21, reference: "Hebrews 13:7-17", title: "Remember Your Leaders" },
    ],
  },
  {
    id: "plan-paul-epistles",
    name: "Journey Through Paul's Letters",
    description: "Explore Paul's teachings in chronological order of writing.",
    duration: 60,
    category: "Book Study",
    difficulty: "Intermediate",
    readings: [
      // Galatians (Days 1-6)
      { day: 1, reference: "Galatians 1", title: "Paul's Authority Defended" },
      { day: 2, reference: "Galatians 2", title: "Justification by Faith" },
      { day: 3, reference: "Galatians 3", title: "Abraham's Faith" },
      { day: 4, reference: "Galatians 4", title: "Children of Promise" },
      { day: 5, reference: "Galatians 5", title: "Freedom in Christ" },
      { day: 6, reference: "Galatians 6", title: "Bear One Another's Burdens" },

      // 1 & 2 Thessalonians (Days 7-12)
      { day: 7, reference: "1 Thessalonians 1", title: "Model Church" },
      { day: 8, reference: "1 Thessalonians 2-3", title: "Paul's Ministry" },
      { day: 9, reference: "1 Thessalonians 4-5", title: "Living for Christ" },
      { day: 10, reference: "2 Thessalonians 1", title: "God's Justice" },
      {
        day: 11,
        reference: "2 Thessalonians 2",
        title: "The Man of Lawlessness",
      },
      { day: 12, reference: "2 Thessalonians 3", title: "Don't Be Idle" },

      // 1 & 2 Corinthians (Days 13-24)
      { day: 13, reference: "1 Corinthians 1-2", title: "Wisdom of the Cross" },
      { day: 14, reference: "1 Corinthians 3-4", title: "Servants of Christ" },
      { day: 15, reference: "1 Corinthians 5-6", title: "Church Discipline" },
      {
        day: 16,
        reference: "1 Corinthians 7",
        title: "Marriage and Singleness",
      },
      {
        day: 17,
        reference: "1 Corinthians 8-9",
        title: "Food Sacrificed to Idols",
      },
      { day: 18, reference: "1 Corinthians 10", title: "Warnings from Israel" },
      { day: 19, reference: "1 Corinthians 11", title: "Head Coverings" },
      { day: 20, reference: "1 Corinthians 12", title: "Spiritual Gifts" },
      { day: 21, reference: "1 Corinthians 13", title: "The Way of Love" },
      { day: 22, reference: "1 Corinthians 14", title: "Prophecy and Tongues" },
      { day: 23, reference: "1 Corinthians 15", title: "The Resurrection" },
      { day: 24, reference: "1 Corinthians 16", title: "Final Instructions" },
      {
        day: 25,
        reference: "2 Corinthians 1-2",
        title: "Comfort in Suffering",
      },
      { day: 26, reference: "2 Corinthians 3-4", title: "The New Covenant" },
      {
        day: 27,
        reference: "2 Corinthians 5-6",
        title: "Ministry of Reconciliation",
      },
      { day: 28, reference: "2 Corinthians 7", title: "Godly Sorrow" },
      { day: 29, reference: "2 Corinthians 8-9", title: "Generous Giving" },
      { day: 30, reference: "2 Corinthians 10-11", title: "Paul's Defense" },
      {
        day: 31,
        reference: "2 Corinthians 12-13",
        title: "Paul's Final Words",
      },

      // Romans (Days 32-43)
      { day: 32, reference: "Romans 1", title: "The Gospel and God's Wrath" },
      { day: 33, reference: "Romans 2-3", title: "All Have Sinned" },
      { day: 34, reference: "Romans 4", title: "Abraham Justified by Faith" },
      { day: 35, reference: "Romans 5", title: "Peace with God" },
      { day: 36, reference: "Romans 6", title: "Dead to Sin, Alive in Christ" },
      { day: 37, reference: "Romans 7", title: "Struggle with Sin" },
      { day: 38, reference: "Romans 8", title: "Life in the Spirit" },
      { day: 39, reference: "Romans 9", title: "God's Sovereign Choice" },
      { day: 40, reference: "Romans 10", title: "Salvation for All" },
      { day: 41, reference: "Romans 11", title: "The Remnant of Israel" },
      { day: 42, reference: "Romans 12", title: "Living Sacrifices" },
      { day: 43, reference: "Romans 13-14", title: "Submission and Freedom" },
      { day: 44, reference: "Romans 15-16", title: "Final Greetings" },

      // Prison Epistles (Days 45-54)
      { day: 45, reference: "Ephesians 1", title: "Spiritual Blessings" },
      { day: 46, reference: "Ephesians 2-3", title: "Unity in Christ" },
      { day: 47, reference: "Ephesians 4", title: "Unity and Maturity" },
      { day: 48, reference: "Ephesians 5-6", title: "Household Code" },
      {
        day: 49,
        reference: "Philippians 1",
        title: "Partnership in the Gospel",
      },
      { day: 50, reference: "Philippians 2", title: "Christ's Humility" },
      { day: 51, reference: "Philippians 3", title: "Pressing On" },
      { day: 52, reference: "Philippians 4", title: "Rejoice Always" },
      { day: 53, reference: "Colossians 1-2", title: "Supremacy of Christ" },
      { day: 54, reference: "Colossians 3-4", title: "New Life in Christ" },

      // Pastoral Epistles (Days 55-60)
      {
        day: 55,
        reference: "1 Timothy 1-2",
        title: "Instructions for the Church",
      },
      { day: 56, reference: "1 Timothy 3-4", title: "Church Leadership" },
      { day: 57, reference: "1 Timothy 5-6", title: "Various Instructions" },
      { day: 58, reference: "2 Timothy 1-2", title: "Be Strong in Grace" },
      { day: 59, reference: "2 Timothy 3-4", title: "Final Instructions" },
      { day: 60, reference: "Philemon", title: "Forgiveness and Restoration" },
    ],
  },
  {
    id: "plan-old-testament-overview",
    name: "Old Testament Overview",
    description:
      "Journey through the major themes and stories of the Old Testament.",
    duration: 90,
    category: "Overview",
    difficulty: "Intermediate",
    readings: [
      // Genesis (Days 1-10)
      { day: 1, reference: "Genesis 1-2", title: "Creation" },
      { day: 2, reference: "Genesis 3", title: "The Fall" },
      { day: 3, reference: "Genesis 4-5", title: "Cain and Abel" },
      { day: 4, reference: "Genesis 6-9", title: "Noah and the Flood" },
      { day: 5, reference: "Genesis 10-11", title: "Tower of Babel" },
      { day: 6, reference: "Genesis 12-14", title: "Abraham's Call" },
      { day: 7, reference: "Genesis 15-17", title: "God's Covenant" },
      { day: 8, reference: "Genesis 18-19", title: "Sodom and Gomorrah" },
      { day: 9, reference: "Genesis 21-23", title: "Isaac's Birth" },
      { day: 10, reference: "Genesis 25-28", title: "Jacob and Esau" },

      // Genesis Continued (Days 11-20)
      { day: 11, reference: "Genesis 29-31", title: "Jacob's Family" },
      { day: 12, reference: "Genesis 32-34", title: "Jacob Wrestles God" },
      { day: 13, reference: "Genesis 35-37", title: "Joseph's Dreams" },
      { day: 14, reference: "Genesis 38-40", title: "Judah and Joseph" },
      { day: 15, reference: "Genesis 41-43", title: "Joseph Rises to Power" },
      { day: 16, reference: "Genesis 44-46", title: "Family Reunion" },
      { day: 17, reference: "Genesis 47-50", title: "Jacob's Blessing" },

      // Exodus (Days 18-25)
      { day: 18, reference: "Exodus 1-4", title: "Moses' Birth and Call" },
      { day: 19, reference: "Exodus 5-7", title: "Plagues Begin" },
      { day: 20, reference: "Exodus 8-10", title: "More Plagues" },
      { day: 21, reference: "Exodus 11-13", title: "Passover" },
      { day: 22, reference: "Exodus 14-16", title: "Crossing the Red Sea" },
      { day: 23, reference: "Exodus 17-20", title: "Manna and the Law" },
      { day: 24, reference: "Exodus 21-24", title: "The Covenant" },
      { day: 25, reference: "Exodus 25-31", title: "The Tabernacle" },
      { day: 26, reference: "Exodus 32-34", title: "The Golden Calf" },
      { day: 27, reference: "Exodus 35-40", title: "Building the Tabernacle" },

      // Leviticus, Numbers, Deuteronomy (Days 28-35)
      { day: 28, reference: "Leviticus 1-7", title: "Sacrificial System" },
      { day: 29, reference: "Leviticus 16", title: "Day of Atonement" },
      {
        day: 30,
        reference: "Leviticus 23-25",
        title: "Festivals and Sabbaths",
      },
      { day: 31, reference: "Numbers 1-6", title: "Census and Nazirite Vow" },
      { day: 32, reference: "Numbers 13-14", title: "The Twelve Spies" },
      { day: 33, reference: "Numbers 20-21", title: "Wilderness Wanderings" },
      { day: 34, reference: "Deuteronomy 5-7", title: "The Ten Commandments" },
      {
        day: 35,
        reference: "Deuteronomy 28-30",
        title: "Blessings and Curses",
      },

      // Joshua, Judges, Ruth (Days 36-40)
      { day: 36, reference: "Joshua 1-6", title: "Entering Canaan" },
      { day: 37, reference: "Joshua 7-12", title: "Conquest of Canaan" },
      { day: 38, reference: "Joshua 23-24", title: "Joshua's Farewell" },
      { day: 39, reference: "Judges 2-4", title: "Cycle of Sin" },
      { day: 40, reference: "Judges 6-8", title: "Gideon's Victory" },
      { day: 41, reference: "Judges 13-16", title: "Samson" },
      { day: 42, reference: "Ruth 1-4", title: "Ruth's Loyalty" },

      // 1 & 2 Samuel (Days 43-50)
      { day: 43, reference: "1 Samuel 1-3", title: "Hannah and Samuel" },
      { day: 44, reference: "1 Samuel 8-10", title: "Israel Demands a King" },
      { day: 45, reference: "1 Samuel 16-18", title: "David and Goliath" },
      { day: 46, reference: "1 Samuel 24-26", title: "David Spares Saul" },
      { day: 47, reference: "1 Samuel 31-2 Samuel 2", title: "Saul's Death" },
      { day: 48, reference: "2 Samuel 5-7", title: "David's Kingdom" },
      { day: 49, reference: "2 Samuel 11-12", title: "David and Bathsheba" },
      { day: 50, reference: "2 Samuel 22-24", title: "David's Last Words" },

      // 1 & 2 Kings (Days 51-58)
      { day: 51, reference: "1 Kings 1-3", title: "Solomon Becomes King" },
      { day: 52, reference: "1 Kings 6-8", title: "Solomon's Temple" },
      { day: 53, reference: "1 Kings 11-12", title: "Kingdom Divides" },
      { day: 54, reference: "1 Kings 17-19", title: "Elijah's Ministry" },
      { day: 55, reference: "1 Kings 21-22", title: "Ahab's Sin" },
      { day: 56, reference: "2 Kings 2-5", title: "Elisha's Ministry" },
      { day: 57, reference: "2 Kings 17-18", title: "Israel Falls" },
      { day: 58, reference: "2 Kings 22-25", title: "Judah's Exile" },

      // Major Prophets (Days 59-75)
      { day: 59, reference: "Isaiah 1-6", title: "Isaiah's Call" },
      { day: 60, reference: "Isaiah 7-12", title: "Immanuel Prophecy" },
      { day: 61, reference: "Isaiah 40-45", title: "Comfort and Restoration" },
      { day: 62, reference: "Isaiah 52-53", title: "Suffering Servant" },
      { day: 63, reference: "Jeremiah 1-7", title: "Jeremiah's Call" },
      { day: 64, reference: "Jeremiah 20-25", title: "Jeremiah's Suffering" },
      { day: 65, reference: "Jeremiah 29-31", title: "Hope and Restoration" },
      { day: 66, reference: "Ezekiel 1-3", title: "Ezekiel's Vision" },
      { day: 67, reference: "Ezekiel 18-20", title: "Personal Responsibility" },
      {
        day: 68,
        reference: "Ezekiel 33-37",
        title: "Watchman and Restoration",
      },
      { day: 69, reference: "Daniel 1-3", title: "Faithfulness in Exile" },
      { day: 70, reference: "Daniel 4-6", title: "God's Sovereignty" },
      { day: 71, reference: "Daniel 7-9", title: "Visions of the Future" },

      // Minor Prophets (Days 72-90)
      { day: 72, reference: "Hosea 1-4", title: "God's Unfailing Love" },
      { day: 73, reference: "Joel 1-3", title: "Day of the Lord" },
      { day: 74, reference: "Amos 1-5", title: "Justice for the Poor" },
      { day: 75, reference: "Jonah 1-4", title: "God's Mercy" },
      { day: 76, reference: "Micah 4-7", title: "Justice and Mercy" },
      { day: 77, reference: "Nahum 1-3", title: "Nineveh's Fall" },
      { day: 78, reference: "Habakkuk 1-3", title: "The Just Shall Live" },
      { day: 79, reference: "Zephaniah 1-3", title: "Day of the Lord" },
      { day: 80, reference: "Haggai 1-2", title: "Rebuild the Temple" },
      { day: 81, reference: "Zechariah 1-4", title: "Visions of Restoration" },
      { day: 82, reference: "Zechariah 9-12", title: "The Coming King" },
      { day: 83, reference: "Malachi 1-4", title: "Final Prophecy" },
    ],
  },
];

// Helper function to get plans by category
export function getPlansByCategory(
  category: ReadingPlanTemplate["category"],
): ReadingPlanTemplate[] {
  return readingPlansData.filter((plan) => plan.category === category);
}

// Helper function to get plans by difficulty
export function getPlansByDifficulty(
  difficulty: ReadingPlanTemplate["difficulty"],
): ReadingPlanTemplate[] {
  return readingPlansData.filter((plan) => plan.difficulty === difficulty);
}

// Helper function to search plans
export function searchPlans(query: string): ReadingPlanTemplate[] {
  const lowerQuery = query.toLowerCase();
  return readingPlansData.filter(
    (plan) =>
      plan.name.toLowerCase().includes(lowerQuery) ||
      plan.description.toLowerCase().includes(lowerQuery),
  );
}
