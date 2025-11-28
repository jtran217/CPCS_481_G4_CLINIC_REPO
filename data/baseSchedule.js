// Base schedule - read-only source of truth for clinic availability
// All slots default to "available" or "waitlist" status
// Runtime bookings are stored as overrides in localStorage

const BASE_SLOTS = [
  { id: "slot-2025-11-17-09-00-dr-lee", title: "Dr. Lee", start: "2025-11-17T09:00:00", end: "2025-11-17T09:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-11-18-10-00-dr-smith", title: "Dr. Smith", start: "2025-11-18T10:00:00", end: "2025-11-18T10:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-11-19-14-00-dr-kaur", title: "Dr. Kaur", start: "2025-11-19T14:00:00", end: "2025-11-19T14:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "west" } },
  { id: "slot-2025-11-20-11-00-dr-lee", title: "Dr. Lee", start: "2025-11-20T11:00:00", end: "2025-11-20T11:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-11-21-15-00-dr-smith", title: "Dr. Smith", start: "2025-11-21T15:00:00", end: "2025-11-21T15:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-11-24-09-00-dr-kaur", title: "Dr. Kaur", start: "2025-11-24T09:00:00", end: "2025-11-24T09:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-11-25-13-00-dr-lee", title: "Dr. Lee", start: "2025-11-25T13:00:00", end: "2025-11-25T13:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "west" } },
  { id: "slot-2025-11-26-10-00-dr-smith", title: "Dr. Smith", start: "2025-11-26T10:00:00", end: "2025-11-26T10:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-11-27-14-00-dr-kaur", title: "Dr. Kaur", start: "2025-11-27T14:00:00", end: "2025-11-27T14:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-01-09-00-dr-lee", title: "Dr. Lee", start: "2025-12-01T09:00:00", end: "2025-12-01T09:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "west" } },
  { id: "slot-2025-12-02-11-00-dr-smith", title: "Dr. Smith", start: "2025-12-02T11:00:00", end: "2025-12-02T11:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-03-15-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-03T15:00:00", end: "2025-12-03T15:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-08-10-00-dr-lee", title: "Dr. Lee", start: "2025-12-08T10:00:00", end: "2025-12-08T10:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "west" } },
  { id: "slot-2025-12-09-14-00-dr-smith", title: "Dr. Smith", start: "2025-12-09T14:00:00", end: "2025-12-09T14:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-10-09-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-10T09:00:00", end: "2025-12-10T09:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-15-13-00-dr-lee", title: "Dr. Lee", start: "2025-12-15T13:00:00", end: "2025-12-15T13:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "west" } },
  { id: "slot-2025-12-16-11-00-dr-smith", title: "Dr. Smith", start: "2025-12-16T11:00:00", end: "2025-12-16T11:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-17-10-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-17T10:00:00", end: "2025-12-17T10:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-22-09-00-dr-lee", title: "Dr. Lee", start: "2025-12-22T09:00:00", end: "2025-12-22T09:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "west" } },
  { id: "slot-2025-12-23-14-00-dr-smith", title: "Dr. Smith", start: "2025-12-23T14:00:00", end: "2025-12-23T14:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-29-11-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-29T11:00:00", end: "2025-12-29T11:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "downtown" } },
  
  // Waitlist slots
  { id: "slot-2025-11-18-15-00-dr-smith", title: "Dr. Smith", start: "2025-11-18T15:00:00", end: "2025-11-18T16:00:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "waitlist", waitlist: 1, location: "downtown", waitlistSlots: { slotDuration: 30, takenSlots: ["15:00"] } } },
  { id: "slot-2025-11-21-15-00-dr-kaur-wl", title: "Dr. Kaur", start: "2025-11-21T15:00:00", end: "2025-11-21T17:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "waitlist", waitlist: 3, location: "north", waitlistSlots: { slotDuration: 30, takenSlots: ["15:00", "15:30", "16:30"] } } },
  { id: "slot-2025-11-26-14-00-dr-lee", title: "Dr. Lee", start: "2025-11-26T14:00:00", end: "2025-11-26T15:00:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "waitlist", waitlist: 1, location: "west", waitlistSlots: { slotDuration: 30, takenSlots: ["14:30"] } } },
  { id: "slot-2025-12-03-10-00-dr-smith", title: "Dr. Smith", start: "2025-12-03T10:00:00", end: "2025-12-03T11:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "waitlist", waitlist: 2, location: "north", waitlistSlots: { slotDuration: 30, takenSlots: ["10:00", "11:00"] } } },
  { id: "slot-2025-12-10-13-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-10T13:00:00", end: "2025-12-10T14:00:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "waitlist", waitlist: 1, location: "downtown", waitlistSlots: { slotDuration: 30, takenSlots: ["13:00"] } } },
  { id: "slot-2025-12-17-14-00-dr-lee", title: "Dr. Lee", start: "2025-12-17T14:00:00", end: "2025-12-17T15:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "waitlist", waitlist: 1, location: "west", waitlistSlots: { slotDuration: 30, takenSlots: ["14:00"] } } },
  { id: "slot-2025-12-23-10-00-dr-smith-wl", title: "Dr. Smith", start: "2025-12-23T10:00:00", end: "2025-12-23T11:00:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "waitlist", waitlist: 1, location: "north", waitlistSlots: { slotDuration: 30, takenSlots: ["10:00"] } } }
];

