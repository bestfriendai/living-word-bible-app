# Supabase Setup Guide for Bible App

_Complete Implementation for Authentication, Database, and Storage_

## Overview

This guide walks through setting up Supabase for the Bible app with user authentication, database schema, and storage. We'll implement a hybrid approach keeping SQLite for offline use and Supabase for cloud sync.

## Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version

# Install required packages in your React Native project
npm install @supabase/supabase-js @supabase/auth-helpers-react-native @react-native-async-storage/async-storage @react-native-netinfo/netinfo
```

## Step 1: Initialize Supabase Project

### 1.1 Create Supabase Project

```bash
# Go to https://supabase.com/dashboard
# Create new project:
# - Name: bible-app
# - Database Password: [generate strong password]
# - Region: Choose closest to your users
# - Wait for project to be ready (2-3 minutes)
```

### 1.2 Initialize Local Development

```bash
# In your project root
supabase init

# Link to your cloud project
supabase link --project-ref YOUR_PROJECT_REF

# Start local development
supabase start
```

### 1.3 Get Project Keys

```bash
# Get your project URL and anon key
supabase status

# Or find in Dashboard > Project Settings > API
# Copy:
# - Project URL
# - anon public key
# - service_role key (server-side only)
```

## Step 2: Environment Configuration

### 2.1 Create Environment File

```bash
# Create .env file in project root
touch .env
```

### 2.2 Add Environment Variables

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For development (optional)
EXPO_PUBLIC_SUPABASE_LOCAL_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_LOCAL_ANON_KEY=your-local-anon-key
```

### 2.3 Update .gitignore

```gitignore
# Add to .gitignore
.env
.env.local
.env.production
```

## Step 3: Supabase Client Setup

### 3.1 Create Supabase Client Service

```typescript
// src/services/supabaseClient.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NetInfo } from "@react-native-netinfo/netinfo";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  global: {
    headers: {
      "x-application-name": "bible-app",
    },
  },
});

// Network-aware functions
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

export const syncWhenOnline = async (syncFunction: () => Promise<void>) => {
  const online = await isOnline();
  if (online) {
    await syncFunction();
  } else {
    console.log("Device offline, sync queued");
  }
};
```

### 3.2 Create Auth Context

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'bibleapp://auth/callback',
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bibleapp://reset-password',
    })
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Step 4: Database Schema Setup

### 4.1 Create Migration Files

```bash
# Create migrations folder
mkdir -p supabase/migrations

# Create user profiles migration
supabase migration new create_user_profiles
```

### 4.2 User Profiles Table

```sql
-- supabase/migrations/20240101000001_create_user_profiles.sql
CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  preferred_translation text DEFAULT 'NIV',
  reading_streak integer DEFAULT 0,
  total_verses_read integer DEFAULT 0,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  preferences jsonb DEFAULT '{}'::jsonb,
  notification_settings jsonb DEFAULT '{"daily_verse": true, "reading_reminder": true, "prayer_updates": false}'::jsonb
);

-- Create indexes
CREATE INDEX user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX user_profiles_streak_idx ON public.user_profiles(reading_streak);

-- RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4.3 Verse Highlights Table

```sql
-- supabase/migrations/20240101000002_create_highlights.sql
CREATE TABLE public.verse_highlights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  verse_id text NOT NULL,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  translation text DEFAULT 'NIV',
  color text NOT NULL CHECK (color IN ('yellow', 'blue', 'green', 'red', 'purple', 'orange')),
  note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX highlights_user_id_idx ON public.verse_highlights(user_id);
CREATE INDEX highlights_verse_id_idx ON public.verse_highlights(verse_id);
CREATE INDEX highlights_book_chapter_verse_idx ON public.verse_highlights(book, chapter, verse);

-- RLS
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own highlights" ON public.verse_highlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own highlights" ON public.verse_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own highlights" ON public.verse_highlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own highlights" ON public.verse_highlights FOR DELETE USING (auth.uid() = user_id);
```

### 4.4 Prayer Requests Table

```sql
-- supabase/migrations/20240101000003_create_prayer_requests.sql
CREATE TABLE public.prayer_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('general', 'health', 'family', 'work', 'spiritual', 'relationships', 'other')),
  is_anonymous boolean DEFAULT false,
  is_answered boolean DEFAULT false,
  answered_at timestamp with time zone,
  prayer_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX prayer_requests_user_id_idx ON public.prayer_requests(user_id);
CREATE INDEX prayer_requests_category_idx ON public.prayer_requests(category);
CREATE INDEX prayer_requests_created_at_idx ON public.prayer_requests(created_at DESC);

-- RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own prayer requests" ON public.prayer_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public prayer requests" ON public.prayer_requests FOR SELECT USING (is_anonymous = true);
CREATE POLICY "Users can create own prayer requests" ON public.prayer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prayer requests" ON public.prayer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prayer requests" ON public.prayer_requests FOR DELETE USING (auth.uid() = user_id);
```

### 4.5 Reading Progress Table

```sql
-- supabase/migrations/20240101000004_create_reading_progress.sql
CREATE TABLE public.reading_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  day_number integer NOT NULL,
  total_days integer NOT NULL,
  verses_read text[] DEFAULT '{}',
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX reading_progress_user_id_idx ON public.reading_progress(user_id);
CREATE INDEX reading_progress_plan_id_idx ON public.reading_progress(plan_id);
CREATE INDEX reading_progress_completed_at_idx ON public.reading_progress(completed_at);

-- RLS
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress" ON public.reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.reading_progress FOR UPDATE USING (auth.uid() = user_id);
```

### 4.6 Achievements Table

```sql
-- supabase/migrations/20240101000005_create_achievements.sql
CREATE TABLE public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL CHECK (achievement_type IN ('first_verse', 'streak_7', 'streak_30', 'streak_100', 'plan_completed', '100_verses', '1000_verses', 'sharer', 'prayer_warrior')),
  achievement_data jsonb DEFAULT '{}'::jsonb,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  points integer DEFAULT 0
);

-- Indexes
CREATE INDEX achievements_user_id_idx ON public.achievements(user_id);
CREATE INDEX achievements_type_idx ON public.achievements(achievement_type);
CREATE INDEX achievements_earned_at_idx ON public.achievements(earned_at DESC);

-- RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4.7 Apply Migrations

```bash
# Apply all migrations to local Supabase
supabase db push

# Apply to remote (production)
supabase db push --remote
```

## Step 5: Database Functions and Triggers

### 5.1 Create User Profile Trigger

```sql
-- supabase/migrations/20240101000006_create_triggers.sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_active_at = timezone('utc'::text, now())
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for activity tracking
CREATE TRIGGER update_user_activity
  AFTER INSERT ON public.verse_highlights
  FOR EACH ROW EXECUTE FUNCTION public.update_last_active();
```

## Step 6: Storage Setup

### 6.1 Create Storage Buckets

```sql
-- supabase/migrations/20240101000007_create_storage.sql
-- Insert storage policies
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('verse-images', 'verse-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', false);

-- Avatar storage policies
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own avatar" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verse image policies (public)
CREATE POLICY "Anyone can view verse images" ON storage.objects FOR SELECT USING (
  bucket_id = 'verse-images'
);

CREATE POLICY "Users can upload verse images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'verse-images' AND auth.role() = 'authenticated'
);
```

## Step 7: TypeScript Types

### 7.1 Generate Database Types

```bash
# Generate TypeScript types from database
supabase gen types typescript --local > src/types/supabase.ts
```

### 7.2 Create Extended Types

```typescript
// src/types/supabase.ts (generated + manual additions)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database types (generated by Supabase)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          preferred_translation: string;
          reading_streak: number;
          total_verses_read: number;
          joined_at: string;
          last_active_at: string;
          preferences: Json;
          notification_settings: Json;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_profiles"]["Row"],
          "id" | "joined_at" | "last_active_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["user_profiles"]["Insert"]
        >;
      };
      verse_highlights: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          book: string;
          chapter: number;
          verse: number;
          translation: string;
          color: "yellow" | "blue" | "green" | "red" | "purple" | "orange";
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["verse_highlights"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["verse_highlights"]["Insert"]
        >;
      };
      // ... other tables
    };
  };
}

// Extended types for app usage
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type VerseHighlight =
  Database["public"]["Tables"]["verse_highlights"]["Row"];
export type PrayerRequest =
  Database["public"]["Tables"]["prayer_requests"]["Row"];
export type ReadingProgress =
  Database["public"]["Tables"]["reading_progress"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
```

## Step 8: Sync Service Implementation

### 8.1 Create Sync Service

```typescript
// src/services/syncService.ts
import { supabase, syncWhenOnline } from "./supabaseClient";
import { bibleStore } from "../store/bibleStore";
import { UserProfile, VerseHighlight, PrayerRequest } from "../types/supabase";

export class SyncService {
  // Sync highlights to cloud
  async syncHighlights() {
    const localHighlights = bibleStore.highlights;

    for (const highlight of localHighlights) {
      const { error } = await supabase.from("verse_highlights").upsert(
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          verse_id: highlight.verseId,
          book: highlight.book,
          chapter: highlight.chapter,
          verse: highlight.verse,
          color: highlight.color,
          note: highlight.note,
        },
        {
          onConflict: "user_id,verse_id,translation",
        },
      );

      if (error) {
        console.error("Error syncing highlight:", error);
      }
    }
  }

  // Sync from cloud to local
  async syncFromCloud() {
    const { data: highlights, error } = await supabase
      .from("verse_highlights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching highlights:", error);
      return;
    }

    // Update local store with cloud data
    bibleStore.setHighlights(
      highlights.map((h) => ({
        id: h.id,
        verseId: h.verse_id,
        book: h.book,
        chapter: h.chapter,
        verse: h.verse,
        color: h.color,
        note: h.note,
        createdAt: new Date(h.created_at),
      })),
    );
  }

  // Auto-sync on network changes
  setupAutoSync() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.syncFromCloud();
        this.syncHighlights();
      }
    });
  }

  // Sync prayer requests
  async syncPrayerRequests() {
    const localPrayers = bibleStore.prayerRequests;

    for (const prayer of localPrayers) {
      const { error } = await supabase.from("prayer_requests").upsert(
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title: prayer.title,
          content: prayer.content,
          category: prayer.category,
          is_anonymous: prayer.isAnonymous,
        },
        {
          onConflict: "user_id,title,created_at",
        },
      );

      if (error) {
        console.error("Error syncing prayer:", error);
      }
    }
  }
}

export const syncService = new SyncService();
```

