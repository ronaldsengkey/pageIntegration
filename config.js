const hostIP = 'http://192.168.0.96';
// const hostIP = 'https://sandbox.api.ultipay.id';
const baseUrl = 'SERVER_JIMBO';
// const baseUrl = 'AWS_SERVER';
const loginUrl = 'PORT_AUTH_AWS';
const backendUrl = 'PORT_BACKEND_AWS';
const analyticsUrl = 'PORT_ANALYTICS';
const transactionUrl = 'PORT_TRANSACTION_AWS';
const productUrl = 'PORT_OUTLET_AWS';
const employeeUrl = 'PORT_EMPLOYEE_AWS';
const accPort = 'PORT_ACC_AWS';
const backendPort = '8443/backend';
const authPort = '8443/authentication';

const config = {
    'hostIP' : hostIP,
    'baseUrl' : baseUrl,
    'loginUrl' : loginUrl,
    'backendUrl' : backendUrl,
    'analyticsUrl' : analyticsUrl,
    'transactionUrl' : transactionUrl,
    'productUrl' : productUrl,
    'employeeUrl' : employeeUrl,
    'accPort' : accPort,
    'backendPort' : backendPort,
    'authPort' : authPort
};

module.exports = {config}