(() => {
  const moments = document.querySelectorAll(".moment.reveal");
  if (!moments.length) return;

  if (!("IntersectionObserver" in window)) {
    moments.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );

  moments.forEach((el) => observer.observe(el));
})();