## Step 9: Integration with App

### 9.1 Update App Root

```typescript
// src/app/_layout.tsx
import { AuthProvider } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Your existing layout */}
    </AuthProvider>
  )
}
```

### 9.2 Create Auth Screens

```typescript
// src/app/auth/sign-in.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { ThemedButton } from '../../components/ThemedButton'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await signIn(email, password)

    if (error) {
      Alert.alert('Error', error.message)
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await signUp(email, password, {
      full_name: email.split('@')[0], // Default name
    })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Check your email to confirm your account')
    }
    setLoading(false)
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Welcome to Bible App
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

      <ThemedButton
        title={loading ? "Signing In..." : "Sign In"}
        onPress={handleSignIn}
        disabled={loading}
      />

      <ThemedButton
        title="Create Account"
        onPress={handleSignUp}
        variant="outline"
        disabled={loading}
      />
    </View>
  )
}
```

## Step 10: Testing Setup

### 10.1 Create Test Database

```bash
# Create test environment
supabase test new

# Seed test data
supabase db seed
```

### 10.2 Test Authentication

```typescript
// src/services/__tests__/auth.test.ts
import { supabase } from "../supabaseClient";

describe("Authentication", () => {
  test("should sign up new user", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "testpassword123",
    });

    expect(error).toBeNull();
    expect(data.user).toBeTruthy();
  });

  test("should sign in existing user", async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "testpassword123",
    });

    expect(error).toBeNull();
    expect(data.session).toBeTruthy();
  });
});
```

## Step 11: Production Deployment

### 11.1 Environment Setup

```bash
# Create production environment
supabase production prepare

# Deploy migrations
supabase db push --remote

# Deploy functions (if any)
supabase functions deploy
```

### 11.2 Security Configuration

```sql
-- Enable additional security features
ALTER ROLE authenticator SET jwt_expiry = 3600; -- 1 hour
ALTER ROLE authenticated SET jwt_expiry = 604800; -- 7 days

-- Rate limiting (if needed)
-- Configure in Supabase Dashboard > Settings > API
```

## Step 12: Monitoring and Analytics

### 12.1 Set Up Monitoring

```typescript
// src/services/analyticsService.ts
import { supabase } from "./supabaseClient";

export const trackUserActivity = async (activity: string, metadata?: any) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("user_activity").insert({
      user_id: user.id,
      activity,
      metadata,
      created_at: new Date().toISOString(),
    });
  }
};
```

### 12.2 Error Tracking

```typescript
// src/services/errorService.ts
export const logError = async (error: Error, context?: any) => {
  console.error("App Error:", error, context);

  // Log to Supabase for debugging
  await supabase.from("error_logs").insert({
    error_message: error.message,
    stack_trace: error.stack,
    context,
    created_at: new Date().toISOString(),
  });
};
```

## Next Steps

1. **Run migrations**: `supabase db push`
2. **Test authentication**: Create test users
3. **Implement sync**: Add sync buttons to UI
4. **Handle offline**: Implement queue for offline actions
5. **Add real-time**: Subscribe to prayer request updates
6. **Monitor usage**: Set up analytics and error tracking

## Troubleshooting

### Common Issues

**CORS Errors**:

```sql
-- Add to supabase/migrations/20240101000008_cors.sql
INSERT INTO cors.allowed_origins (origin) VALUES ('exp://*');
INSERT INTO cors.allowed_origins (origin) VALUES ('bibleapp://*');
```

**Auth Redirect Issues**:

```typescript
// In app.config.ts
export default {
  expo: {
    scheme: "bibleapp",
    extra: {
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
```

**Sync Conflicts**:

```typescript
// Implement conflict resolution in syncService.ts
const resolveConflict = (local: any, remote: any) => {
  // Use last updated timestamp
  return new Date(local.updated_at) > new Date(remote.updated_at)
    ? local
    : remote;
};
```

This setup provides a complete foundation for user authentication, data synchronization, and cloud storage while maintaining your existing offline capabilities with SQLite.
