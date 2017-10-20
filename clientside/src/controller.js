/* global fetch, $ */
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

async function sendMessage(formContent) {
    var res = await fetch('/api/SendMessageTrigger', {
	credentials: 'include',
	method: 'POST',
	headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify(formContent)
    });
    return res.json();
}

function readFormSendMessage() {
    const formContent = {
	code: $('form #code').val(),
	message: $('form #message').val()
    };
    console.log(formContent);
    $('.send-message').addClass('loading');
    sendMessage(formContent).then(function (fc) {
	$('.send-message').removeClass('loading');
    });
}

export default {
    loadRecipientLists: loadRecipientLists,
    readFormSendMessage: readFormSendMessage
};
