// =========================================================
// PROJECTS DATABASE
// Single source of truth for all project data.
// Loaded before script.js so window.projects is available
// when renderProjects() runs.
//
// Fields used by renderProjects():
//   id           — card identifier (data-project-id attribute)
//   image        — screenshot path (relative to root)
//   title        — card title + alt text
//   demo         — Visit button href
//   visitEnabled — true = button active, false = greyed-out/disabled
//   type         — include "featured" to show on the home carousel
// =========================================================

window.projects = [
  {
    id: 1,
    title: "DevOps Engineer Portfolio - Muhammad Dawood",
    type: ["featured"],
    image: "assets/work/portfolio-landing-page.png",
    demo: "https://idavidkhan.github.io/DevOps/",
    visitEnabled: true,
  },
  {
    id: 2,
    title: "StudyStation - WhatsApp Channel Site",
    type: ["featured"],
    image: "assets/work/study-station.jpeg",
    demo: "https://bugcurator.github.io/StudyStation/",
    visitEnabled: false,
  },
  {
    id: 3,
    title: "Hadaf Immigration - Study Abroad Consultancy UI",
    type: ["featured"],
    image: "assets/work/hadaf-immigration.jpeg",
    demo: "https://bugcurator.github.io/Hadaf-Immigration/",
    visitEnabled: false,
  },

  // --- ADD MORE PROJECTS BELOW ----------------------------------------
  // Copy and paste this template, fill in the fields, and
  // increment the id by 1 each time.
];
