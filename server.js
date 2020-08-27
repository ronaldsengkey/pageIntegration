// Require the framework and instantiate it
const fastify = require('fastify')({
    logger: true
});
var redis = require("redis");
const path = require('path');
// const rp = require('request-promise');
const r = require('request');
const configuration = require('./config.js');

fastify.register(require('fastify-multipart'));
const FormData = require('form-data');
const fs = require('fs');
const pump = require('pump');
let serverKey = fs.readFileSync('./server.key', 'utf8');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(serverKey);
const cryptography = require('./crypto.js');
const signatureLogin = require('./signature.js');

const baseUrl = configuration.config.baseUrl;
const baseProductUrl = baseUrl;
const loginUrl = configuration.config.loginUrl;
const backendUrl = configuration.config.backendUrl;
const analyticsUrl = configuration.config.analyticsUrl;
const transactionUrl = configuration.config.transactionUrl;
const productUrl = configuration.config.productUrl;
const accPort = configuration.config.accPort;
const backendSyafriUrl = baseUrl;

client = redis.createClient();

client.on('error', function (err) {
    console.log('Redis error: ' + err);
});

var redisKey = []

// Declare a route

function iterateObject(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            iterateObject(obj[key])
        } else {
            obj[key] = cryptography.encryptMessage(obj[key]);
        }
    })
    return obj;
}

function iterateObjectDecrypt(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            iterateObjectDecrypt(obj[key])
        } else {
            obj[key] = cryptography.decryptMessage(obj[key]);
        }
    })
    return obj;
}

async function getOriginLogin() {
    let getLoginData = {
        "async": true,
        "crossDomain": true,
        "url": "http://sandbox.dashboard.ultipay.id:8100/getSession",
        "method": "GET",
        "headers": {
            "Accept": "*/*",
            "Cache-Control": "no-cache"
        }
    }
    try {
        let data = getLoginData;
        console.log('aww', data);
        let a = await actionGetPure(data);
        console.log('a', a);
        client.set("originLogin", JSON.stringify(a), redis.print);
        return a;
    } catch (e) {
        return 500;
    }
}

fastify.get('/getOriginLogin', function (req, reply) {
    client.get('originLogin', function (err, result) {
        reply.send(result);
    });
})

async function checkToken(token, secretKey, signature, idEmployee = '') {
    var loginData = await actionGet('', 'checkToken', token, signature, secretKey);
    loginData.data.token = token;
    loginData.data.origin = "frame";
    client.set("loginData" + idEmployee, JSON.stringify(loginData), redis.print);
}

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
})

// dashboard content
fastify.get('/dashboard', function (req, reply) {
    reply.sendFile('layouts/dashboard/layout.html')
})

fastify.get('/getSession', function (req, reply) {
    let idEmployee = req.headers.for;
    client.get('originLogin' + idEmployee, function (err, result) {
        reply.send(result);
    });
})

// fastify.get('/notFound', function (req, reply) {
//   reply.sendFile('layouts/notFound.html')
// })

function encryptPostBody(data) {
    let databody = data;
    var encryptedData = iterateObject(JSON.parse(databody));
    databody = JSON.stringify(encryptedData);
    return databody;
}

function getSession(idEmployee) {
    return new Promise(async (resolve, reject) => {
        try {
            client.get('originLogin' + idEmployee, async function (err, result) {
                resolve(result);
            });
        } catch (err) {
            console.log(err);
            reject(500);
        }
    })
}

fastify.post('/sendEmailReset', async function (req, reply) {
    try {
        let data = req.body;
        data.settings.url = redisKey[baseUrl] + ':' + redisKey[accPort] + data.settings.url
        data.settings.body = encryptPostBody(data);
        console.log('coba send email', data)
        let a = await actionPostDashboard(data);
        reply.send(a);
    } catch (err) {
        console.log("Error apa sih", err);
        reply.send(500);
    }
})

