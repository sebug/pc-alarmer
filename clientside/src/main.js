import controller from "controller";

$(document).ready(function () {
    $('.send-message').click(function (e) {
	controller.readFormSendMessage();
	e.preventDefault();
	return false;
    });
});

controller.loadRecipientLists().then(function () {
    
    console.log('Hey, seems to work');
});


