// Initialize Supabase client
const SUPABASE_URL = 'https://iidkcfwzrqwmmnfboifr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZGtjZnd6cnF3bW1uZmJvaWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjIwNDUsImV4cCI6MjA2MDI5ODA0NX0.jmftq3ibRE8oLtJdR0GpSlV6BA8-x7sgn67W8VLmm6o';

// When using the CDN version, the createClient function is available globally
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is authenticated
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
    
    return session;
}

// Check if user has the correct role
async function checkUserRole(requiredRole) {
    const session = await checkAuth();
    
    if (!session) return;
    
    try {
        // Get user profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
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
        
        // Check if user has the required role
        if (profile.role !== requiredRole) {
            // Redirect to the correct dashboard based on role
            window.location.href = `dashboard-${profile.role}.html`;
        }
    } catch (error) {
        console.error('Error checking user role:', error.message);
        // Redirect to login on error
        window.location.href = 'index.html';
    }
}

// Handle logout
if (document.getElementById('logout-button')) {
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error.message);
        }
    });
}