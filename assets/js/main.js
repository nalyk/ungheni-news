(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-active");
        this.setAttribute(
          "aria-expanded",
          this.getAttribute("aria-expanded") === "true" ? "false" : "true"
        );
      });
    }

    // Sticky Header + Scroll-to-Top Logic
    let lastScrollTop = 0;
    const header = document.querySelector(".site-header");
    const scrollToTopBtn = document.getElementById("scroll-to-top");
    const scrollThreshold = 400;

    window.addEventListener("scroll", function () {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Sticky header logic
      if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }

      // Scroll-to-top button logic
      if (scrollToTopBtn) {
        if (scrollTop > scrollThreshold) {
          // Show button when scrolling down past threshold
          if (scrollTop > lastScrollTop) {
            scrollToTopBtn.classList.add("is-visible");
          } else {
            // Hide when scrolling up
            scrollToTopBtn.classList.remove("is-visible");
          }
        } else {
          // Always hide above threshold
          scrollToTopBtn.classList.remove("is-visible");
        }
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Scroll-to-top button click handler
    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });

      // Keyboard support
      scrollToTopBtn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }
      });
    }
  });
})();