fastify.put('/sendNewPassword', async function (req, reply) {
    try {
        let data = req.body;
        data.settings.url = redisKey[baseUrl] + ':' + redisKey[accPort] + data.settings.url
        data.settings.body = encryptPostBody(data);
        console.log('coba send new password', data)
        let a = await actionPutDashboard(data);
        reply.send(a);
    } catch (err) {
        console.log("Error apa sih", err);
        reply.send(500);
    }
})

function actionPostDashboard(data) {
    return new Promise(async (resolve, reject) => {
        try {
            data.settings.headers.aes = cryptography.rsaEncrypt(cryptography.keyAESClient + ':' + cryptography.ivAESClient);
            data.settings.headers.clientKey = cryptography.aesEncrypt(cryptography.pub);
            let settings = data.settings;
            console.log('setting', settings);
            r.post(settings, function (error, response, body) {
                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                } else {
                    console.log('action Get body data => ', settings);
                    let result = JSON.parse(body);
                    // console.log ('action Post result => ', result)
                    resolve(result);
                }
            })
        } catch (err) {
            console.log("error action post", err);
            reject(process.env.ERRORINTERNAL_RESPONSE);
        }
    })
}

function actionPutDashboard(data) {
    return new Promise(async (resolve, reject) => {
        try {
            data.settings.headers.aes = cryptography.rsaEncrypt(cryptography.keyAESClient + ':' + cryptography.ivAESClient);
            data.settings.headers.clientKey = cryptography.aesEncrypt(cryptography.pub);
            let settings = data.settings;
            // let settings = data;
            console.log('setting', settings);
            r.put(settings, function (error, response, body) {
                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                } else {
                    let result = JSON.parse(body);
                    resolve(result);
                }
            })
        } catch (err) {
            console.log("error action put", err);
            reject(process.env.ERRORINTERNAL_RESPONSE);
        }
    })
}

fastify.get('/', function (req, reply) {
    reply.sendFile('layouts/layout-auth.html')
})

/* --------------------------- register get file --------------------------- */

fastify.get('/register', function (req, reply) {
    reply.sendFile('layouts/register.html')
})

fastify.get('/login', function (req, reply) {
    reply.sendFile('layouts/login.html')
})

fastify.post('/insertRedis', async function (request, reply) {
    try {
        let paramRedis = request.headers.param;
        let data = request.body;
        console.log('param', paramRedis);
        console.log('data', data.data);
        let bRD = await setRedisData(paramRedis, data);
        // console.log ('redis data set param ==> '+ redisKey[paramRedis])
        reply.send(bRD);
    } catch (err) {
        reply.send(err)
    }
})

async function setRedisData(param, data) {
    // console.log ('getRedisData waktu set => '+ param+' - ', data)
    try {
        client.set(param, JSON.stringify(data), redis.print);
        redisKey[param] = data
    } catch (err) {
        throw err;
    }
}

fastify.get('/getRData', async function (request, reply) {
    try {
        let data = request.headers.param;
        // let tokenData = request.headers.token;
        // console.log ('redis data get param ==> ', tokenData)
        let bGD = await getRedisData(data);
        reply.send(bGD);
    } catch (err) {
        reply.send(err)
    }
})

async function getRedisData(param) {
    return new Promise(async function (resolve, reject) {
        await client.get(param, async function (err, rep) {
            try {
                if (err) {
                    // console.log("getRedisData: ", err);
                    resolve(''); // reply is null when the key is missing
                }
                console.log('getRedisData: ', rep)
                rep = JSON.parse(rep)
                resolve(rep);
            } catch (error) {
                // console.log("getRedisData: ", error);
                resolve('')
            }
        })
    })
}

