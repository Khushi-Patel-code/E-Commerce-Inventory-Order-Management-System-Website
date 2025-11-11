exports.viewDashboard = async (req, res) => {
    //Ex: return summary of orders or users
    res.json({message: `Welcome Admin ${req.user.id}, here's your dashboard.`});
}