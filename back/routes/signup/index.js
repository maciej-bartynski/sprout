module.exports = (req, res, next) => {
    return res
        .status(200)
        .json({
            success: true,
            data: {
                type: 'string',
                content: 'This is sign-up mocked content fetched from server.',
            }
        })
}