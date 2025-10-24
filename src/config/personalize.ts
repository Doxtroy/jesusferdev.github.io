// Central personalization config
// Edit these values to customize your portfolio in one place.

import type { Project } from "../components/ProjectsBody";
import type { SocialLinks } from "../components/SocialBody";

export const BRAND = "JesusFerDev";

// Projects: use relative image paths like "icons/projects.png" or full URLs
export const PROJECTS: Project[] = [
  { id: "ucm",      title: "Máster UCM", short: "Liderando el Futuro Sostenible", image: "icons/projects.png", tech: ["WordPress", "JavaScript", "PHP"] },
  { id: "coduck",   title: "Coduck",     short: "Plataforma de formación",       image: "icons/projects.png", tech: ["React", "Node", "PostgreSQL"] },
  { id: "madmusic", title: "MadMusic",   short: "Tienda de instrumentos",        image: "icons/projects.png", tech: ["Next.js", "Stripe"] },
  { id: "retro",    title: "Retro",      short: "Aplicación retro",             image: "icons/projects.png", tech: ["JavaScript", "CSS"] }
];

// Social links: only provided keys are rendered in Socials and used by Terminal (if passed)
export const SOCIAL_LINKS: SocialLinks = {
  github: "https://github.com/JesusFerDev",
  linkedin: "https://www.linkedin.com/in/jesusferdev/",
  // instagram: "https://instagram.com/youruser",
  whatsapp: "Escribeme por WhatsApp! +34634596105",
  // spotify: "https://open.spotify.com/user/...",
  // email: "mailto:you@example.com",
};

// Contact shortcuts for the mobile dock buttons
export const CONTACT = {
  email: "jesusferdev@gmail.com",
  whatsappNumber: "34634596105",
  whatsappText: "¡Hola! Vengo desde tu portfolio.",
  externalLink: "https://www.linkedin.com/in/jesusferdev",
};

// About: texts and images for the About window
// Note: If you use relative image paths, routes will prefix them with the base URL automatically
export const ABOUT = {
  // brand: defaults to BRAND if omitted
  version: "Versión 3.141592…",
  processor: "El justo para pasar del día",
  abilities: "Encender un mechero con los pies",
  experience: "Nunca suficientes para ti",
  creativity: "165 ZB de genialidad",
  memoryLabelLeft: "Memoria",
  memoryLabelRight: "0,06MB libres de 965 ZB",
  cvUrl: "cv/CV_JesusFer_2025.pdf",
  pcImage: "logos/pc.png",
  skills: [
    { src:'logos/JavaScript-logo.png', alt:'JavaScript' },
    { src:'logos/Php-logo.png', alt:'PHP' },
    { src:'logos/fc9b4d4d43c92322dff53c160295320f.png', alt:'React' },
    { src:'logos/elementor-icon.webp', alt:'Elementor' },
    { src:'logos/figma-icon-1024x1024-mvfh9xsk.png', alt:'Figma' },
    { src:'logos/Photoshop_CC_icon.png', alt:'Photoshop' },
    { src:'logos/492px-Illustrator_CC_icon.png', alt:'Illustrator' }
  ]
} as const;

// Centralized icons and image asset paths (relative to project base unless absolute URL)
// Use simple relative paths like "icons/xyz.png"; routes will prefix them with the computed base.
export const ICONS = {
  desktop: {
    projects: "icons/projects.png",
    social: "icons/folder-heart.png",
    about: "icons/about.png",
    terminal: "icons/terminal.png",
    settings: "icons/settings.png" // optional
  },
  folders: {
    open: "icons/folder-open.png",
    close: "icons/folder-close.png"
  },
  quick: { about: "icons/about.png",
        whatsapp: "icons/wapp.png",
        external: "icons/linkedin.png",
        email: "icons/email.png"
   }
} satisfies {
  desktop: { projects: string; social: string; about: string; terminal: string; settings?: string };
  folders: { open: string; close: string };
  quick: { email?: string; about?: string; whatsapp?: string; external?: string };
};
