const { supabase } = require("../config/supabaseConfig");

const signUp = async(req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: 'http://localhost:3000/home'
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ 
            message: 'User signed up successfully', 
            user: data.user,
            token : data.session ? data.session.access_token : null 
        });

    }catch (error) {
        console.error('Error during sign up:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    signUp,
}