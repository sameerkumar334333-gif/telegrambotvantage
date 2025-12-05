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
                <img src="${submission.image_url}" 
                     alt="Screenshot" 
                     class="screenshot-thumb"
                     onclick="window.open('${submission.image_url}', '_blank')">
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
document.getElementById('refresh-btn').addEventListener('click', loadSubmissions);

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

// Initialize on page load
checkAuth();

