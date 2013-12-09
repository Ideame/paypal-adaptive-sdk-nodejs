var nock = require('nock')
    , assert = require('assert')
    , Paypal = require('..');

var paypalConfig = {
    userId: 'mockUserId',
    password: 'mockPassword',
    signature: 'mockSignature',
    sandbox: true
};

describe('callApi method', function() {
    it('should POST with correct header', function(done) {
        var mockResponse = { jjx: 'jjx' };

        var mockHttp = nock('https://svcs.sandbox.paypal.com')
            .matchHeader('X-PAYPAL-SECURITY-USERID', 'mockUserId')
            .matchHeader('X-PAYPAL-SECURITY-PASSWORD', 'mockPassword')
            .matchHeader('X-PAYPAL-SECURITY-SIGNATURE', 'mockSignature')
            .matchHeader('X-PAYPAL-APPLICATION-ID', 'APP-80W284485P519543T')
            .matchHeader('X-PAYPAL-REQUEST-DATA-FORMAT', 'JSON')
            .matchHeader('X-PAYPAL-RESPONSE-DATA-FORMAT', 'JSON')
            .post('/just-for-check-header', {})
            .reply(400, mockResponse);

        var api = new Paypal(paypalConfig);

        api.callApi('just-for-check-header', {}, function(err, res) {
            assert.equal(err.httpStatusCode, 400);
            assert.deepEqual(err.response, mockResponse);

            mockHttp.done();
            done();
        });
    });

    it('should POST with header additional headers X-PAYPAL-SANDBOX-EMAIL-ADDRESS and X-PAYPAL-DEVICE-IPADDRESS if were provided on config', function(done) {
        var mockResponse = { jjx: 'jjx' };

        var mockHttp = nock('https://svcs.sandbox.paypal.com')
            .matchHeader('X-PAYPAL-SECURITY-USERID', 'mockUserId')
            .matchHeader('X-PAYPAL-SECURITY-PASSWORD', 'mockPassword')
            .matchHeader('X-PAYPAL-SECURITY-SIGNATURE', 'mockSignature')
            .matchHeader('X-PAYPAL-APPLICATION-ID', 'APP-80W284485P519543T')
            .matchHeader('X-PAYPAL-REQUEST-DATA-FORMAT', 'JSON')
            .matchHeader('X-PAYPAL-RESPONSE-DATA-FORMAT', 'JSON')
            .matchHeader('X-PAYPAL-SANDBOX-EMAIL-ADDRESS', 'mockEmailAddress')
            .matchHeader('X-PAYPAL-DEVICE-IPADDRESS', 'mockIpAddress')
            .post('/just-for-check-extra-headers', {})
            .reply(400, mockResponse);

        var api = new Paypal({
            userId: 'mockUserId',
            password: 'mockPassword',
            signature: 'mockSignature',
            sandbox: true,
            sandboxEmailAddress: 'mockEmailAddress',
            deviceIpAddress: 'mockIpAddress'
        });

        api.callApi('just-for-check-extra-headers', {}, function(err, res) {
            assert.equal(err.httpStatusCode, 400);
            assert.deepEqual(err.response, mockResponse);

            mockHttp.done();
            done();
        });
    });

    it('should return error when status is not 200', function(done) {
        var mockResponse = { jjx: 'jjx' };

        var mockHttp = nock('https://svcs.sandbox.paypal.com')
            .post('/not-200', {})
            .reply(400, mockResponse);


        var api = new Paypal(paypalConfig);

        api.callApi('not-200', {}, function(err, res) {
            assert.equal(err.httpStatusCode, 400);
            assert.deepEqual(err.response, mockResponse);

            mockHttp.done();
            done();
        });
    });

    it('should return error when Paypal response ack is not Success or SuccessWithWarning', function(done) {
        var failureResponse = {
            responseEnvelope: {
                ack: 'NotSuccess'
            },
            error: 'errorMock'
        };

        var mockHttp = nock('https://svcs.sandbox.paypal.com')
            .post('/failure-response', {})
            .reply(200, failureResponse);


        var api = new Paypal(paypalConfig);

        api.callApi('failure-response', {}, function(err, res) {
            assert.notEqual(err, null);

            failureResponse.httpStatusCode = 200;
            assert.deepEqual(res, failureResponse);

            mockHttp.done();
            done();
        });
    });

    it('should return OK when Paypal response ack is Success', function(done) {
        var okResponse = {
            responseEnvelope: {
                ack: 'Success'
            },
            mock: 'mock'
        };

        var mockHttp = nock('https://svcs.sandbox.paypal.com')
            .post('/ok-response', {})
            .reply(200, okResponse);


        var api = new Paypal(paypalConfig);

        api.callApi('ok-response', {}, function(err, res) {
            assert.equal(err, null);

            okResponse.httpStatusCode = 200;
            assert.deepEqual(res, okResponse);

            mockHttp.done();
            done();
        });
    });

    it('should return OK when Paypal response ack is SuccessWithWarning', function(done) {
        var okResponse = {
            responseEnvelope: {
                ack: 'SuccessWithWarning'
            },
            mock: 'mock'
        };

        var mockHttp = nock('https://svcs.sandbox.paypal.com')
            .post('/ok-response', {})
            .reply(200, okResponse);


        var api = new Paypal(paypalConfig);

        api.callApi('ok-response', {}, function(err, res) {
            assert.equal(err, null);

            okResponse.httpStatusCode = 200;
            assert.deepEqual(res, okResponse);

            mockHttp.done();
            done();
        });
    });
});
