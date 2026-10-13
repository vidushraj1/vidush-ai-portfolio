/**
 * Portfolio backend (Google-native): contact form -> Gmail, and meeting booking -> Google Calendar + Meet.
 *
 * SETUP
 * 1. Left sidebar > Services (+) > "Google Calendar API" > Add (identifier must stay "Calendar").
 * 2. Pick `authorizeOnce` in the function dropdown > Run > approve all permissions.
 * 3. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone > Deploy.
 *    Copy the /exec URL into PUBLIC_APPS_SCRIPT_URL.
 * AFTER EDITING: Deploy > Manage deployments > pencil > Version: New version > Deploy.
 */

var CAL = {
  TZ: "Asia/Colombo",                  // your time zone
  AVAIL_CALENDAR: "Portfolio Availability", // name of the Google Calendar that holds your open hours
  SLOT_MIN: 30,                        // meeting length in minutes
  BUFFER_MIN: 15,                      // gap kept free before/after existing events
  MIN_NOTICE_H: 4,                     // earliest booking is this many hours from now
  MAX_DAYS: 30,                        // how far ahead visitors can book
  TITLE: "Meeting with Vidush",
  // Only used to create the availability calendar the first time, and as a fallback if that calendar is missing:
  DAYS: [1, 2, 3, 4, 5],               // weekdays, 1=Mon ... 7=Sun
  START_HOUR: 17,                      // 5 PM (24h, in TZ)
  END_HOUR: 22                         // 10 PM
};
var MSG = { MAX_NAME: 80, MAX_TOPIC: 60, MAX_MESSAGE: 3000, PER_EMAIL_SECONDS: 60, WINDOW_SECONDS: 21600, WINDOW_MAX: 25, PREFIX: "[Portfolio]" };

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === "availability") {
    return respond_({ ok: true, durationMin: CAL.SLOT_MIN, slots: getSlots_().map(function (d) { return d.toISOString(); }) });
  }
  return respond_({ ok: true, service: "portfolio-backend" });
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return respond_({ ok: true });                       // honeypot
    return d.type === "book" ? book_(d) : message_(d);
  } catch (err) {
    console.error(err);
    return respond_({ ok: false, error: "server" });
  }
}

/* ---------- Contact form -> Gmail ---------- */
function message_(d) {
  var ok = respond_({ ok: true });
  var name = clean_(d.name), email = clean_(d.email), topic = clean_(d.topic) || "General", message = String(d.message || "").trim();
  if (!name || !message || !validEmail_(email)) return ok;
  if (name.length > MSG.MAX_NAME || topic.length > MSG.MAX_TOPIC || message.length > MSG.MAX_MESSAGE) return ok;
  if (!rateOk_("msg", email, MSG.PER_EMAIL_SECONDS, MSG.WINDOW_MAX)) return ok;
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), MSG.PREFIX + " " + topic + " from " + name,
    message + "\n\n---\nFrom: " + name + " <" + email + ">\nTopic: " + topic,
    { replyTo: email, name: "Portfolio contact form" });
  return ok;
}

