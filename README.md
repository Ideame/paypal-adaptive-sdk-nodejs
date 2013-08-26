## Adaptive Payments and Adaptive Accounts SDK

Node.js sdk for Paypal Adaptive Payments and Paypal Adaptive Accounts APIs, without dependencies

### Usage
  * Add dependency 'paypal-adaptive' in your package.json file.
  * Require 'paypal-adaptive' in your file.

    ```js
    var Paypal = require('paypal-adaptive');

    var paypalSdk = new Paypal({
	    userId:    'userId',
	    password:  'password',
	    signature: 'signature',
	    sandbox:   true
	});
    ```
  * Call to sdk methods or to the generic method callApi. If you get an error, you can check the response too for better error handling.
    ```js
    var requestData = {
        requestEnvelope: {
            errorLanguage:  'en_US',
            detailLevel:    'ReturnAll'
        },
        payKey: 'AP-1234567890'
    };

    paypalSdk.callApi('AdaptivePayments/PaymentDetails', requestData, function (err, response) {
        if (err) {
            // You can see the error
            console.log(err);
            //And the original Paypal API response too
            console.log(response);
        } else {
            // Successful response
            console.log(response);
        }
    });
    ```

### API
  * GetPaymentOptions
    ```js
    var payKey = 'AP-1234567890';

    paypalSdk.getPaymentOptions(payKey, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            // payments options for this payKey
            console.log(response);
        }
    });
    ```

  * PaymentDetails
    ```js
    // One of this params is required
    // The payKey
    var params = {
        payKey: 'AP-1234567890'
    };
    // Or the transactionId
    var params = {
        transactionId: 'AP-1234567890'
    };
    // Or the trackingId
    var params = {
        trackingId: 'AP-1234567890'
    };

    paypalSdk.paymentDetails(params, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            // payments details for this payKey, transactionId or trackingId
            console.log(response);
        }
    });
    ```

  * Pay
    ```js
    var payload = {
        requestEnvelope: {
            errorLanguage:  'en_US'
        },
        actionType:     'PAY',
        currencyCode:   'USD',
        feesPayer:      'EACHRECEIVER',
        memo:           'Chained payment example',
        cancelUrl:      'http://test.com/cancel',
        returnUrl:      'http://test.com/success',
        receiverList: {
            receiver: [
                {
                    email:  'primary@test.com',
                    amount: '100.00',
                    primary:'true'
                },
                {
                    email:  'secondary@test.com',
                    amount: '10.00',
                    primary:'false'
                }
            ]
        }
    };

    paypalSdk.pay(payload, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            // Response will have the original Paypal API response
            console.log(response);
            // But also a paymentApprovalUrl, so you can redirect the sender to checkout easily
            console.log('Redirect to %s', response.paymentApprovalUrl);
        }
    });
    ```

  * Preapproval
    ```js
    var payload = {
        currencyCode:                   'USD',
        startingDate:                   new Date().toISOString(),
        endingDate:                     new Date('2020-01-01').toISOString(),
        returnUrl:                      'http://your-website.com',
        cancelUrl:                      'http://your-website.com',
        ipnNotificationUrl:             'http://your-ipn-listener.com',
        maxNumberOfPayments:            1,
        displayMaxTotalAmount:          true,
        maxTotalAmountOfAllPayments:    '100.00',
        requestEnvelope: {
            errorLanguage:  'en_US'
        }
    }

    paypalSdk.preapproval(payload, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            // Response will have the original Paypal API response
            console.log(response);
            // But also a prepprovalUrl, so you can redirect the sender to approve the payment easily
            console.log('Redirect to %s', response.prepprovalUrl);
        }
    });
    ```

  **Note:**  
  The other API methods has default behavior by now: you send a payload and obtains the Paypal original response.

  ```js
    var payload = {
        requestEnvelope: {
            errorLanguage:  'en_US'
        },
        // another data required by API method
    };

    // For Adaptive Payments
    paypalSdk.cancelPreapproval(payload, function (err, response) {...} });

    paypalSdk.convertCurrency(payload, function (err, response) {...} });

    paypalSdk.executePayment(payload, function (err, response) {...} });

    paypalSdk.getFundingPlans(payload, function (err, response) {...} });

    paypalSdk.getShippingAddresses(payload, function (err, response) {...} });

    paypalSdk.preapprovalDetails(payload, function (err, response) {...} });

    paypalSdk.setPaymentOptions(payload, function (err, response) {...} });

    // For Adaptive Accounts
    paypalSdk.addBankAccount(payload, function (err, response) {...} });

    paypalSdk.addPaymentCard(payload, function (err, response) {...} });

    paypalSdk.checkComplianceStatus(payload, function (err, response) {...} });

    paypalSdk.createAccount(payload, function (err, response) {...} });

    paypalSdk.getUserAgreement(payload, function (err, response) {...} });

    paypalSdk.getVerifiedStatus(payload, function (err, response) {...} });

    paypalSdk.setFundingSourceConfirmed(payload, function (err, response) {...} });

    paypalSdk.updateComplianceStatus(payload, function (err, response) {...} });
  ```

### Tests
  Tests can be runned with:

  ```sh
  mocha
  ```

### Reference
  <a href="https://developer.paypal.com/webapps/developer/docs/classic/api/#ap" target="_blank">Paypal Adaptive Payments</a>  
  <a href="https://developer.paypal.com/webapps/developer/docs/classic/api/#aa" target="_blank">Paypal Adaptive Accounts</a>
