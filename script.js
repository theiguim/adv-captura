gsap.registerPlugin(ScrollTrigger);

gsap.fromTo(".statue img",
  { scale: 1 },
  {
    scale: 2,
    scrollTrigger: {
      trigger: ".statue",
      start: "top center",
      end: "bottom top",
      scrub: true,
    },
    ease: "none"
  }
);