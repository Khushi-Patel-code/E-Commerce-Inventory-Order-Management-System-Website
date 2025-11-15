exports.viewDashboard = async (req, res) => {
    //Ex: return summary of orders or users
    res.json({message: `Welcome Admin ${req.user.id}, here's your dashboard.`});
}

exports.getAdminProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT user_id, username, email FROM users WHERE user_id = ?",
            [req.params.id]
        );

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.updateAdminProfile = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (password && password.trim() !== "") {
            await pool.query(
                "UPDATE users SET username = ?, password_hash = ? WHERE user_id = ?",
                [username, password, req.params.id]
            );
        } else {
            await pool.query(
                "UPDATE users SET username = ? WHERE user_id = ?",
                [username, req.params.id]
            );
        }

        res.json({ message: "Profile updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
