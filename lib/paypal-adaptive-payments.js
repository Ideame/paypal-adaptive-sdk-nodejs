var request = require ('request')
    , util = require('util');

function merge(a, b) {
    for (var p in b) {
        try {
            if (b[p].constructor === Object) {
                a[p] = merge(a[p], b[p]);

            } else {
                a[p] = b[p];
            }
        } catch (e) {
            a[p] = b[p];
        }
    }
    return a;
}

function defaultPayload() {
    return {
        requestEnvelope: {
            errorLanguage:  "en_US",
            detailLevel:    "ReturnAll"
        }
    };
}

var Paypal = function (config) {
    if (!config) throw new Error('Config is required');

    if (!config.userId) throw new Error('Config must have userId');

    if (!config.password) throw new Error('Config must have password');

    if (!config.signature) throw new Error('Config must have signature');

    if (!config.appId && !config.sandbox) throw new Error('Config must have appId');

    var defaultConfig = {
        requestFormat:      'JSON',
        responseFormat:     'JSON',
        sandbox:            false,
        productionUrl:      'https://svcs.paypal.com/AdaptivePayments/',
        sandboxUrl:         'https://svcs.sandbox.paypal.com/AdaptivePayments/',
        appId:              'APP-80W284485P519543T',
        approvalUrl:        'https://www.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
        sandboxApprovalUrl: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s'
    };

    this.config = merge(defaultConfig, config);
};

Paypal.prototype.callApiMethod = function (apiMethod, data, callback) {
    var config = this.config;
    var url = (config.sandbox ? config.sandboxUrl : config.productionUrl) + apiMethod;

    this.httpsRequest(url, 'POST', data, callback);
};

Paypal.prototype.httpsRequest = function(url, method, data, callback) {
    var config = this.config;

    var req = {
        url:    url,
        method: method,
        json:   data,
        headers: {
            "X-PAYPAL-SECURITY-USERID":         config.userId,
            "X-PAYPAL-SECURITY-PASSWORD":       config.password,
            "X-PAYPAL-SECURITY-SIGNATURE":      config.signature,
            "X-PAYPAL-APPLICATION-ID":          config.appId,
            "X-PAYPAL-REQUEST-DATA-FORMAT":     config.requestFormat,
            "X-PAYPAL-RESPONSE-DATA-FORMAT":    config.responseFormat
        }
    };

    request(req, function(error, response, body) {
        if (error) {
            return callback(error);
        }

        var statusCode = response.statusCode;

        if (statusCode < 200 || statusCode >= 300) {
            error = new Error('Response Status : ' + statusCode);
            error.response = response;
            error.httpStatusCode = statusCode;
            return callback(error);
        }

        if (typeof body == "string") {
            try {
                body = JSON.parse(body);
            } catch(e) {
                return callback(e);
            }
        }

        body.httpStatusCode = statusCode;

        var err = /Success$|SuccessWithWarning$/.test(body.responseEnvelope.ack) ? null : new Error(body.responseEnvelope.ack);

        callback(err, body);
    });
};

// Paypal Adaptive Payments API methods
Paypal.prototype.getPaymentOptions = function(payKey, callback) {
    if (!payKey) {
        return callback(new Error("Required 'payKey'"));
    }

    var data = defaultPayload();
    data.payKey = payKey;

    this.callApiMethod('GetPaymentOptions', data, callback);
};

Paypal.prototype.getPaymentDetails = function(params, callback) {
    if (!params.payKey && !params.transactionId && !params.trackingId) {
        return callback(new Error("Required 'payKey' or 'transactionId' or 'trackingId' on first param"));
    }

    var data = merge(defaultPayload(), params);

    this.callApiMethod('PaymentDetails', data, callback);
};

Paypal.prototype.createPayment = function(data, callback) {
    var config = this.config;

    this.callApiMethod('Pay', data, function(err, res) {
        if (err) { return callback(); }

        if (res.paymentExecStatus === 'CREATED') {
            var url = config.sandbox ? config.sandboxApprovalUrl : approvalUrl;
            res.paymentApprovalUrl = util.format(url, res.payKey);
        }

        return callback(null, res);
    });
};

Paypal.prototype.refundPayment = function(params, callback) {
    if (!params.payKey && !params.transactionId && !params.trackingId) {
        return callback(new Error("Required 'payKey' or 'transactionId' or 'trackingId' on first param"));
    }

    var data = merge(defaultPayload(), params);

    this.callApiMethod('Refund', data, callback);
};

module.exports = Paypal;