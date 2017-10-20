/* global fetch */
async function getRecipientLists() {
    var res = await fetch('/api/GetRecipientListsTrigger', {
	credentials: 'include'
    });
    return res.json;
}

function loadRecipientLists() {
    getRecipientLists().then(function (recpientLists) {
	console.log(recipientLists);
    });
}

export default {
    loadRecipientLists: loadRecipientLists
};
