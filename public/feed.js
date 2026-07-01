const feed = document.getElementById("feed");
const composerText = document.getElementById("oe-text");
const composerFile = document.getElementById("oe-image");
const postButton = document.getElementById("post-btn");
const errorBox = document.getElementById("composer-error");

function timeAgo(dateString) {
  const created = new Date(dateString);
  const diff = Math.max(1, Math.floor((Date.now() - created.getTime()) / 1000));

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function renderPost(post) {
  const card = document.createElement("article");
  card.className = "post-card";

  const initials = (post.username || "U").slice(0, 2).toUpperCase();
  const avatarUrl = post.avatar_path ? `/uploads/${post.avatar_path.split('/').pop()}` : null;

  card.innerHTML = `
    <div class="post-header">
      <div class="avatar">${avatarUrl ? "" : initials}</div>
      ${avatarUrl ? `<img class="avatar" src="${avatarUrl}" alt="${post.username}" />` : ""}
      <div class="post-username">${post.username || "Unknown"}</div>
    </div>
    ${post.image_path ? `<div class="post-content"><img class="post-image" src="${post.image_path}" alt="Oe image"></div>` : ""}
    ${post.text_content ? `<div class="post-text">${post.text_content}</div>` : ""}
    <div class="post-actions">
      <span>♡</span>
      <span>💬</span>
      <span>↗</span>
    </div>
    <div class="post-meta">${timeAgo(post.created_at)}</div>
  `;

  return card;
}

function renderPosts(posts) {
  feed.innerHTML = "";

  if (!posts.length) {
    feed.innerHTML = '<div class="empty-state">No Oes yet — be the first to post!</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => fragment.appendChild(renderPost(post)));
  feed.appendChild(fragment);
}

async function loadPosts() {
  try {
    const response = await fetch("/oes");
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    console.error(error);
  }
}

postButton.addEventListener("click", async () => {
  const formData = new FormData();
  const text = composerText.value.trim();
  const file = composerFile.files[0];

  if (!text && !file) {
    errorBox.textContent = "Please add text or an image.";
    return;
  }

  if (text) {
    formData.append("text_content", text);
  }

  if (file) {
    formData.append("image", file);
  }

  try {
    const response = await fetch("/oes", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      errorBox.textContent = result.error || "Unable to create Oe.";
      return;
    }

    composerText.value = "";
    composerFile.value = "";
    errorBox.textContent = "";
    feed.prepend(renderPost(result.post));
  } catch (error) {
    errorBox.textContent = "Unable to create Oe.";
    console.error(error);
  }
});

window.addEventListener("load", loadPosts);
