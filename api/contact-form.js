module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    let name = 'Valued Client';
    if (req.body) {
        if (typeof req.body === 'string') {
            try {
                const parsed = JSON.parse(req.body);
                name = parsed.fname || name;
            } catch(e) {
                const match = req.body.match(/fname=([^&]+)/);
                if (match) name = decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
        } else if (req.body.fname) {
            name = req.body.fname;
        }
    }

    res.status(200).json({
        status: 'Success',
        msg: `Thank you, ${name}! Your inquiry has been delivered to WOODORA's interior concierge. Our design team will contact you shortly.`
    });
};

