
// Hook ------------------------------------------------------------------------
export const useUrl = () =>
{
	// Function -----------------------
	function getHash()
	{
		return window.location.hash;
	}

	function setHash(hash)
	{
		window.location.hash = `#${ hash }`;
	}

	// Expose -------------------------
	return {
		getHash, setHash,
	};
};
