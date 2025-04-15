// import { supabase } from './supabase';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    // Check if user is already logged in
    checkSession();

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.querySelector('input[name="role"]:checked').value;

            // Disable button and show loading state
            loginButton.disabled = true;
            loginButton.textContent = 'Signing in...';
            errorMessage.classList.remove('visible');

            try {
                // Sign in with email and password
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                if (data.user) {
                    // Check if user has the selected role
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    if (profileError) throw profileError;

                    if (profileData.role !== role) {
                        throw new Error(`You are not registered as a ${role}`);
                    }

                    // Redirect to the appropriate dashboard
                    window.location.href = `dashboard-${role}.html`;
                }
            } catch (error) {
                // Show error message
                errorMessage.textContent = error.message;
                errorMessage.classList.add('visible');

                // Reset button state
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
            }
        });
    }

    // Check if user is already logged in
    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            // Get user role
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (!error && profile) {
                // Redirect to the appropriate dashboard
                window.location.href = `dashboard-${profile.role}.html`;
            }
        }
    }
});