const supertest = require("supertest");
const { app } = require("./index");
const cookieSession = require("cookie-session");

test("users who are logged out are redirected to the registration page when they attempt to go to the petition page", () => {
  cookieSession.mockSession({
    userId: null,
  });
  return supertest(app)
    .get("/petition")
    .then((res) => {
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/register");
    });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to the registration page", () => {
  cookieSession.mockSession({
    userId: 5,
  });
  return supertest(app)
    .get("/register")
    .then((res) => {
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/petition");
    });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to the login page", () => {
  cookieSession.mockSession({
    userId: 5,
  });
  return supertest(app)
    .get("/login")
    .then((res) => {
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/petition");
    });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature", () => {
  cookieSession.mockSession({
    userId: 5,
    sigId: 4,
  });
  return supertest(app)
    .get("/petition")
    .then((res) => {
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/thanks");
    });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the thank you page", () => {
  cookieSession.mockSession({
    userId: 5,
    sigId: null,
  });
  return supertest(app)
    .get("/thanks")
    .then((res) => {
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/petition");
    });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the signers page", () => {
  cookieSession.mockSession({
    userId: 5,
    sigId: null,
  });
  return supertest(app)
    .get("/signers")
    .then((res) => {
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe("/petition");
    });
});
