const { supabase } = require("../config/supabaseConfig");


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({ 
        message: 'Login successful',
        user: data.user,
        token : data.session ? data.session.access_token : null
    });
}

module.exports = {
    login,
}