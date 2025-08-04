import request from "supertest";

import app from "../src/setup-app";

export const req = request(app)