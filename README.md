# Bellhart Clinic Patient Portal — CPSC 481 Portfolio 2

## Team Members

- **Lucas Li** – xue.li2@ucalgary.ca
- **Jerimiah Pratanata** – jeremiah.pratanat1@ucalgary.ca
- **Fabiha Tuheen** – fabiha.tuheen@ucalgary.ca
- **Alecxia Zaragoza** – alecxia.zaragoza@ucalgary.ca
- **Johnny Tran** – johnny.tran1@ucalgary.ca

## 1. Overview

This is a high-fidelity prototype of the **Bellhart Clinic Patient Portal** demonstrating the patient-side experience of a digital clinic system. It allows patients to:

- View weekly health summaries and upcoming appointments from their dashboard
- Book, cancel, and reschedule appointments
- View medical records
- Receive in-app notifications
- Update their personal information

## 2. Running the Application

Access our application at the following link:

**[insert URL]**

## 3. Full Walkthrough

### Table of Contents

- [Register](#register)
- [Login](#login)
- [Dashboard](#dashboard)
- [Notifications](#notifications)
- [Appointments](#appointments)
  - [Booking an Available Slot](#booking-an-available-slot)
  - [Booking a Waitlist Slot](#booking-a-waitlist-slot)
  - [Reschedule an Appointment](#reschedule-an-appointment)
  - [Cancel an Appointment](#cancel-an-appointment)
  - [Mark an Appointment as Complete](#mark-an-appointment-as-complete)
- [Medical Records](#medical-records)
  - [Viewing Medical Records](#viewing-medical-records)
  - [Viewing a Record](#viewing-a-record)
- [Profile Management](#profile-management)
  - [Viewing and Editing the Profile Page](#viewing-and-editing-the-profile-page)

---

### Register

1. On the login page, click **Sign Up** at the bottom.
2. Enter registration information:
   - A valid email address (that doesn't already exist)
   - A password
3. Click **Sign Up**.
4. A success message appears confirming your registration.

### Login

1. On the login page, enter the following test credentials:

> ```
> Email: sarah.jones@gmail.com
> Password: password123
> ```

2. Click **Sign In**.
3. You will be redirected to the **Dashboard** page.

---

### Dashboard

After logging in, you'll be taken to the **Dashboard** page which provides an overview of your health information:

1. **View your weekly health summary** - See a quick overview of your recent health activity
2. **View upcoming appointments** - See your next scheduled appointments at a glance
3. **Quick actions**
   - In the health summary section, the **View all Health Reports** button quickly directs you to the records page.
   - If you have no upcoming appointments, the **Schedule Appointment** button directs you to book a new appointment.

> **Note:** For detailed information about booking, rescheduling, and managing appointments, see the [Appointments](#appointments) section below.

---

### Notifications

1. Click the **bell icon** in the top navigation bar.
2. View unread notifications at the top (marked with a badge).
3. Click **Mark All Read** to mark all notifications as read.
4. Close the modal.

> **Note:** Notifications update in real time when you:
>
> - Book an appointment
> - Cancel an appointment
> - Reschedule an appointment

---

## Appointments

The following sections cover all appointment-related functionality. Navigate to the **Schedule** page from the sidebar to access the appointment calendar.

### Booking an Available Slot

1. Navigate to the **Schedule** page by clicking **Schedule** in the sidebar.
   > **Alternative:** If you have no upcoming appointments, you can click the **Schedule Appointment** button from the Dashboard.
2. On the calendar, locate an **available slot** (displayed in green).
3. Click on the available slot to open the booking modal.
4. In the booking modal:
   - **Step 1:** Select an appointment type (e.g., Consultation, Lab Test, Follow-Up)
   - Click **Next** to proceed
   - **Step 2:** Review the pre-filled patient details and click **Next**
   - **Step 3:** Review the full summary and click **Confirm** to complete the booking
5. After confirmation, you will see:
   - A **success toast message** appears at the top of the screen
   - The calendar slot changes from green (Available) to blue (Booked)
   - A **new notification** appears in the notifications panel

### Booking a Waitlist Slot

1. On the **Schedule** page, locate a **waitlist slot** (displayed in yellow) on the calendar.
2. Click on the waitlist slot to open the booking modal.
3. In the booking modal:
   - **Step 1:** Select an appointment type and a time slot
   - Click **Next** to proceed
   - **Step 2:** Review the pre-filled patient details and click **Next**
   - **Step 3:** Review the full summary and click **Confirm** to complete the booking
4. After confirmation, you will see:
   - A **success toast message** appears at the top of the screen
   - The calendar slot changes from yellow (Waitlist) to blue (Booked)
   - A **new notification** appears in the notifications panel

### Reschedule an Appointment

1. On the **Schedule** page, click on a **Booked** appointment slot (displayed in blue).
2. The appointment details modal opens showing the appointment information.
3. Click the **Reschedule** button in the modal.
4. A reschedule banner appears at the top of the calendar with instructions.
5. Select a new **available slot** (green) from the calendar.
6. Complete the process in the booking modal again and click **Confirm**.
7. After confirmation:
   - The **old appointment slot** returns to available (green)
   - The **new slot** becomes booked (blue)
   - A **success toast message** appears
   - A **new notification** appears in the notifications panel

### Cancel an Appointment

1. On the **Schedule** page, click on a **Booked** appointment slot (displayed in blue).
2. The appointment details modal opens showing the appointment information.
3. Click the **Cancel Appointment** button in the modal.
4. A confirmation dialog appears, confirm the cancellation.
5. After cancellation:
   - The **appointment slot** returns to available status (green)
   - A **success toast message** appears
   - A **new notification** appears in the notifications panel

### Mark an Appointment as Complete

1. On the **Schedule** page, click on a **Booked** appointment slot (displayed in blue).
   > Note: The appointment date must have passed for it to be marked as complete.
2. The appointment details modal opens showing the appointment information.
3. Click the **Mark as Complete** button in the modal.
4. After marking as complete:
   - The **appointment slot** updates to completed status (displayed in gray)
   - A **success toast message** appears

---

## Medical Records

### Viewing Medical Records

1. From the sidebar navigation, click **Reports**.
2. You will see the main records page displaying all available record categories.
3. The available categories include:
   - **Lab Test Results** - Blood tests and lab work
   - **Physical Test Results** - Physical examination results
   - **Prescriptions & Medications** - Current and past prescriptions
   - **Imaging & Scans** - X-rays, CT scans, and other imaging
   - **Immunization Records** - Vaccination history
   - **Insurance Documents** - Insurance policies and documents

### Viewing a Record

1. On the **My Records** page, click **View All** on any category.
2. You are taken to the detailed records page for that category.
3. The page displays:
   - **Flagged items** at the top (items requiring attention)
   - **Normal results** below the flagged section
   - A year selector to filter records by year

#### Table-Based Records (Lab Tests, Physical Tests, Prescriptions)

4. Click the **View** button (or maximize icon) on any record row.
5. A detailed modal opens showing:
   - **Patient information**
   - **Test/record details**
   - **Results table** with:
     - Test components/measurements
     - Actual results
     - Reference ranges
     - **Flag indicators** (High = orange, Low = blue)

#### Image/Preview Records (Imaging & Scans, Insurance Documents)

4. Click the **View** button on a record card in the list. _Note: only the first View button is implemented_
5. The image or document preview appears in the **right-side panel** of the page.
6. The preview shows:
   - **Image/document display** (for Imaging & Scans: X-rays, CT scans, etc.)
   - **Document viewer** (for Insurance Documents: policy documents, insurance cards, etc.)

---

## Profile Management

### Viewing and Editing the Profile Page

1. In the top navigation bar, click on the **user icon**.
2. A dropdown menu appears - click **My Account**.
3. The profile page opens displaying the account information in **read-only mode**.
4. To edit the information:
   - Click the **pencil icon** next to any section
   - The section displays editable input fields
5. You can update the following information:
   - **Peronal Information**
   - **Address Information**
   - **Emergency contact** information
   - **Notification preferences** (email, SMS)
6. After making changes, click **Save Changes**.
7. A **success toast message** appears confirming the changes were saved.

> **Note:** Changes are only saved locally and will remain until you refresh or log out.

---

## 4. Under-Development Features

Some UI elements display a tooltip:  
**“Feature is under development.”**

These include:

- **Forgot Password**
- **Continue as Guest**
- **Search Bar**
- **Support**
- **Export Schedule**

These are only placeholders and not part of the required implementation.