async function actionPost(data, userToken) {
    let finalUrl;
    let dataUrl = [];
    dataUrl.url = '/login/employee'
    dataUrl.server_url = baseUrl;
    dataUrl.port_url = loginUrl

    finalUrl = await convertURL(dataUrl, userToken);
    finalUrl = finalUrl.url
    finalUrl = finalUrl.replace(/"/g, '');
    console.log("final url4: ", finalUrl);

    return new Promise(async (resolve, reject) => {
        try {
            console.log('aa', userToken);
            let _headers;
            _headers = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "signature": cryptography.aesEncrypt(signatureLogin.signatureNew),
                "clientKey": cryptography.aesEncrypt(cryptography.pub),
                "aes": cryptography.rsaEncrypt(cryptography.keyAESClient + ':' + cryptography.ivAESClient)
            };
            let settings = {
                "async": true,
                "crossDomain": true,
                "url": finalUrl,
                "method": "POST",
                "headers": _headers,
                "processData": true,
                "body": encryptPostBody(JSON.stringify(data))
            };

            console.log('action post ==> ', settings)
            r.post(settings, function (error, response, body) {
                if (error) {
                    console.log('err', error);
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                } else {
                    let result = JSON.parse(body);
                    console.log('sebelum decrypt', result, settings.url);
                    try {
                        result.data = cryptography.decryptMessage(result.data);
                        console.log('setelah decrypt aaa', result);
                    } catch (e) {
                        result = result;
                    }
                    setRedisData('loginPartner', result);
                    resolve(result);
                }
            })
        } catch (err) {
            console.log("error action post", err);
            reject(process.env.ERRORINTERNAL_RESPONSE);
        }
    })
}

fastify.post('/formData/:parameter', async function (request, reply) {
    try {
        if (!request.isMultipart()) {
            reply.code(400).send(new Error('Request is not multipart'))
            return
        }
        let data = [];
        const mp = request.multipart(handler, onEnd)

        mp.on('field', function (key, value) {
            data[key] = value;
            console.log('--- mp-on', key, value)
        })

        async function onEnd(err) {
            data = Object.assign({}, data);
            console.log('--- onEnd: ', err, data);
            let param = request.params.parameter;
            let userToken = request.headers.token;
            let signature = request.headers.signature;
            let reqHeaders = request.headers;
            let a = await actionPost(data, param, userToken, true, signature, reqHeaders);
            reply.send(a);
        }

        function handler(field, file, filename, encoding, mimetype) {
            console.log("--- handler");
            console.log("field: ", field, " file: ", file, " filename: ", filename);
            data['img'] = 'public/assets/tmp/' + filename;
            pump(file, fs.createWriteStream('./public/assets/tmp/' + filename));
        }
    } catch (error) {
        console.log("eroor: ", error);
        reply.send(error);
    }
})

fastify.post('/postData/:parameter', async function (request, reply) {
    try {
        let data = request.body;
        let userToken = request.headers.token;
        console.log("postData data", data);

        let a = await actionPost(data, userToken);
        reply.send(a);
    } catch (err) {
        reply.send(err)
    }
})

fastify.get('/getData/:parameter', async function (request, reply) {
    // console.log('request.params.parameter',request.params.parameter);
    try {
        let param = request.params.parameter;
        let userToken = request.headers.token;
        let userSignature = request.headers.signature;
        let userSecretKey = request.headers.secretkey;
        let userParam = request.headers.param;

        let a = await actionGet(userParam, param, userToken, userSignature, userSecretKey);
        console.log("getData $$ : ", a);
        if (param == 'getRData') {
            if (a.responseCode == '200') {
                a = cryptr.decrypt(a.data[0].field_value)
            } else {
                a = 'null'
            }
            console.log('hasil getdata/param ' + param, a)
        }
        reply.send(a);
    } catch (err) {
        console.log('errrrr', err);
        reply.send(err)
    }
})