/* ---------- Meeting booking -> Google Calendar event + Meet link ---------- */
function book_(d) {
  var name = clean_(d.name), email = clean_(d.email), notes = String(d.notes || "").trim().slice(0, 1000);
  var slot = new Date(d.slot);
  if (!name || name.length > MSG.MAX_NAME || !validEmail_(email) || isNaN(slot.getTime())) return respond_({ ok: false, error: "invalid" });
  if (!rateOk_("bk", email, 60, 10)) return respond_({ ok: false, error: "slow_down" });

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var free = getSlots_().some(function (s) { return s.getTime() === slot.getTime(); });   // re-check, prevents double booking
    if (!free) return respond_({ ok: false, error: "slot_taken" });

    var end = new Date(slot.getTime() + CAL.SLOT_MIN * 60000);
    var event = Calendar.Events.insert({
      summary: CAL.TITLE + " – " + name,
      description: "Booked via portfolio.\nName: " + name + "\nEmail: " + email + (notes ? "\n\nNotes:\n" + notes : ""),
      start: { dateTime: slot.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: [{ email: email, displayName: name }],
      conferenceData: { createRequest: { requestId: Utilities.getUuid(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      reminders: { useDefault: true }
    }, "primary", { conferenceDataVersion: 1, sendUpdates: "all" });
    return respond_({ ok: true, start: slot.toISOString(), meet: event.hangoutLink || "" });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Availability: open windows (from your availability calendar) minus busy events ---------- */
function getSlots_() {
  var now = new Date();
  var earliest = now.getTime() + CAL.MIN_NOTICE_H * 3600000;
  var horizon = new Date(now.getTime() + (CAL.MAX_DAYS + 1) * 86400000);
  var buf = CAL.BUFFER_MIN * 60000, len = CAL.SLOT_MIN * 60000;

  var busy = CalendarApp.getDefaultCalendar().getEvents(now, horizon)
    .filter(function (ev) { return !ev.isAllDayEvent() && ev.getMyStatus() !== CalendarApp.GuestStatus.NO; })
    .map(function (ev) { return [ev.getStartTime().getTime(), ev.getEndTime().getTime()]; });

  var out = [], seen = {};
  windows_(now, horizon).forEach(function (w) {
    for (var t = Math.ceil(w[0] / len) * len; t + len <= w[1]; t += len) {
      if (t < earliest || t > horizon.getTime() || seen[t]) continue;
      var clash = busy.some(function (b) { return t < b[1] + buf && t + len + buf > b[0]; });
      if (!clash) { seen[t] = true; out.push(new Date(t)); }
    }
  });
  out.sort(function (a, b) { return a - b; });
  return out;
}

// Open windows = events on the "Portfolio Availability" calendar. Edit that calendar to change your hours.
function windows_(from, to) {
  var cals = CalendarApp.getCalendarsByName(CAL.AVAIL_CALENDAR);
  if (cals.length) {
    return cals[0].getEvents(from, to)
      .filter(function (ev) { return !ev.isAllDayEvent(); })
      .map(function (ev) { return [ev.getStartTime().getTime(), ev.getEndTime().getTime()]; });
  }
  // Fallback if the availability calendar doesn't exist: fixed weekly hours from CAL
  var out = [], seen = {};
  for (var i = 0; i <= CAL.MAX_DAYS; i++) {
    var probe = new Date(from.getTime() + i * 86400000);
    var day = Utilities.formatDate(probe, CAL.TZ, "yyyy-MM-dd");
    if (seen[day]) continue;
    seen[day] = true;
    if (CAL.DAYS.indexOf(Number(Utilities.formatDate(probe, CAL.TZ, "u"))) === -1) continue;
    out.push([
      Utilities.parseDate(day + " " + pad_(CAL.START_HOUR) + ":00", CAL.TZ, "yyyy-MM-dd HH:mm").getTime(),
      Utilities.parseDate(day + " " + pad_(CAL.END_HOUR) + ":00", CAL.TZ, "yyyy-MM-dd HH:mm").getTime()
    ]);
  }
  return out;
}

// Run ONCE: creates the "Portfolio Availability" calendar with a weekly Mon-Fri "Available" event (START_HOUR to END_HOUR).
// After that, edit that calendar in Google Calendar whenever your availability changes.
function setupAvailabilityCalendar() {
  if (CalendarApp.getCalendarsByName(CAL.AVAIL_CALENDAR).length) { console.log("Already exists. Nothing to do."); return; }
  var cal = CalendarApp.createCalendar(CAL.AVAIL_CALENDAR, { timeZone: CAL.TZ, summary: "Open hours for my portfolio booking page" });
  var today = Utilities.formatDate(new Date(), CAL.TZ, "yyyy-MM-dd");
  var start = Utilities.parseDate(today + " " + pad_(CAL.START_HOUR) + ":00", CAL.TZ, "yyyy-MM-dd HH:mm");
  var end = Utilities.parseDate(today + " " + pad_(CAL.END_HOUR) + ":00", CAL.TZ, "yyyy-MM-dd HH:mm");
  var W = CalendarApp.Weekday;
  cal.createEventSeries("Available", start, end,
    CalendarApp.newRecurrence().addWeeklyRule().onlyOnWeekdays([W.MONDAY, W.TUESDAY, W.WEDNESDAY, W.THURSDAY, W.FRIDAY]));
  console.log("Created. Open Google Calendar to edit it.");
}

/* ---------- Helpers ---------- */
function rateOk_(kind, email, perEmailSec, windowMax) {
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    var cache = CacheService.getScriptCache(), k = kind + "_" + email.toLowerCase(), wk = kind + "_window";
    var n = Number(cache.get(wk) || 0);
    if (cache.get(k) || n >= windowMax) return false;
    cache.put(k, "1", perEmailSec);
    cache.put(wk, String(n + 1), MSG.WINDOW_SECONDS);
    return true;
  } finally { lock.releaseLock(); }
}
function validEmail_(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function clean_(v) { return String(v || "").replace(/[\r\n]+/g, " ").trim(); }
function pad_(n) { return n < 10 ? "0" + n : String(n); }
function respond_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run once from the editor: grants Mail + Calendar permissions and sends you a test email.
function authorizeOnce() {
  CalendarApp.getDefaultCalendar().getName();
  Calendar.Calendars.get("primary");
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), MSG.PREFIX + " Test", "Backend is authorized. Slots found: " + getSlots_().length);
}