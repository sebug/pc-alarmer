/* global fetch */
async function getRecipientLists() {
    var res = await fetch('/api/GetRecipientListsTrigger', {
	credentials: 'include'
    });
    return res.json;
}

function loadRecipientLists() {
    return getRecipientLists().then(function (recipientLists) {
	console.log(recipientLists);
    });
}

export default {
    loadRecipientLists: loadRecipientLists
};