async function actionGet(extraParam, param, userToken, userSignature, userSecretKey) {
    console.log('gett');
    let finalUrl;
    let dataUrl = [];
    switch (param) {
        case 'checkToken':
            // finalUrl = loginUrl +  '/check/'+userToken;
            dataUrl.url = '/check/' + userToken;
            dataUrl.server_url = baseUrl
            dataUrl.port_url = loginUrl
            break;

        case 'partnerTransaction':
            dataUrl.url = '/partnerTransaction';
            dataUrl.server_url = backendSyafriUrl;
            dataUrl.port_url = transactionUrl;
            break;

        case 'getButton':
            dataUrl.url = '/gateway/button';
            dataUrl.server_url = backendSyafriUrl
            dataUrl.port_url = analyticsUrl
            break;

        case 'getAnalytics':
            dataUrl.url = '/analytic/summary';
            dataUrl.server_url = backendSyafriUrl
            dataUrl.port_url = analyticsUrl
            break;

        case 'sumPartnerTransaction':
            console.log('woesss');
            dataUrl.url = '/sumPartnerTransaction';
            dataUrl.server_url = backendSyafriUrl;
            dataUrl.port_url = transactionUrl;
            break;

        case 'listTicketTopic':
            dataUrl.url = '/customerService/list/topic';
            dataUrl.server_url = baseUrl;
            dataUrl.port_url = backendUrl;
            break

        case 'listTicketCategory':
            dataUrl.url = '/customerService/list/category';
            dataUrl.server_url = baseUrl;
            dataUrl.port_url = backendUrl;
            break
        case 'sumPartnerTransactionDashboard':
            // console.log('woes dashboard');
            dataUrl.url = '/sumPartnerTransaction';
            dataUrl.server_url = baseUrl;
            dataUrl.port_url = transactionUrl;
            break;
        case 'countAvgBalance':
            dataUrl.url = '/partnerIncomeAverage/monthly';
            dataUrl.server_url = baseUrl;
            dataUrl.port_url = transactionUrl;
            break;
        case 'countTotalProduct':
            dataUrl.url = '/transaction/basket/sum';
            dataUrl.server_url = baseUrl;
            dataUrl.port_url = productUrl;
            break;
        case 'getRData':
            finalUrl = redisKey[baseUrl] + ':' + redisKey[backendUrl] + '/master/key';
            console.log('action Get getRData ==> ', extraParam, userSignature, userSecretKey)
            // extraParam = 'all';
            break;
        case 'detailTicket':
            dataUrl.url = '/customerService/listTicketing/' + JSON.parse(extraParam).id;
            dataUrl.server_url = baseUrl;
            dataUrl.port_url = backendUrl;
            break;
            // case 'getPromoProgram':
            //   dataUrl.url = '/promotion';
            //   dataUrl.server_url = backendWahyuUrl;
            //   dataUrl.port_url = loginUrl
            //   // finalUrl = backendWahyuUrl + '/promotion';
            //   break;
        default:
            // finalUrl = transactionUrl + '/transaction/partner/outlet';
            dataUrl.url = '/transaction/partner/outlet';
            dataUrl.server_url = baseProductUrl
            dataUrl.port_url = transactionUrl
            break;
    }

    if (param !== 'getRData') {
        console.log('dataaaaa', dataUrl);
        finalUrl = await convertURL(dataUrl, userToken, userSignature, userSecretKey)
        finalUrl = finalUrl.url
        finalUrl = finalUrl.replace(/"/g, '');
    }
    console.log("final url2: ", finalUrl);
    // console.log("final signature: ", userToken);

    return new Promise(async (resolve, reject) => {
        try {
            let settings;
            if (param == 'checkToken') {
                settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": finalUrl,
                    // "url" : 'http://10.241.3.225:6969/login/employee',
                    "method": "GET",
                    "headers": {
                        "Content-Type": "application/json",
                        // "User-Agent": "PostmanRuntime/7.17.1",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "cache-control": "no-cache",
                        "clientKey": cryptography.aesEncrypt(cryptography.pub),
                        "aes": cryptography.rsaEncrypt(cryptography.keyAESClient + ':' + cryptography.ivAESClient)
                    },
                    // "processData": false,
                };
            } else {
                settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": finalUrl,
                    // "url" : 'http://10.241.3.225:6969/login/employee',
                    "method": "GET",
                    "headers": {
                        "Content-Type": "application/json",
                        // "User-Agent": "PostmanRuntime/7.17.1",
                        "Accept": "*/*",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "cache-control": "no-cache",
                        "secretKey": cryptography.aesEncrypt(userSecretKey),
                        "token": cryptography.aesEncrypt(userToken),
                        "signature": cryptography.aesEncrypt(userSignature),
                        "param": cryptography.aesEncrypt(extraParam),
                        "clientKey": cryptography.aesEncrypt(cryptography.pub),
                        "aes": cryptography.rsaEncrypt(cryptography.keyAESClient + ':' + cryptography.ivAESClient)
                    },
                    // "processData": false,
                };
            }
            console.log('fufud', settings);

            r.get(settings, function (error, response, body) {
                console.log("body: ", body);

                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                } else {
                    let result = JSON.parse(body);
                    try {
                        result.data = iterateObjectDecrypt(result.data);
                        console.log('sesudah decrypt', result.data);
                    } catch (e) {
                        result = result;
                    }

                    resolve(result);
                }
            })
        } catch (err) {
            console.log("error action get", err);
            reject(process.env.ERRORINTERNAL_RESPONSE);
        }
    })
}

