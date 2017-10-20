/* global fetch */
async function getRecipientLists() {
    var res = await fetch('/api/GetRecipientListsTrigger', {
	credentials: 'include'
    });
    return res.json();
}

function loadRecipientLists() {
    return getRecipientLists().then(function (recipientLists) {
	if (recipientLists) {
	    for (const recipientList of recipientLists) {
		$('.recipients-dropdown .menu').append('<div class="item" data-value="' + recipientList.Code + '">' + recipientList.Name + '</div>');
	    }
	}
	$('.recipients-dropdown').dropdown();
    });
}

export default {
    loadRecipientLists: loadRecipientLists
};
