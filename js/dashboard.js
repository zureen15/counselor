import { checkAuth, supabase } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    checkAuth().then(session => {
        if (!session) return;
        
        // Load user profile data
        loadUserProfile(session.user.id);
    });
    
    // Load user profile data
    async function loadUserProfile(userId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) throw error;
            
            // Update user name in the UI
            const userNameElement = document.getElementById('user-name');
            if (userNameElement && profile.full_name) {
                userNameElement.textContent = profile.full_name;
            }
            
            // Update welcome message
            const welcomeElement = document.getElementById('welcome-message');
            if (welcomeElement && profile.full_name) {
                welcomeElement.textContent = `Welcome, ${profile.full_name}`;
            }
            
            // Update additional user info if elements exist
            const userFullNameElement = document.getElementById('user-full-name');
            if (userFullNameElement) {
                userFullNameElement.textContent = profile.full_name;
            }
            
            const userEmailElement = document.getElementById('user-email');
            if (userEmailElement) {
                userEmailElement.textContent = profile.email;
            }
            
            const userRoleElement = document.getElementById('user-role');
            if (userRoleElement) {
                userRoleElement.textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
            }
        } catch (error) {
            console.error('Error loading user profile:', error.message);
        }
    }
});