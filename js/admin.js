document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    
    if (!profile?.is_admin) {
        document.getElementById('not-admin').classList.remove('hidden');
        return;
    }
    
    document.getElementById('admin-content').classList.remove('hidden');
    
    // Load users
    await loadUsers();
    
    // Set up modals
    setupModals();
    
    // Add user button
    document.getElementById('add-user-btn').addEventListener('click', () => {
        document.getElementById('add-user-modal').classList.remove('hidden');
    });
    
    // Add user form
    document.getElementById('add-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorElement = document.getElementById('add-user-error');
        errorElement.textContent = '';
        
        const username = document.getElementById('new-username').value;
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;
        const isAdmin = document.getElementById('new-is-admin').checked;
        
        // Validate username (alphanumeric and underscores)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errorElement.textContent = 'Username can only contain letters, numbers and underscores';
            return;
        }
        
        // Check if username already exists
        const { data: existingUsername, error: usernameError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
        
        if (existingUsername) {
            errorElement.textContent = 'Username already exists';
            return;
        }
        
        // Check if email already exists
        const { data: existingEmail, error: emailError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
        
        if (existingEmail) {
            errorElement.textContent = 'Email already exists';
            return;
        }
        
        // Create auth user
        const { data: { user: newUser }, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
        });
        
        if (authError) {
            errorElement.textContent = authError.message;
            return;
        }
        
        // Add to profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: newUser.id, 
                    username,
                    email,
                    is_admin: isAdmin 
                }
            ]);
        
        if (profileError) {
            errorElement.textContent = 'User created but profile failed: ' + profileError.message;
            return;
        }
        
        alert('User created successfully!');
        document.getElementById('add-user-modal').classList.add('hidden');
        document.getElementById('add-user-form').reset();
        await loadUsers();
    });
    
    // Edit user form
    document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorElement = document.getElementById('edit-user-error');
        errorElement.textContent = '';
        
        const userId = document.getElementById('edit-user-id').value;
        const username = document.getElementById('edit-username').value;
        const email = document.getElementById('edit-email').value;
        const password = document.getElementById('edit-password').value;
        const isAdmin = document.getElementById('edit-is-admin').checked;
        
        // Validate username (alphanumeric and underscores)
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errorElement.textContent = 'Username can only contain letters, numbers and underscores';
            return;
        }
        
        // Check if username is already taken by another user
        const { data: existingUsername, error: usernameError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .neq('id', userId)
            .single();
        
        if (existingUsername) {
            errorElement.textContent = 'Username already taken by another user';
            return;
        }
        
        // Check if email is already taken by another user
        const { data: existingEmail, error: emailError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .neq('id', userId)
            .single();
        
        if (existingEmail) {
            errorElement.textContent = 'Email already taken by another user';
            return;
        }
        
        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ username, email, is_admin: isAdmin })
            .eq('id', userId);
        
        if (profileError) {
            errorElement.textContent = profileError.message;
            return;
        }
        
        // Update password if provided
        if (password) {
            if (password.length < 6) {
                errorElement.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                userId,
                { password }
            );
            
            if (updateError) {
                errorElement.textContent = 'Profile updated but password change failed: ' + updateError.message;
                return;
            }
        }
        
        alert('User updated successfully!');
        document.getElementById('edit-user-modal').classList.add('hidden');
        await loadUsers();
    });
});

async function loadUsers() {
    const tbody = document.getElementById('users-table');
    tbody.innerHTML = '<tr><td colspan="4">Loading users...</td></tr>';
    
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, email, is_admin')
        .order('created_at', { ascending: false });
    
    if (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="error">Error loading users: ${error.message}</td></tr>`;
        return;
    }
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.is_admin ? 'Yes' : 'No'}</td>
            <td class="actions">
                <button class="button button-small edit-user" data-id="${user.id}">Edit</button>
                <button class="button button-small button-outline delete-user" data-id="${user.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Set up edit buttons
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', async () => {
            const userId = button.getAttribute('data-id');
            await openEditModal(userId);
        });
    });
    
    // Set up delete buttons
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', async () => {
            const userId = button.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this user?')) {
                await deleteUser(userId);
            }
        });
    });
}

async function openEditModal(userId) {
    const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        alert('Error loading user: ' + error.message);
        return;
    }
    
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-is-admin').checked = user.is_admin;
    document.getElementById('edit-password').value = '';
    
    document.getElementById('edit-user-modal').classList.remove('hidden');
}

async function deleteUser(userId) {
    // First check if user is trying to delete themselves
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser.id === userId) {
        alert('You cannot delete your own account while logged in.');
        return;
    }
    
    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
        alert('Error deleting user from auth: ' + authError.message);
        return;
    }
    
    // Delete from profiles
    const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
    
    if (profileError) {
        alert('User deleted from auth but profile deletion failed: ' + profileError.message);
        return;
    }
    
    alert('User deleted successfully!');
    await loadUsers();
}

function setupModals() {
    // Close modals when clicking X
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').classList.add('hidden');
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Prevent modal close when clicking inside modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}