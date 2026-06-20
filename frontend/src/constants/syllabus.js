/**
 * frontend/src/constants/syllabus.js
 * ─────────────────────────────────────────────────────────
 * Complete NEET Syllabus tree: Subject → Class (11th/12th) → Chapters
 * Used in Admin Panel (Add Question chapter dropdown) and
 * student-facing Chapter-wise Practice mode.
 * ─────────────────────────────────────────────────────────
 */

export const SYLLABUS = {
  biology: {
    label: "Biology",
    color: "#39FF14",
    classes: {
      "11th": [
        "The Living World",
        "Biological Classification",
        "Plant Kingdom",
        "Animal Kingdom",
        "Morphology of Flowering Plants",
        "Anatomy of Flowering Plants",
        "Structural Organisation in Animals",
        "Cell - The Unit of Life",
        "Biomolecules",
        "Cell Cycle and Cell Division",
        "Photosynthesis in Higher Plants",
        "Respiration in Plants",
        "Plant Growth and Development",
        "Breathing and Exchange of Gases",
        "Excretory Products and their Elimination",
        "Locomotion and Movement",
        "Neural Control and Coordination",
        "Chemical Coordination and Integration",
      ],
      "12th": [
        "Sexual Reproduction in Flowering Plants",
        "Human Reproduction",
        "Reproductive Health",
        "Principles of Inheritance and Variation",
        "Molecular Basis of Inheritance",
        "Evolution",
        "Human Health and Disease",
        "Microbes in Human Welfare",
        "Principles and Processes of Biotechnology",
        "Application of Biotechnology",
        "Organisms and Populations",
        "Ecosystem",
        "Biodiversity and its Conservation",
      ],
    },
  },

  physics: {
    label: "Physics",
    color: "#00F0FF",
    classes: {
      "11th": [
        "Physics and Measurement",
        "Kinematics",
        "Laws of Motion",
        "Work, Energy, and Power",
        "Rotational Motion",
        "Gravitation",
        "Properties of Solids and Liquids",
        "Thermodynamics",
        "Kinetic Theory of Gases",
        "Oscillations and Waves",
      ],
      "12th": [
        "Electrostatics",
        "Current Electricity",
        "Magnetic Effects of Current and Magnetism",
        "Electromagnetic Induction and Alternating Currents",
        "Electromagnetic Waves",
        "Optics",
        "Dual Nature of Matter and Radiation",
        "Atoms and Nuclei",
        "Electronic Devices",
        "Experimental Skills",
      ],
    },
  },

  chemistry: {
    label: "Chemistry",
    color: "#B900FF",
    // Chemistry uses sub-branches (Physical / Inorganic / Organic) instead of just class
    branches: {
      physical: {
        label: "Physical",
        chapters: [
          "Some Basic Concepts in Chemistry",
          "Atomic Structure",
          "Chemical Bonding and Molecular Structure",
          "Chemical Thermodynamics",
          "Solutions",
          "Equilibrium",
          "Redox Reactions",
          "Electrochemistry",
          "Chemical Kinetics",
        ],
      },
      inorganic: {
        label: "Inorganic",
        chapters: [
          "Classification of Elements and Periodicity in Properties",
          "P-Block Elements",
          "d- and f-Block Elements",
          "Co-ordination Compounds",
        ],
      },
      organic: {
        label: "Organic",
        chapters: [
          "Purification and Characterisation of Organic Compounds",
          "Some Basic Principles of Organic Chemistry",
          "Hydrocarbons",
          "Haloalkanes and Haloarenes",
          "Alcohols, Phenols and Ethers",
          "Aldehydes, Ketones and Carboxylic Acids",
          "Amines",
          "Biomolecules",
        ],
      },
    },
  },
};

/**
 * Returns a flat list of all chapters for a subject (used for simple filters / search)
 */
export function getAllChapters(subject) {
  const s = SYLLABUS[subject];
  if (!s) return [];
  if (s.classes) {
    return Object.values(s.classes).flat();
  }
  if (s.branches) {
    return Object.values(s.branches).flatMap((b) => b.chapters);
  }
  return [];
}

/**
 * Returns the list of "groups" for a subject — either classes (11th/12th)
 * or branches (Physical/Inorganic/Organic) — each with their chapter list.
 * Shape: [{ key: "11th", label: "11th", chapters: [...] }, ...]
 */
export function getGroups(subject) {
  const s = SYLLABUS[subject];
  if (!s) return [];
  if (s.classes) {
    return Object.entries(s.classes).map(([key, chapters]) => ({
      key, label: key, chapters,
    }));
  }
  if (s.branches) {
    return Object.entries(s.branches).map(([key, val]) => ({
      key, label: val.label, chapters: val.chapters,
    }));
  }
  return [];
}

export const SUBJECT_LIST = Object.keys(SYLLABUS); // ["biology", "physics", "chemistry"]

/**
 * Some chapters have more than one commonly-used name (NCERT vs popular usage,
 * old syllabus vs new, etc). This map lets matching be forgiving — if a
 * question/note was saved with an older/alternate name, it still shows up
 * under the correct chapter filter.
 *
 * Format: "alternate name" -> "canonical name used in SYLLABUS above"
 */
export const CHAPTER_ALIASES = {
  "what is living": "The Living World",
  "the living world": "The Living World",
};

/**
 * Normalizes a chapter name for comparison — lowercases, trims, and
 * resolves known aliases to the canonical name.
 */
export function normalizeChapter(name) {
  if (!name) return "";
  const key = name.trim().toLowerCase();
  return CHAPTER_ALIASES[key] || name.trim();
}
