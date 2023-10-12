export const ServiceConstant = {
    TEMPLATE_SERVICE_2: {
        name: 'TEMPLATE_SERVICE_2',
        patterns: {
            CALL_TEMPLATE: 'call_template',
        },
    },
    OWNER_SERVICE: {
        name: 'OWNER_SERVICE',
        host: process.env.OWNER_SERVICE_HOST,
        port: process.env.OWNER_SERVICE_PORT,
        patterns: {
            GET_OWNER: 'get_owner',
        },
    },
};
