const syllabusData = {
  phy11: [
    "Physical World & Units & Measurements",
    "Motion in a Straight Line",
    "Motion in a Plane",
    "Laws of Motion",
    "Work, Energy & Power",
    "System of Particles & Rotational Motion",
    "Gravitation",
    "Mechanical Properties of Solids & Fluids",
    "Thermodynamics",
    "Oscillations & Waves"
  ],
  phy12: [
    "Electric Charges & Fields",
    "Electrostatic Potential & Capacitance",
    "Current Electricity",
    "Moving Charges & Magnetism",
    "Magnetism & Matter",
    "Electromagnetic Induction",
    "Alternating Current",
    "Ray & Wave Optics",
    "Dual Nature of Radiation & Matter",
    "Atoms & Nuclei",
    "Semiconductor Electronics"
  ],
  chem11: [
    "Basic Concepts of Chemistry",
    "Structure of Atom",
    "Classification of Elements & Periodicity",
    "Chemical Bonding & Molecular Structure",
    "States of Matter: Gases & Liquids",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Hydrogen",
    "s-Block and p-Block Elements",
    "Organic Chemistry Basics",
    "Hydrocarbons"
  ],
  chem12: [
    "Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "p-, d-, f-Block Elements",
    "Coordination Compounds",
    "Haloalkanes & Haloarenes",
    "Alcohols, Phenols & Ethers",
    "Aldehydes, Ketones & Carboxylic Acids",
    "Amines",
    "Biomolecules & Polymers"
  ],
  math11: [
    "Sets, Relations & Functions",
    "Trigonometric Functions",
    "Complex Numbers & Quadratic Equations",
    "Linear Inequalities",
    "Permutations & Combinations",
    "Binomial Theorem",
    "Sequence & Series",
    "Straight Lines & Conic Sections",
    "Limits & Derivatives"
  ],
  math12: [
    "Relations & Functions",
    "Inverse Trigonometric Functions",
    "Matrices & Determinants",
    "Continuity & Differentiability",
    "Applications of Derivatives",
    "Integrals",
    "Differential Equations",
    "Vector Algebra",
    "3D Geometry",
    "Linear Programming",
    "Probability"
  ]
};

const contentDiv = document.getElementById("content");
const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("tab-active"));
    tab.classList.add("tab-active");

    const key = tab.dataset.target;
    const chapters = syllabusData[key];

    contentDiv.innerHTML = `
      <div class="fade-in-up bg-white rounded-2xl shadow-lg p-6 border border-green-200">
        <h2 class="text-2xl font-bold text-green-700 mb-4" style="font-family: 'Fredoka', sans-serif;">
          ${tab.textContent} - Chapter List
        </h2>
        <ul class="list-disc pl-5 space-y-2 text-gray-700">
          ${chapters.map(ch => `<li>${ch}</li>`).join("")}
        </ul>
      </div>
    `;
  });
});

// Open default tab
tabs[0].click();
