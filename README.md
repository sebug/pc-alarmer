### PC-Alarmer
The goal of this app is to have a small interface that allows to send an SMS alarm to a group of people. The access key is only given if we recognize the user.

	az group create --name pcAlarmerGroup --location westeurope
	az storage account create --name pcalarmer --location westeurope --resource-group pcAlarmerGroup --sku Standard_LRS
	az functionapp create --name PcAlarmer --storage-account pcalarmer --resource-group pcAlarmerGroup --consumption-plan-location westeurope


Again, set up continuous deployment from the Azure function deployment options and protect it behind Authentication.

	az storage container create --name pcalarmerstatic
	az storage blob upload --container-name pcalarmerstatic --file clientside/index.html --name index.html --content-type "text/html"
	az storage container set-permission --name pcalarmerstatic --public-access blob
	az storage blob upload --container-name pcalarmerstatic --file clientside/dist.js --name dist.js --content-type "application/javascript"
	az storage blob upload --container-name pcalarmerstatic --file clientside/polyfill.min.js --name polyfill.min.js --content-type "application/javascript"


