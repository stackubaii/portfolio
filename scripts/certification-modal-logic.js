//  -- Certification Modal Logic --
(function () {
  var modal = document.getElementById("certModal");
  var modalTitle = document.getElementById("certModalTitle");
  var modalSub = document.getElementById("certModalSub");
  var modalBody = document.getElementById("certModalBody");
  var closeBtn = document.getElementById("closeCertModal");

  function openCertModal(card) {
    var name = card.dataset.certName;
    var institute = card.dataset.certInstitute;
    var date = card.dataset.certDate;
    var imgSrc = card.dataset.certImg;

    modalTitle.textContent = name;
    modalSub.textContent = institute + " · " + date;

    if (imgSrc) {
      modalBody.innerHTML =
        '<img src="' +
        imgSrc +
        '" alt="Certificate: ' +
        name +
        '" loading="lazy" />';
    } else {
      modalBody.innerHTML =
        '<div class="cert-modal-placeholder">' +
        '<i class="fas fa-certificate"></i>' +
        '<p style="font-size:0.9rem">Certificate image coming soon.</p>' +
        "</div>";
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");
  }

  function closeCertModal() {
    modal.classList.remove("active");
    setTimeout(function () {
      document.body.classList.remove("modal-open");
    }, 500);
  }

  // Wire up each card
  document.querySelectorAll(".cert-card").forEach(function (card) {
    card.addEventListener("click", function () {
      openCertModal(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCertModal(card);
      }
    });
  });

  // Close on × button
  if (closeBtn) {
    closeBtn.addEventListener("click", closeCertModal);
  }

  // Close on backdrop click
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeCertModal();
    });
  }

  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeCertModal();
    }
  });
})();
