import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    contacts: {
      executor: "ramping-vus",
      startVUs: 25,
      stages: [
        { target: 100, duration: "15s" }, // simulate ramp-up of traffic from 1 to 100 users over 15 seconds.
        { target: 100, duration: "10s" }, // stay at 100 users for 10 seconds
        { target: 250, duration: "15s" }, // ramp-up to 250 users over 15 seconds
        { target: 250, duration: "10s" }, // stay at 250 users for 10 seconds
        { target: 500, duration: "15s" }, // ramp-up to 500 users over 15 seconds
        { target: 500, duration: "10s" }, // stay at 500 users for 10 seconds
        { target: 750, duration: "15s" }, // ramp-up to 750 users over 15 seconds
        { target: 750, duration: "10s" }, // stay at 750 users for 10 seconds
        { target: 1000, duration: "15s" }, // ramp-up to 1000 users over 15 seconds
        { target: 1000, duration: "10s" }, // stay at 1000 users for 10 seconds
        { target: 0, duration: "30s" }, // ramp-down to 0 users
      ],
    },
  },
};

export default function () {
  const response = http.get("https://api-notepad.tugas.dev/notes/qweasd");

  // check() returns false if any of the specified conditions fail
  check(response, {
    "is status 200": (r) => r.status === 200,
  });
}
