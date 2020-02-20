const supertest = require("supertest");
const { app } = require("./index");
const cookieSession = require("cookie-session");

// cookieSession.mockSession({
//     test: true
// });

// test("GET / home sends 302 when no cookie", () => {
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("welcome");
//         });
// });
//
// test("GET / welcome sends 200 status code", () => {
//     return supertest(app)
//         .get("/welcome")
//         .then(res => {
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toBe("<h1>yes!</h1>");
//         });
// });

test("POST /welcome sets req.session to true", () => {
    const cookie = {};
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .post("/welcome")
        .then(res => {
            expect(cookie.submitted).toBe(true);
        });
});

// test("GET / home sends 200 status with submitted cookie", () => {
//     cookieSession.mockSessionOnce({
//         submitted: true
//     });
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toBe("<h1>home</h1>");
//         });
// });
