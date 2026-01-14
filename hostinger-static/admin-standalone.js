// Standalone Admin Panel - Pure Client-Side
// Works on Hostinger Static Hosting with Supabase JavaScript SDK

// Initialize Supabase client
let supabaseClient = null;

// Check if Supabase is loaded and initialize
function initializeSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure the CDN script is included.');
        document.getElementById('config-warning').style.display = 'block';
        return false;
    }

    const config = window.SUPABASE_CONFIG || {};
    
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
        console.error('Supabase configuration missing. Please check config.js');
        document.getElementById('config-warning').style.display = 'block';
        return false;
    }

    if (config.SUPABASE_ANON_KEY === '') {
        console.error('Please set your SUPABASE_ANON_KEY in config.js');
        document.getElementById('config-warning').style.display = 'block';
        document.getElementById('config-warning').innerHTML = 
            '⚠️ Warning: Please set your SUPABASE_ANON_KEY in config.js file!';
        return false;
    }

    try {
        supabaseClient = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return false;
    }
}

// Simple authentication using localStorage
function isAuthenticated() {
    return localStorage.getItem('admin_authenticated') === 'true';
}

function setAuthenticated(value) {
    if (value) {
        localStorage.setItem('admin_authenticated', 'true');
    } else {
        localStorage.removeItem('admin_authenticated');
    }
}

// Check authentication status on page load
function checkAuth() {
    if (isAuthenticated()) {
        if (initializeSupabase()) {
            showAdminPanel();
            loadSubmissions();
        } else {
            showLogin();
            setAuthenticated(false);
        }
    } else {
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
    const config = window.SUPABASE_CONFIG || {};
    
    errorDiv.textContent = '';
    
    // Simple password check
    if (username === (config.ADMIN_USERNAME || 'admin') && 
        password === (config.ADMIN_PASSWORD || 'admin123')) {
        setAuthenticated(true);
        if (initializeSupabase()) {
            showAdminPanel();
            loadSubmissions();
        } else {
            errorDiv.textContent = 'Error initializing database connection. Check config.js';
        }
    } else {
        errorDiv.textContent = 'Invalid credentials';
    }
});

// Logout handler
document.getElementById('logout-btn').addEventListener('click', () => {
    setAuthenticated(false);
    showLogin();
});

// Load submissions from Supabase
async function loadSubmissions() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return;
    }

    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const tbody = document.getElementById('submissions-tbody');
    const noData = document.getElementById('no-submissions');
    const table = document.getElementById('submissions-table');
    
    loading.classList.remove('hidden');
    errorMessage.classList.remove('show');
    tbody.innerHTML = '';
    
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('search-input').value.trim();
    
    try {
        let query = supabaseClient
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter by status
        if (statusFilter && statusFilter !== 'All') {
            query = query.eq('status', statusFilter);
        }

        // Search functionality
        if (searchTerm) {
            // Try to parse as number (Telegram UID)
            const uid = parseInt(searchTerm, 10);
            if (!isNaN(uid)) {
                query = query.eq('telegram_user_id', uid);
            } else {
                // Search in username
                query = query.ilike('telegram_username', `%${searchTerm}%`);
            }
        }

        const { data, error } = await query;

        loading.classList.add('hidden');
        
        if (error) {
            throw new Error(error.message || 'Failed to load submissions');
        }
        
        if (data && data.length > 0) {
            table.classList.remove('hidden');
            noData.classList.add('hidden');
            renderSubmissions(data);
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
        const name = `${submission.telegram_first_name || ''} ${submission.telegram_last_name || ''}`.trim();
        
        row.innerHTML = `
            <td>${createdAt}</td>
            <td><strong>${submission.user_uid || 'N/A'}</strong></td>
            <td>${submission.telegram_user_id}</td>
            <td>${submission.telegram_username || 'N/A'}</td>
            <td>${name || 'N/A'}</td>
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
        `;
        
        tbody.appendChild(row);
    });
}

// Handle status select change - show submit button
function handleStatusChange(id) {
    const submitBtn = document.querySelector(`.status-submit-btn[data-id="${id}"]`);
    if (submitBtn) {
        submitBtn.style.display = 'inline-block';
    }
}

// Submit status change
async function submitStatusChange(id) {
    if (!supabaseClient) {
        alert('Database connection not available');
        return;
    }

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
        const { data, error } = await supabaseClient
            .from('submissions')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            throw new Error(error.message || 'Failed to update status');
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
    if (!supabaseClient) {
        console.error('Database connection not available');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('submissions')
            .update({ notes: notes || '' })
            .eq('id', id);
        
        if (error) {
            throw new Error(error.message || 'Failed to update notes');
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
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

