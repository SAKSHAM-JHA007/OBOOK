// feedPageJavaScript - obookSocialMedia
// All variables and functions use camelCase convention

const feedContainer = document.getElementById('feedContainer');
const postTextarea = document.getElementById('postTextarea');
const submitPostBtn = document.getElementById('submitPostBtn');
const imageUploadBtn = document.getElementById('imageUploadBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Utility function to format time
const formatTimeAgo = (dateString) => {
    const created = new Date(dateString);
    const differenceInSeconds = Math.max(1, Math.floor((Date.now() - created.getTime()) / 1000));

    if (differenceInSeconds < 60) return 'just now';
    if (differenceInSeconds < 3600) return `${Math.floor(differenceInSeconds / 60)}m ago`;
    if (differenceInSeconds < 86400) return `${Math.floor(differenceInSeconds / 3600)}h ago`;
    if (differenceInSeconds < 2592000) return `${Math.floor(differenceInSeconds / 86400)}d ago`;
    return `${Math.floor(differenceInSeconds / 2592000)}mo ago`;
};

// Create post element from data
const createPostElement = (postData) => {
    const postDiv = document.createElement('div');
    postDiv.className = 'glassCard ambientShadow rounded-[16px] overflow-hidden';
    
    const userInitial = (postData.username || 'U')[0].toUpperCase();
    const colorClasses = ['bg-secondary', 'bg-secondary-light', 'bg-primary-container'];
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
    
    const imageHtml = postData.imageUrls 
        ? `<div class="mt-3 mx-4 rounded-xl overflow-hidden aspect-video bg-surface-variant">
             <img class="w-full h-full object-cover" alt="Post image" src="${postData.imageUrls}" />
           </div>`
        : '';

    postDiv.innerHTML = `
        <!-- Post Header -->
        <div class="p-4 border-b border-outline-variant">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-12 h-12 rounded-full ${randomColor} text-white flex items-center justify-center font-semibold">${userInitial}</div>
                    <div>
                        <div class="font-label-sm text-label-sm text-on-surface font-semibold">${postData.username || 'Anonymous'}</div>
                        <div class="text-xs text-on-surface-variant">@${(postData.username || 'user').toLowerCase()} • ${formatTimeAgo(postData.createdAt)}</div>
                    </div>
                </div>
                <button class="text-on-surface-variant hover:text-primary-container" type="button">
                    <span class="material-symbols-outlined">more_horiz</span>
                </button>
            </div>
        </div>

        <!-- Post Content -->
        <div class="px-4 pt-3 pb-2">
            <p class="font-body-md text-body-md text-on-surface leading-relaxed">${postData.content}</p>
        </div>

        <!-- Post Image -->
        ${imageHtml}

        <!-- Post Actions -->
        <div class="px-4 py-3 border-t border-outline-variant flex items-center justify-between text-on-surface-variant">
            <button class="flex items-center gap-2 hover:text-secondary transition-colors likeBtn" type="button">
                <span class="material-symbols-outlined text-lg">favorite</span>
                <span class="text-sm likeCount">${postData.likeCount || 0}</span>
            </button>
            <button class="flex items-center gap-2 hover:text-secondary transition-colors commentBtn" type="button">
                <span class="material-symbols-outlined text-lg">chat_bubble</span>
                <span class="text-sm commentCount">${postData.commentCount || 0}</span>
            </button>
            <button class="flex items-center gap-2 hover:text-secondary transition-colors shareBtn" type="button">
                <span class="material-symbols-outlined text-lg">share</span>
                <span class="text-sm shareCount">${postData.shareCount || 0}</span>
            </button>
            <button class="flex items-center gap-2 hover:text-secondary ml-auto bookmarkBtn" type="button">
                <span class="material-symbols-outlined text-lg">bookmark</span>
            </button>
        </div>
    `;

    // Add event listeners to post actions
    const likeBtn = postDiv.querySelector('.likeBtn');
    const commentBtn = postDiv.querySelector('.commentBtn');
    const shareBtn = postDiv.querySelector('.shareBtn');
    const bookmarkBtn = postDiv.querySelector('.bookmarkBtn');

    likeBtn.addEventListener('click', () => handleLikePost(postData.postId, likeBtn));
    commentBtn.addEventListener('click', () => handleCommentPost(postData.postId));
    shareBtn.addEventListener('click', () => handleSharePost(postData.postId));
    bookmarkBtn.addEventListener('click', () => handleBookmarkPost(postData.postId, bookmarkBtn));

    return postDiv;
};

// Load feed posts from server
const loadFeed = async () => {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
            throw new Error('Failed to load feed');
        }
        
        const posts = await response.json();
        
        // Clear container
        feedContainer.innerHTML = '';

        if (posts && posts.length > 0) {
            posts.forEach(post => {
                const postElement = createPostElement(post);
                feedContainer.appendChild(postElement);
            });
        } else {
            feedContainer.innerHTML = `
                <div class="text-center p-8 text-on-surface-variant">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">post_add</span>
                    <p>No posts yet. Be the first to share something!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Feed load error:', error);
        feedContainer.innerHTML = `
            <div class="text-center p-8 text-error">
                <p>Unable to load posts right now. Please try again later.</p>
            </div>
        `;
    }
};

// Submit new post
const handleSubmitPost = async () => {
    const postText = postTextarea.value.trim();

    if (!postText) {
        alert('Please write something to post');
        return;
    }

    const postPayload = {
        content: postText,
        timestamp: new Date().toISOString(),
        mediaUrls: []
    };

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postPayload)
        });

        if (!response.ok) {
            throw new Error('Failed to post');
        }

        const result = await response.json();
        postTextarea.value = '';
        
        // Reload feed to get fresh data and clear empty state if needed
        loadFeed();
    } catch (error) {
        console.error('Post submission error:', error);
        alert('Failed to post. Please try again.');
    }
};

// Handle like action
const handleLikePost = async (postId, likeBtn) => {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to like post');
        
        const likeCountSpan = likeBtn.querySelector('.likeCount');
        const currentCount = parseInt(likeCountSpan.textContent) || 0;
        likeCountSpan.textContent = currentCount + 1;
        
        likeBtn.querySelector('.material-symbols-outlined').style.color = '#ff9500';
    } catch (error) {
        console.error('Like error:', error);
    }
};

// Handle comment action
const handleCommentPost = (postId) => {
    alert(`Comment functionality coming soon for post ${postId}`);
};

// Handle share action
const handleSharePost = (postId) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Post link copied to clipboard!');
    }).catch(() => {
        alert('Post link: ' + shareUrl);
    });
};

// Handle bookmark action
const handleBookmarkPost = async (postId, bookmarkBtn) => {
    try {
        const response = await fetch(`/api/posts/${postId}/bookmark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to bookmark post');
        
        const bookmarkIcon = bookmarkBtn.querySelector('.material-symbols-outlined');
        bookmarkIcon.style.fontVariationSettings = "'FILL' 1";
    } catch (error) {
        console.error('Bookmark error:', error);
    }
};

// Handle image upload
const handleImageUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Image selected:', file.name);
            // Handle image upload to backend
            // For now, we'll add it to the textarea as reference
            postTextarea.value += `\n📷 Image: ${file.name}`;
        }
    });
    fileInput.click();
};

// Handle logout
const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/logout', { method: 'POST' })
            .then(() => {
                window.location.href = '/index.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                window.location.href = '/index.html';
            });
    }
};

// Auto-expand textarea
const autoExpandTextarea = () => {
    postTextarea.style.height = 'auto';
    postTextarea.style.height = (postTextarea.scrollHeight) + 'px';
};

// Event listeners
submitPostBtn.addEventListener('click', handleSubmitPost);
imageUploadBtn.addEventListener('click', handleImageUpload);
logoutBtn.addEventListener('click', handleLogout);
postTextarea.addEventListener('input', autoExpandTextarea);

// Button micro-interactions
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
    });
    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});

// Initialize feed on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFeed();
});
