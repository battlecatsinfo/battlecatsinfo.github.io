function normalizePath(s) {
	return s.replace(/[\s:\/&'!]/g, '_').replace(/\+/g, '');
}

module.exports = {
	normalizePath,
};
