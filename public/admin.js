// Check authentication status on page load
async function checkAuth() {
    try {
        const response = await fetch('/admin/check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            showAdminPanel();
            loadSubmissions();
            loadStatistics();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        showLogin();
    }
}

// Show login form
function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-container').classList.add('hidden');
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-container').classList.remove('hidden');
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAdminPanel();
            loadSubmissions();
        } else {
            errorDiv.textContent = data.error || 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'An error occurred during login';
    }
});

// Logout handler
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch('/admin/logout', { 
            method: 'POST',
            credentials: 'include'
        });
        showLogin();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Load submissions from API
async function loadSubmissions() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const tbody = document.getElementById('submissions-tbody');
    const noData = document.getElementById('no-submissions');
    const table = document.getElementById('submissions-table');
    
    loading.classList.remove('hidden');
    errorMessage.classList.remove('show');
    tbody.innerHTML = '';
    
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('search-input').value;
    
    const params = new URLSearchParams();
    if (statusFilter !== 'All') {
        params.append('status', statusFilter);
    }
    if (searchTerm) {
        params.append('search', searchTerm);
    }
    
    try {
        const response = await fetch(`/api/submissions?${params.toString()}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to load submissions');
        }
        
        loading.classList.add('hidden');
        
        if (data.submissions && data.submissions.length > 0) {
            table.classList.remove('hidden');
            noData.classList.add('hidden');
            renderSubmissions(data.submissions);
        } else {
            table.classList.add('hidden');
            noData.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        loading.classList.add('hidden');
        errorMessage.textContent = error.message || 'Failed to load submissions';
        errorMessage.classList.add('show');
        table.classList.add('hidden');
        noData.classList.add('hidden');
    }
}

// Render submissions in table
function renderSubmissions(submissions) {
    const tbody = document.getElementById('submissions-tbody');
    tbody.innerHTML = '';
    
    submissions.forEach(submission => {
        const row = document.createElement('tr');
        
        const createdAt = new Date(submission.created_at).toLocaleString();
        const name = `${submission.telegram_first_name} ${submission.telegram_last_name || ''}`.trim();
        
        row.innerHTML = `
            <td>${createdAt}</td>
            <td><strong>${submission.user_uid || 'N/A'}</strong></td>
            <td>${submission.telegram_user_id}</td>
            <td>${submission.telegram_username || 'N/A'}</td>
            <td>${name}</td>
            <td>
                ${submission.image_url && submission.image_url.trim() !== '' 
                    ? `<img src="${submission.image_url}" 
                         alt="Screenshot" 
                         class="screenshot-thumb"
                         onclick="window.open('${submission.image_url}', '_blank')">`
                    : '<span style="color: #999;">No screenshot</span>'}
            </td>
            <td>
                <div class="status-control">
                    <select class="status-select ${submission.status.toLowerCase()}" 
                            data-id="${submission.id}"
                            id="status-select-${submission.id}"
                            onchange="handleStatusChange('${submission.id}')">
                        <option value="Pending" ${submission.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Approved" ${submission.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${submission.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                    <button class="btn btn-primary btn-small status-submit-btn" 
                            data-id="${submission.id}"
                            onclick="submitStatusChange('${submission.id}')"
                            style="display: none;"
                            title="Save status">
                        ✓
                    </button>
                </div>
            </td>
            <td>
                <textarea class="notes-input" 
                          data-id="${submission.id}"
                          placeholder="Add notes..."
                          onblur="updateNotes('${submission.id}', this.value)">${submission.notes || ''}</textarea>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-success btn-small" 
                            onclick="openMessageModal('${submission.id}', ${submission.telegram_user_id})">
                        📨 Send Message
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Message Modal Functions
let currentSubmissionId = null;
let currentTelegramUserId = null;

function openMessageModal(submissionId, telegramUserId) {
    currentSubmissionId = submissionId;
    currentTelegramUserId = telegramUserId;
    document.getElementById('message-text').value = '';
    document.getElementById('message-error').textContent = '';
    document.getElementById('message-error').classList.remove('show');
    document.getElementById('message-modal').classList.remove('hidden');
    document.getElementById('message-text').focus();
}

function closeMessageModal() {
    document.getElementById('message-modal').classList.add('hidden');
    currentSubmissionId = null;
    currentTelegramUserId = null;
}

// Modal event listeners
document.getElementById('close-modal').addEventListener('click', closeMessageModal);
document.getElementById('cancel-message').addEventListener('click', closeMessageModal);

// Close modal on outside click
document.getElementById('message-modal').addEventListener('click', (e) => {
    if (e.target.id === 'message-modal') {
        closeMessageModal();
    }
});

// Send message handler
document.getElementById('send-message-btn').addEventListener('click', async () => {
    const message = document.getElementById('message-text').value.trim();
    const errorDiv = document.getElementById('message-error');
    
    if (!message) {
        errorDiv.textContent = 'Please enter a message';
        errorDiv.classList.add('show');
        return;
    }
    
    if (!currentSubmissionId) {
        errorDiv.textContent = 'No submission selected';
        errorDiv.classList.add('show');
        return;
    }
    
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
    
    const sendBtn = document.getElementById('send-message-btn');
    const originalText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`/api/submissions/${currentSubmissionId}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ message }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            closeMessageModal();
            alert('Message sent successfully!');
        } else {
            errorDiv.textContent = data.error || 'Failed to send message';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        errorDiv.textContent = 'An error occurred while sending the message';
        errorDiv.classList.add('show');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
    }
});

// Handle status select change - show submit button
function handleStatusChange(id) {
    const submitBtn = document.querySelector(`.status-submit-btn[data-id="${id}"]`);
    if (submitBtn) {
        submitBtn.style.display = 'inline-block';
    }
}

// Submit status change
async function submitStatusChange(id) {
    const select = document.getElementById(`status-select-${id}`);
    const submitBtn = document.querySelector(`.status-submit-btn[data-id="${id}"]`);
    
    if (!select) return;
    
    const status = select.value;
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
    }
    
    try {
        const response = await fetch(`/api/submissions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update status');
        }
        
        // Update the select element class
        select.className = `status-select ${status.toLowerCase()}`;
        
        // Hide submit button
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
        
        // Show success feedback
        if (submitBtn) {
            submitBtn.textContent = '✓';
            submitBtn.style.background = '#4CAF50';
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.display = 'none';
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status: ' + error.message);
        // Reload to get correct state
        loadSubmissions();
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }
}

// Update submission notes
async function updateNotes(id, notes) {
    try {
        const response = await fetch(`/api/submissions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ notes }),
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update notes');
        }
    } catch (error) {
        console.error('Error updating notes:', error);
        alert('Failed to update notes: ' + error.message);
        // Reload to get correct state
        loadSubmissions();
    }
}

// Filter and search handlers
document.getElementById('status-filter').addEventListener('change', loadSubmissions);
document.getElementById('search-input').addEventListener('input', debounce(loadSubmissions, 500));
document.getElementById('refresh-btn').addEventListener('click', () => {
    loadSubmissions();
    loadStatistics();
});

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Statistics Functions
async function loadStatistics() {
    try {
        const response = await fetch('/api/messages/statistics', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('total-sent').textContent = data.totalSent || 0;
            document.getElementById('total-received').textContent = data.totalReceived || 0;
            document.getElementById('unique-users').textContent = data.uniqueUsersMessaged || 0;
            document.getElementById('total-messages').textContent = data.totalMessages || 0;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Messages Modal Functions
let currentSelectedUserId = null;
let allUsers = [];
let allMessages = [];

// Open messages modal
document.getElementById('view-messages-btn').addEventListener('click', () => {
    document.getElementById('messages-modal').classList.remove('hidden');
    loadUsers();
});

// Close messages modal
document.getElementById('close-messages-modal').addEventListener('click', () => {
    document.getElementById('messages-modal').classList.add('hidden');
    currentSelectedUserId = null;
});

// Close modal on outside click
document.getElementById('messages-modal').addEventListener('click', (e) => {
    if (e.target.id === 'messages-modal') {
        document.getElementById('messages-modal').classList.add('hidden');
        currentSelectedUserId = null;
    }
});

// Load users list
async function loadUsers() {
    try {
        const response = await fetch('/api/messages/users', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.users) {
            allUsers = data.users;
            renderUsersList(data.users);
        } else if (response.status === 503 && data.error === 'Messages table not found') {
            // Show helpful error message
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #f44336;">
                    <h3 style="color: #f44336; margin-bottom: 10px;">⚠️ Database Setup Required</h3>
                    <p style="margin-bottom: 15px;">The messages table doesn't exist in your database.</p>
                    <p style="margin-bottom: 15px; font-size: 14px; color: #666;">
                        Please run the SQL from <strong>create-messages-table.sql</strong> in your Supabase SQL Editor.
                    </p>
                    <p style="font-size: 12px; color: #999;">
                        See SETUP_MESSAGES_TABLE.md for detailed instructions.
                    </p>
                </div>
            `;
        } else {
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = `<div style="padding: 20px; text-align: center; color: #f44336;">Error: ${data.error || 'Failed to load users'}</div>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = `<div style="padding: 20px; text-align: center; color: #f44336;">Error loading users. Please check console.</div>`;
    }
}

// Render users list
function renderUsersList(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No users found</div>';
        return;
    }
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        if (currentSelectedUserId === user.telegram_user_id) {
            userItem.classList.add('active');
        }
        
        const name = `${user.telegram_first_name || ''} ${user.telegram_last_name || ''}`.trim() || 'Unknown';
        userItem.innerHTML = `
            <div class="user-item-name">${name}</div>
            <div class="user-item-username">@${user.telegram_username || 'no_username'}</div>
            <div class="user-item-id">ID: ${user.telegram_user_id}</div>
        `;
        
        userItem.addEventListener('click', () => {
            selectUser(user.telegram_user_id);
        });
        
        usersList.appendChild(userItem);
    });
}

// Search users
document.getElementById('messages-search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (!searchTerm) {
        renderUsersList(allUsers);
        return;
    }
    
    const filtered = allUsers.filter(user => {
        const name = `${user.telegram_first_name || ''} ${user.telegram_last_name || ''}`.toLowerCase();
        const username = (user.telegram_username || '').toLowerCase();
        const id = user.telegram_user_id.toString();
        return name.includes(searchTerm) || username.includes(searchTerm) || id.includes(searchTerm);
    });
    
    renderUsersList(filtered);
});

// Select user and load messages
async function selectUser(userId) {
    currentSelectedUserId = userId;
    
    // Update active state
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
        // Check if this item is for the selected user
        const itemId = item.textContent.match(/ID: (\d+)/);
        if (itemId && parseInt(itemId[1]) === userId) {
            item.classList.add('active');
        }
    });
    
    // Update chat header
    const user = allUsers.find(u => u.telegram_user_id === userId);
    if (user) {
        const name = `${user.telegram_first_name || ''} ${user.telegram_last_name || ''}`.trim() || 'Unknown';
        document.getElementById('chat-user-name').textContent = name;
        document.getElementById('chat-user-id').textContent = `@${user.telegram_username || 'no_username'} • ID: ${userId}`;
    }
    
    // Show input area
    document.getElementById('chat-input-container').classList.remove('hidden');
    
    // Load messages for this user
    await loadUserMessages(userId);
}

// Load messages for a specific user
async function loadUserMessages(userId) {
    try {
        const response = await fetch(`/api/messages?telegram_user_id=${userId}&limit=200`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.messages) {
            renderChatMessages(data.messages);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Render chat messages
function renderChatMessages(messages) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<div class="chat-placeholder"><p>No messages yet. Start the conversation!</p></div>';
        return;
    }
    
    // Sort messages by time (oldest first)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
    );
    
    sortedMessages.forEach(message => {
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${message.direction}`;
        
        const time = new Date(message.created_at).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
        
        messageBubble.innerHTML = `
            <div>${escapeHtml(message.message_text)}</div>
            <div class="message-time">${time} <span class="message-type-badge">${message.message_type}</span></div>
        `;
        
        chatMessages.appendChild(messageBubble);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Chat Input Functions
const chatInput = document.getElementById('chat-message-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatInputError = document.getElementById('chat-input-error');

// Auto-resize textarea
if (chatInput) {
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send on Enter (Shift+Enter for new line)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

// Send message function
async function sendChatMessage() {
    if (!currentSelectedUserId) {
        chatInputError.textContent = 'Please select a user first';
        chatInputError.classList.add('show');
        return;
    }

    const message = chatInput.value.trim();
    if (!message) {
        chatInputError.textContent = 'Please enter a message';
        chatInputError.classList.add('show');
        return;
    }

    // Clear error
    chatInputError.textContent = '';
    chatInputError.classList.remove('show');

    // Disable send button
    chatSendBtn.disabled = true;
    const originalText = chatSendBtn.innerHTML;
    chatSendBtn.innerHTML = '⏳';

    try {
        const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                telegram_user_id: currentSelectedUserId,
                message: message
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Clear input
            chatInput.value = '';
            chatInput.style.height = 'auto';
            
            // Reload messages to show the new one
            await loadUserMessages(currentSelectedUserId);
            
            // Refresh statistics
            loadStatistics();
        } else {
            chatInputError.textContent = data.error || 'Failed to send message';
            chatInputError.classList.add('show');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        chatInputError.textContent = 'An error occurred while sending the message';
        chatInputError.classList.add('show');
    } finally {
        chatSendBtn.disabled = false;
        chatSendBtn.innerHTML = originalText;
    }
}

// Send button click
if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
}

// Hide input when no user selected
function hideChatInput() {
    document.getElementById('chat-input-container').classList.add('hidden');
}

// Initialize on page load
checkAuth();

