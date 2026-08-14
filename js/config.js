/* =========================================================
   BCGK High Stakes Deals — Site-wide config
   Update these values in ONE place and every page picks them up.
   ========================================================= */
window.BCGK_CONFIG = {
  // PLACEHOLDER — swap for the real date/time once confirmed.
  webinarDateISO: "2026-08-27T17:00:00-07:00", // Thu, Aug 27, 2026, 5:00 PM PT
  webinarDateLabel: "Thursday, August 27, 2026",
  webinarTimeLabel: "5:00 PM PT / 8:00 PM ET",
  webinarDurationMinutes: 75,

  // Sent to HubSpot on registration to populate the contact's Event Name /
  // Event Date properties (separate from the CRM's Marketing Events feature).
  eventName: "High Stakes Deals FREE Masterclass",

  // Zoom meeting link sent to registrants and used for the calendar invite.
  meetingLink: "https://zoom.us/j/98166686039?pwd=U3Q9vNiESNnTR1zsqiNbiLzOC09j7a.1",

  // HubSpot portal + the "Webinar Registration - High Stakes Deals Inner Circle" form.
  hubspot: {
    portalId: "22108142",
    formGuid: "fae2a714-e9cb-4afe-ab46-e4b3f957ce65"
  },

  contactEmail: "info@bcgk.com",
  calendlyLink: "https://calendly.com/bcgk_kevin/bcgk-call-with-kevin",
  investorPortalLink: "https://23192bcgk.investorcafe.app/content/login#/appaccess/login"
};
