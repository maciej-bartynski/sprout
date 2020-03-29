module.exports = (req, res, next) => {
    return res
        .status(200)
        .json({
            success: true,
            data: {
                type: 'string',
                content: 'This is home content fetched from server.',
            }
        })
}