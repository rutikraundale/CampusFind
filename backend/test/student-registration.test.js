import test from "node:test";
import assert from "node:assert/strict";
import {
    isResponsibilityDeclarationAccepted,
    normalizeIndianMobile,
    normalizeStudentEmail,
} from "../utilities/student-registration.js";
import { PendingRegistration } from "../model/pending-registration.model.js";

test("student email accepts only the exact campus domain", () => {
    assert.equal(normalizeStudentEmail(" Student@KBTCOE.ORG "), "student@kbtcoe.org");
    assert.equal(normalizeStudentEmail("student@sub.kbtcoe.org"), null);
    assert.equal(normalizeStudentEmail("student@kbtcoe.org.attacker.test"), null);
    assert.equal(normalizeStudentEmail("student@kbtcoe.org."), null);
});

test("Indian mobile numbers normalize to ten national digits", () => {
    assert.equal(normalizeIndianMobile("9876543210"), "9876543210");
    assert.equal(normalizeIndianMobile("+91 98765-43210"), "9876543210");
    assert.equal(normalizeIndianMobile("1234567890"), null);
    assert.equal(normalizeIndianMobile("+1 9876543210"), null);
});

test("student report declaration requires the current version and explicit acceptance", () => {
    assert.equal(isResponsibilityDeclarationAccepted("true", "v1"), true);
    assert.equal(isResponsibilityDeclarationAccepted("false", "v1"), false);
    assert.equal(isResponsibilityDeclarationAccepted("true", "v2"), false);
});

test("pending registrations persist only password and OTP hashes", () => {
    assert.equal(PendingRegistration.schema.path("password"), undefined);
    assert.equal(PendingRegistration.schema.path("passwordHash").options.select, false);
    assert.equal(PendingRegistration.schema.path("otpHash").options.select, false);
});
