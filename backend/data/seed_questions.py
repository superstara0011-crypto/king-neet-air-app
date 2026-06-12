"""Seed NEET questions across Biology, Physics, Chemistry."""

SEED_QUESTIONS = [
    # ===================== BIOLOGY =====================
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2023,
        "question": "Which organelle is known as the powerhouse of the cell?",
        "options": ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        "correct": 2,
        "explanation": "Mitochondria produce ATP through cellular respiration, making them the powerhouse of the cell."
    },
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": False,
        "question": "Which of the following is NOT a function of the smooth ER?",
        "options": ["Lipid synthesis", "Detoxification", "Protein synthesis", "Calcium storage"],
        "correct": 2,
        "explanation": "Protein synthesis occurs on rough ER (which has ribosomes), not smooth ER."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2022,
        "question": "The law of segregation states that:",
        "options": [
            "Genes are linked together",
            "Two alleles of a gene separate during gamete formation",
            "Traits blend in offspring",
            "Genes always dominate"
        ],
        "correct": 1,
        "explanation": "Mendel's Law of Segregation states each gamete carries only one allele from each parent."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": False,
        "question": "A test cross is used to determine:",
        "options": ["Phenotype", "Genotype of dominant phenotype", "Number of chromosomes", "Linkage strength"],
        "correct": 1,
        "explanation": "Test cross with homozygous recessive reveals whether dominant phenotype is homozygous or heterozygous."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2023,
        "question": "The pacemaker of the human heart is:",
        "options": ["AV node", "SA node", "Purkinje fibres", "Bundle of His"],
        "correct": 1,
        "explanation": "The Sinoatrial (SA) node generates electrical impulses that initiate heartbeat."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": False,
        "question": "Which hormone regulates blood calcium levels?",
        "options": ["Insulin", "Thyroxine", "Parathormone", "Adrenaline"],
        "correct": 2,
        "explanation": "Parathormone (PTH) from parathyroid gland raises blood calcium levels."
    },
    {
        "subject": "biology", "chapter": "Ecology", "is_pyq": True, "year": 2021,
        "question": "The pyramid of energy is always:",
        "options": ["Inverted", "Upright", "Spindle-shaped", "Variable"],
        "correct": 1,
        "explanation": "Energy decreases at each trophic level (10% rule), so the pyramid is always upright."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": False,
        "question": "Photosynthesis occurs primarily in which organelle?",
        "options": ["Mitochondria", "Chloroplast", "Vacuole", "Nucleus"],
        "correct": 1,
        "explanation": "Chloroplasts contain chlorophyll which absorbs light energy for photosynthesis."
    },
    {
        "subject": "biology", "chapter": "Reproduction", "is_pyq": True, "year": 2022,
        "question": "Double fertilization is a characteristic feature of:",
        "options": ["Gymnosperms", "Angiosperms", "Bryophytes", "Pteridophytes"],
        "correct": 1,
        "explanation": "In angiosperms, one sperm fertilizes the egg and another fuses with polar nuclei to form endosperm."
    },
    {
        "subject": "biology", "chapter": "Evolution", "is_pyq": False,
        "question": "Who proposed the theory of natural selection?",
        "options": ["Lamarck", "Darwin", "Mendel", "Watson"],
        "correct": 1,
        "explanation": "Charles Darwin proposed natural selection in 'On the Origin of Species' (1859)."
    },
    {
        "subject": "biology", "chapter": "Biomolecules", "is_pyq": True, "year": 2023,
        "question": "DNA differs from RNA in containing:",
        "options": ["Ribose sugar", "Uracil", "Thymine", "Phosphate"],
        "correct": 2,
        "explanation": "DNA contains thymine; RNA has uracil in its place."
    },
    {
        "subject": "biology", "chapter": "Microbes", "is_pyq": False,
        "question": "Penicillin is obtained from:",
        "options": ["Bacteria", "Virus", "Fungi", "Algae"],
        "correct": 2,
        "explanation": "Penicillin is produced by the fungus Penicillium notatum/chrysogenum."
    },

    # ===================== PHYSICS =====================
    {
        "subject": "physics", "chapter": "Mechanics", "is_pyq": True, "year": 2023,
        "question": "The SI unit of force is:",
        "options": ["Joule", "Newton", "Watt", "Pascal"],
        "correct": 1,
        "explanation": "Force = mass × acceleration; SI unit is Newton (kg·m/s²)."
    },
    {
        "subject": "physics", "chapter": "Mechanics", "is_pyq": False,
        "question": "An object in free fall has acceleration of approximately:",
        "options": ["9.8 m/s² downward", "9.8 m/s² upward", "Zero", "Variable with mass"],
        "correct": 0,
        "explanation": "Near Earth's surface, gravitational acceleration is ~9.8 m/s² directed downward, independent of mass."
    },
    {
        "subject": "physics", "chapter": "Thermodynamics", "is_pyq": True, "year": 2022,
        "question": "The first law of thermodynamics is a statement of:",
        "options": ["Conservation of momentum", "Conservation of energy", "Conservation of mass", "Entropy increase"],
        "correct": 1,
        "explanation": "First law: ΔU = Q − W, expressing conservation of energy."
    },
    {
        "subject": "physics", "chapter": "Thermodynamics", "is_pyq": False,
        "question": "The efficiency of a Carnot engine depends on:",
        "options": ["Working substance", "Source and sink temperatures", "Pressure", "Volume"],
        "correct": 1,
        "explanation": "Carnot efficiency η = 1 − T_cold/T_hot depends only on absolute temperatures."
    },
    {
        "subject": "physics", "chapter": "Electromagnetism", "is_pyq": True, "year": 2023,
        "question": "Coulomb's law gives the force between:",
        "options": ["Magnetic poles", "Point charges", "Current loops", "Masses"],
        "correct": 1,
        "explanation": "Coulomb's law: F = kq₁q₂/r² between two stationary point charges."
    },
    {
        "subject": "physics", "chapter": "Electromagnetism", "is_pyq": False,
        "question": "The unit of magnetic flux is:",
        "options": ["Tesla", "Weber", "Henry", "Gauss"],
        "correct": 1,
        "explanation": "Weber (Wb) is the SI unit of magnetic flux. Tesla = Wb/m²."
    },
    {
        "subject": "physics", "chapter": "Optics", "is_pyq": True, "year": 2021,
        "question": "Total internal reflection occurs when light travels from:",
        "options": ["Rarer to denser medium", "Denser to rarer medium", "Same medium", "Vacuum to air"],
        "correct": 1,
        "explanation": "TIR requires light moving from denser to rarer medium at angle greater than critical angle."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": False,
        "question": "Photoelectric effect demonstrates the:",
        "options": ["Wave nature of light", "Particle nature of light", "Polarization", "Diffraction"],
        "correct": 1,
        "explanation": "Einstein explained photoelectric effect using photons, proving light's particle nature."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": True, "year": 2022,
        "question": "The atom number of an element equals the number of:",
        "options": ["Neutrons", "Protons", "Electrons in shell", "Nucleons"],
        "correct": 1,
        "explanation": "Atomic number Z = number of protons in the nucleus."
    },
    {
        "subject": "physics", "chapter": "Waves", "is_pyq": False,
        "question": "Speed of sound is fastest in:",
        "options": ["Vacuum", "Air", "Water", "Steel"],
        "correct": 3,
        "explanation": "Sound travels fastest in solids due to closely packed molecules; cannot travel in vacuum."
    },
    {
        "subject": "physics", "chapter": "Mechanics", "is_pyq": True, "year": 2023,
        "question": "Momentum is conserved when:",
        "options": ["No external force acts", "No friction", "Mass is constant", "Velocity is zero"],
        "correct": 0,
        "explanation": "Conservation of momentum requires no net external force on the system."
    },

    # ===================== CHEMISTRY =====================
    {
        "subject": "chemistry", "chapter": "Atomic Structure", "is_pyq": True, "year": 2023,
        "question": "The maximum number of electrons in the M shell is:",
        "options": ["8", "18", "32", "2"],
        "correct": 1,
        "explanation": "M shell (n=3) can hold 2n² = 18 electrons."
    },
    {
        "subject": "chemistry", "chapter": "Atomic Structure", "is_pyq": False,
        "question": "Who proposed the quantum mechanical model of the atom?",
        "options": ["Bohr", "Rutherford", "Schrödinger", "Dalton"],
        "correct": 2,
        "explanation": "Schrödinger's wave equation forms the basis of the quantum mechanical model."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Bonding", "is_pyq": True, "year": 2022,
        "question": "The shape of NH₃ molecule is:",
        "options": ["Tetrahedral", "Pyramidal", "Linear", "Bent"],
        "correct": 1,
        "explanation": "NH₃ has 3 bond pairs + 1 lone pair → trigonal pyramidal geometry."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Bonding", "is_pyq": False,
        "question": "Which bond is strongest?",
        "options": ["Single", "Double", "Triple", "Hydrogen"],
        "correct": 2,
        "explanation": "Triple bonds have highest bond energy and shortest bond length."
    },
    {
        "subject": "chemistry", "chapter": "Thermochemistry", "is_pyq": True, "year": 2023,
        "question": "An exothermic reaction has:",
        "options": ["ΔH > 0", "ΔH < 0", "ΔH = 0", "ΔS > 0"],
        "correct": 1,
        "explanation": "Exothermic reactions release heat, so enthalpy change ΔH is negative."
    },
    {
        "subject": "chemistry", "chapter": "Equilibrium", "is_pyq": False,
        "question": "Le Chatelier's principle deals with:",
        "options": ["Reaction rate", "Equilibrium shift", "Activation energy", "Catalysis"],
        "correct": 1,
        "explanation": "Le Chatelier's principle predicts how equilibrium shifts when conditions change."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": True, "year": 2022,
        "question": "The general formula of alkanes is:",
        "options": ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙH₂ₙ₊₁"],
        "correct": 1,
        "explanation": "Alkanes are saturated hydrocarbons with the general formula CₙH₂ₙ₊₂."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": False,
        "question": "Markovnikov's rule applies to addition of HX to:",
        "options": ["Alkanes", "Alkenes", "Alcohols", "Aldehydes"],
        "correct": 1,
        "explanation": "Markovnikov's rule predicts H goes to the carbon with more H atoms in alkene additions."
    },
    {
        "subject": "chemistry", "chapter": "Electrochemistry", "is_pyq": True, "year": 2021,
        "question": "Which electrode is the anode in a galvanic cell?",
        "options": ["Positive electrode", "Negative electrode", "Both", "Neither"],
        "correct": 1,
        "explanation": "In galvanic cells, oxidation occurs at the anode which is the negative electrode."
    },
    {
        "subject": "chemistry", "chapter": "Periodic Table", "is_pyq": False,
        "question": "Electronegativity generally increases:",
        "options": ["Down a group", "Across a period left to right", "Across a period right to left", "Randomly"],
        "correct": 1,
        "explanation": "Electronegativity increases left to right across a period (fluorine has highest)."
    },
    {
        "subject": "chemistry", "chapter": "Acids and Bases", "is_pyq": True, "year": 2023,
        "question": "The pH of a neutral solution at 25°C is:",
        "options": ["0", "7", "14", "1"],
        "correct": 1,
        "explanation": "At 25°C, pure water has [H⁺] = 10⁻⁷ M, giving pH = 7."
    },
    {
        "subject": "chemistry", "chapter": "Coordination Compounds", "is_pyq": False,
        "question": "The oxidation state of Fe in K₃[Fe(CN)₆] is:",
        "options": ["+2", "+3", "+4", "0"],
        "correct": 1,
        "explanation": "K is +1 (×3 = +3), CN is −1 (×6 = −6); Fe must be +3 to balance."
    },
]
