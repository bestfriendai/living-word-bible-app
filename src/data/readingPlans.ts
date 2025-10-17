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

  // MORE TOPICAL PLANS
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
