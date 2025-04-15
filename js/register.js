// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.SUPABASE_URL
// const supabaseKey = process.env.SUPABASE_ANON_KEY
// const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-button');
    const errorMessage = document.getElementById('error-message');
    
    // Check if user is already logged in
    checkSession();
    
    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const fullName = document.getElementById('fullName').value;
            const role = document.querySelector('input[name="role"]:checked').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.classList.add('visible');
                return;
            }
            
            // Disable button and show loading state
            registerButton.disabled = true;
            registerButton.textContent = 'Creating account...';
            errorMessage.classList.remove('visible');
            
            try {
                // Create the user
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role,
                        },
                    },
                });
                
                if (error) throw error;
                
                if (data.user) {
                    // Insert the user profile with role and email
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        full_name: fullName,
                        role,
                        email: email  // Include email in the profile
                    });
                    
                    if (profileError) throw profileError;
                    
                    // Redirect to login page with success message
                    window.location.href = 'index.html?registered=true';
                }
            } catch (error) {
                // Show error message
                errorMessage.textContent = error.message;
                errorMessage.classList.add('visible');
                
                // Reset button state
                registerButton.disabled = false;
                registerButton.textContent = 'Create Account';
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