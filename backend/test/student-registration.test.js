import test from "node:test";
import assert from "node:assert/strict";
import {
    isResponsibilityDeclarationAccepted,
    normalizeIndianMobile,
    normalizeStudentEmail,
} from "../utilities/student-registration.js";
import { PendingRegistration } from "../model/pending-registration.model.js";
import { StudentIssue, generateIssueId } from "../model/student-issue.model.js";

test("student email accepts only the exact campus domain", () => {
    assert.equal(normalizeStudentEmail(" Student@KBTCOE.ORG "), "student@kbtcoe.org");
    assert.equal(normalizeStudentEmail("student@sub.kbtcoe.org"), null);
    assert.equal(normalizeStudentEmail("student@kbtcoe.org.attacker.test"), null);
    assert.equal(normalizeStudentEmail("student@kbtcoe.org."), null);
    assert.equal(normalizeStudentEmail("student@fakekbtcoe.org"), null);
    assert.equal(normalizeStudentEmail("student@gmail.com"), null);
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

test("student issue references are ten-character alphanumeric IDs", () => {
    const issue = new StudentIssue({
        submittedBy: "507f1f77bcf86cd799439011",
        submitterName: "Student",
        submitterEmail: "student@kbtcoe.org",
        category: "Other",
        subject: "Test issue",
        description: "Test details",
    });
    assert.match(issue.issueId, /^[A-Z0-9]{10}$/);
    assert.match(generateIssueId(), /^[A-Z0-9]{10}$/);
    assert.equal(issue.status, "Pending");
    assert.deepEqual(StudentIssue.schema.path("status").enumValues, ["Pending", "Solved", "Reject"]);
});