function actionGetPure(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let settings = data;
            r.get(settings, function (error, response, body) {
                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                } else {
                    console.log("set ", settings);

                    let result = JSON.parse(body);
                    resolve(result);
                }
            })
        } catch (err) {
            console.log("error action get", err);
            reject(process.env.ERRORINTERNAL_RESPONSE);
        }
    })
}

function convertURL(data, token, signature, secretKey) {
    return new Promise(async function (resolve, reject) {
        try {
            let url
            console.log("convertURL: ", data, token);
            url = await getRData(data.server_url, token, signature, secretKey)
            url += ":" + await getRData(data.port_url, token, signature, secretKey)
            data.url = url + data.url
            console.log('data.url =>> ', data.url)
            resolve(data)
        } catch (err) {
            console.log("Error URL convert", err);
            resolve(500)
        }
    })
}

fastify.post('/getRData', async function (request, reply) {
    try {
        let data = request.body.param;
        let userToken = request.headers.token;
        let signature = request.headers.signature;
        let userSecretKey = request.headers.secretkey;
        console.log('redis data get param ==> ', data)
        let bRD = await getRData(data, userToken, signature, userSecretKey);
        reply.send(bRD);
    } catch (err) {
        reply.send(err)
    }
})

async function getRData(_param, _token, signature, secretKey) {
    return new Promise(async function (resolve, reject) {
        var data = {
            name: _param,
        }
        console.log('getRData data => ', redisKey[_param])
        if (redisKey[_param] !== 'null' && redisKey[_param] !== null && redisKey[_param] !== 'undefined' && redisKey[_param] !== undefined & redisKey[_param] !== '') {
            console.log('getRData redisKey ', redisKey[_param])
            resolve(redisKey[_param])
        } else {
            let redisData = await getRedisData(_param)
            console.log('getRData redisData => ', redisData)
            if (redisData !== 'null' && redisData !== null && redisData !== 'undefined' && redisData !== undefined & redisData !== '') {
                console.log('local server GETRData result ==> ', redisData)
                resolve(redisData)
            } else {
                data = JSON.stringify(data)
                console.log('getRData data after json stringify => ', data, signature, secretKey)
                let awa = await actionGet(data, 'getRData', _token, signature, secretKey)
                console.log('awa neh ==> ', awa);
                if (awa.responseCode == '200') {
                    awa = cryptr.decrypt(awa.data[0].field_value)
                    console.log('awa di data neh ==> ', awa);
                } else {
                    awa = 'null'
                }
                await setRedisData(_param, awa)
                redisKey[_param] = awa
                console.log('server GETRData result ==> ', awa)
                resolve(awa);
            }
        }
    })
}

// Run the server!
const start = async () => {
    try {
        await fastify.listen(8111)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()