-- OBOOK Database Schema
-- Complete schema for OBOOK social media platform
-- SQLite version with TEXT-only fields for broad compatibility

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    profileBio TEXT,
    profileImageUrl TEXT,
    coverImageUrl TEXT,
    isVerified BOOLEAN DEFAULT 0,
    isPublic BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    postId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    imageUrls TEXT,
    videoUrls TEXT,
    latitude REAL,
    longitude REAL,
    isPublic BOOLEAN DEFAULT 1,
    likeCount INTEGER DEFAULT 0,
    commentCount INTEGER DEFAULT 0,
    shareCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    commentId INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    imageUrls TEXT,
    likeCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Likes Table
CREATE TABLE IF NOT EXISTS likes (
    likeId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER,
    commentId INTEGER,
    likeType TEXT DEFAULT 'post',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
    FOREIGN KEY (commentId) REFERENCES comments(commentId) ON DELETE CASCADE,
    UNIQUE(userId, postId, commentId)
);

-- Followers Table
CREATE TABLE IF NOT EXISTS followers (
    followerId INTEGER PRIMARY KEY AUTOINCREMENT,
    followingUserId INTEGER NOT NULL,
    followedUserId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (followingUserId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (followedUserId) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE(followingUserId, followedUserId)
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    bookmarkId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
    UNIQUE(userId, postId)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    triggeredByUserId INTEGER,
    notificationType TEXT NOT NULL,
    postId INTEGER,
    commentId INTEGER,
    notificationText TEXT,
    isRead BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (triggeredByUserId) REFERENCES users(userId) ON DELETE SET NULL,
    FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
    FOREIGN KEY (commentId) REFERENCES comments(commentId) ON DELETE CASCADE
);

-- Direct Messages Table
CREATE TABLE IF NOT EXISTS directMessages (
    messageId INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    recipientId INTEGER NOT NULL,
    messageContent TEXT NOT NULL,
    mediaUrls TEXT,
    isRead BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL,
    FOREIGN KEY (senderId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (recipientId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Hashtags Table
CREATE TABLE IF NOT EXISTS hashtags (
    hashtagId INTEGER PRIMARY KEY AUTOINCREMENT,
    hashtagName TEXT UNIQUE NOT NULL,
    usageCount INTEGER DEFAULT 1,
    lastUsedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Post Hashtags Junction Table
CREATE TABLE IF NOT EXISTS postHashtags (
    postHashtagId INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    hashtagId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
    FOREIGN KEY (hashtagId) REFERENCES hashtags(hashtagId) ON DELETE CASCADE,
    UNIQUE(postId, hashtagId)
);

-- Reports/Moderation Table
CREATE TABLE IF NOT EXISTS reports (
    reportId INTEGER PRIMARY KEY AUTOINCREMENT,
    reportedByUserId INTEGER NOT NULL,
    reportedPostId INTEGER,
    reportedCommentId INTEGER,
    reportedUserId INTEGER,
    reportType TEXT NOT NULL,
    reportDescription TEXT,
    reportStatus TEXT DEFAULT 'pending',
    moderatorNotes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolvedAt DATETIME NULL,
    FOREIGN KEY (reportedByUserId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (reportedPostId) REFERENCES posts(postId) ON DELETE CASCADE,
    FOREIGN KEY (reportedCommentId) REFERENCES comments(commentId) ON DELETE CASCADE,
    FOREIGN KEY (reportedUserId) REFERENCES users(userId) ON DELETE CASCADE
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS userSettings (
    settingId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER UNIQUE NOT NULL,
    theme TEXT DEFAULT 'light',
    notificationsEnabled BOOLEAN DEFAULT 1,
    emailNotificationsEnabled BOOLEAN DEFAULT 1,
    privateAccount BOOLEAN DEFAULT 0,
    allowMessages BOOLEAN DEFAULT 1,
    allowComments BOOLEAN DEFAULT 1,
    twoFactorEnabled BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activityLog (
    activityId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    activityType TEXT NOT NULL,
    postId INTEGER,
    commentId INTEGER,
    activityDetails TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Verification Codes Table
CREATE TABLE IF NOT EXISTS verificationCodes (
    codeId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    verificationCode TEXT UNIQUE NOT NULL,
    verificationType TEXT DEFAULT 'email',
    isUsed BOOLEAN DEFAULT 0,
    expiresAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts(createdAt);
CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments(postId);
CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments(userId);
CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes(userId);
CREATE INDEX IF NOT EXISTS idx_likes_postId ON likes(postId);
CREATE INDEX IF NOT EXISTS idx_followers_followingUserId ON followers(followingUserId);
CREATE INDEX IF NOT EXISTS idx_followers_followedUserId ON followers(followedUserId);
CREATE INDEX IF NOT EXISTS idx_bookmarks_userId ON bookmarks(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_directMessages_senderId ON directMessages(senderId);
CREATE INDEX IF NOT EXISTS idx_directMessages_recipientId ON directMessages(recipientId);
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(hashtagName);
CREATE INDEX IF NOT EXISTS idx_activityLog_userId ON activityLog(userId);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(reportStatus);

-- Sample Data (Optional - for testing)
-- INSERT INTO users (username, email, passwordHash, firstName, lastName, profileBio)
-- VALUES ('jordanlee', 'jordan@example.com', 'hashed_password_hash_here', 'Jordan', 'Lee', 'Adventure seeker 🏔️');
--
-- INSERT INTO users (username, email, passwordHash, firstName, lastName, profileBio)
-- VALUES ('sarahchen', 'sarah@example.com', 'hashed_password_hash_here', 'Sarah', 'Chen', 'Coffee lover ☕ and photographer');
--
-- INSERT INTO posts (userId, content, isPublic)
-- VALUES (1, 'Just finished an amazing hike at sunrise! The view was absolutely incredible. 🏔️', 1);
--
-- INSERT INTO posts (userId, content, isPublic)
-- VALUES (2, 'Coffee tastes better when sharing with friends ☕', 1);
