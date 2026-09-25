/* safety.js — safety screen helpers. Never diagnoses; always defers to care providers. */

const Safety = (function () {
  function getContacts() {
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    return {
      doctorName: profile.emergencyContactName || "",
      doctorPhone: profile.emergencyContactPhone || "",
      emergencyNumber: profile.emergencyServiceNumber || "",
    };
  }

  function symptoms() {
    return WARNING_SYMPTOMS;
  }

  return { getContacts, symptoms };
})();
