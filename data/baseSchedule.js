// Base schedule - read-only source of truth for clinic availability
// All slots default to "available" or "waitlist" status
// Runtime bookings are stored as overrides in localStorage

const BASE_SLOTS = [
  // Completed slots (before today - early December)
  { id: "slot-2025-12-02-09-00-dr-lee", title: "Dr. Lee", start: "2025-12-02T09:00:00", end: "2025-12-02T09:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "completed", location: "downtown" } },
  { id: "slot-2025-12-03-10-00-dr-smith", title: "Dr. Smith", start: "2025-12-03T10:00:00", end: "2025-12-03T10:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "completed", location: "north" } },
  { id: "slot-2025-12-04-14-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-04T14:00:00", end: "2025-12-04T14:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "completed", location: "west" } },
  
  // Available slots (this month - December)
  { id: "slot-2025-12-10-09-00-dr-lee", title: "Dr. Lee", start: "2025-12-10T09:00:00", end: "2025-12-10T09:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-11-10-00-dr-smith", title: "Dr. Smith", start: "2025-12-11T10:00:00", end: "2025-12-11T10:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-12-14-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-12T14:00:00", end: "2025-12-12T14:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "west" } },
  { id: "slot-2025-12-13-11-00-dr-lee", title: "Dr. Lee", start: "2025-12-13T11:00:00", end: "2025-12-13T11:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-16-09-00-dr-smith", title: "Dr. Smith", start: "2025-12-16T09:00:00", end: "2025-12-16T09:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-17-13-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-17T13:00:00", end: "2025-12-17T13:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "west" } },
  { id: "slot-2025-12-18-10-00-dr-lee", title: "Dr. Lee", start: "2025-12-18T10:00:00", end: "2025-12-18T10:30:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "available", location: "downtown" } },
  { id: "slot-2025-12-19-15-00-dr-smith", title: "Dr. Smith", start: "2025-12-19T15:00:00", end: "2025-12-19T15:30:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "available", location: "north" } },
  { id: "slot-2025-12-20-11-00-dr-kaur", title: "Dr. Kaur", start: "2025-12-20T11:00:00", end: "2025-12-20T11:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "available", location: "west" } },
  
  // Waitlist slots (this month - December)
  { id: "slot-2025-12-10-15-00-dr-smith", title: "Dr. Smith", start: "2025-12-10T15:00:00", end: "2025-12-10T16:00:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "waitlist", waitlist: 1, location: "downtown", waitlistSlots: { slotDuration: 30, takenSlots: ["15:00"] } } },
  { id: "slot-2025-12-13-15-00-dr-kaur-wl", title: "Dr. Kaur", start: "2025-12-13T15:00:00", end: "2025-12-13T17:30:00", extendedProps: { doctor: "Dr. Kaur", baseStatus: "waitlist", waitlist: 3, location: "north", waitlistSlots: { slotDuration: 30, takenSlots: ["15:00", "15:30", "16:30"] } } },
  { id: "slot-2025-12-17-14-00-dr-lee", title: "Dr. Lee", start: "2025-12-17T14:00:00", end: "2025-12-17T15:00:00", extendedProps: { doctor: "Dr. Lee", baseStatus: "waitlist", waitlist: 1, location: "west", waitlistSlots: { slotDuration: 30, takenSlots: ["14:30"] } } },
  { id: "slot-2025-12-19-10-00-dr-smith-wl", title: "Dr. Smith", start: "2025-12-19T10:00:00", end: "2025-12-19T11:00:00", extendedProps: { doctor: "Dr. Smith", baseStatus: "waitlist", waitlist: 1, location: "north", waitlistSlots: { slotDuration: 30, takenSlots: ["10:00"] } } }
];

