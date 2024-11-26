export const authTestManager = {
    authForTests (token: string) {
        const buff2 = Buffer.from(token, 'utf8')
        return buff2.toString('base64')
    }
}