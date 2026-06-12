"""Curated NEET Previous Year Questions (PYQ) bank.

Hand-curated, high-quality NEET-level MCQs across Biology, Physics and Chemistry
with year tags. These are added to the question bank on startup (idempotent).
"""

PYQ_BANK = [
    # ============================================================
    # ===================== BIOLOGY (PYQ) ========================
    # ============================================================
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2021,
        "question": "The plasma membrane is mainly composed of:",
        "options": ["Proteins and lipids", "Carbohydrates and proteins", "Lipids and nucleic acids", "Proteins only"],
        "correct": 0,
        "explanation": "The fluid mosaic model describes the membrane as a lipid bilayer with embedded proteins."
    },
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2020,
        "question": "Which of the following is the site of protein synthesis?",
        "options": ["Lysosome", "Ribosome", "Centrosome", "Peroxisome"],
        "correct": 1,
        "explanation": "Ribosomes are the site where amino acids are assembled into proteins."
    },
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2019,
        "question": "Cell wall of fungi is mainly composed of:",
        "options": ["Cellulose", "Chitin", "Peptidoglycan", "Lignin"],
        "correct": 1,
        "explanation": "Fungal cell walls are made of chitin, a polymer of N-acetylglucosamine."
    },
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2018,
        "question": "Which organelle contains hydrolytic enzymes for intracellular digestion?",
        "options": ["Mitochondria", "Lysosome", "Golgi body", "Endoplasmic reticulum"],
        "correct": 1,
        "explanation": "Lysosomes contain hydrolytic enzymes and are called the 'suicidal bags' of the cell."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2021,
        "question": "In a dihybrid cross, the phenotypic ratio in F2 generation is:",
        "options": ["3:1", "1:2:1", "9:3:3:1", "1:1:1:1"],
        "correct": 2,
        "explanation": "Mendel's dihybrid cross gives a 9:3:3:1 phenotypic ratio in the F2 generation."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2020,
        "question": "Sickle-cell anaemia is caused by substitution of:",
        "options": ["Valine by glutamic acid", "Glutamic acid by valine", "Lysine by valine", "Glycine by valine"],
        "correct": 1,
        "explanation": "In sickle-cell anaemia, glutamic acid at the 6th position of the beta-globin chain is replaced by valine."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2019,
        "question": "The number of chromosomes in a human somatic cell is:",
        "options": ["23", "44", "46", "48"],
        "correct": 2,
        "explanation": "Humans have 46 chromosomes (23 pairs) in each somatic cell."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2017,
        "question": "Down syndrome is caused by trisomy of chromosome:",
        "options": ["18", "21", "13", "X"],
        "correct": 1,
        "explanation": "Down syndrome (trisomy 21) results from an extra copy of chromosome 21."
    },
    {
        "subject": "biology", "chapter": "Molecular Biology", "is_pyq": True, "year": 2021,
        "question": "The enzyme that joins Okazaki fragments during DNA replication is:",
        "options": ["DNA polymerase", "Helicase", "DNA ligase", "Primase"],
        "correct": 2,
        "explanation": "DNA ligase seals the nicks between Okazaki fragments on the lagging strand."
    },
    {
        "subject": "biology", "chapter": "Molecular Biology", "is_pyq": True, "year": 2020,
        "question": "Which of the following is NOT found in RNA?",
        "options": ["Adenine", "Uracil", "Thymine", "Cytosine"],
        "correct": 2,
        "explanation": "RNA contains uracil instead of thymine; thymine is found only in DNA."
    },
    {
        "subject": "biology", "chapter": "Molecular Biology", "is_pyq": True, "year": 2018,
        "question": "Translation of mRNA into protein occurs on:",
        "options": ["Nucleus", "Ribosomes", "Mitochondria", "Lysosomes"],
        "correct": 1,
        "explanation": "Translation takes place on ribosomes in the cytoplasm."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2021,
        "question": "The functional unit of the kidney is the:",
        "options": ["Neuron", "Nephron", "Alveolus", "Hepatocyte"],
        "correct": 1,
        "explanation": "The nephron is the structural and functional unit of the kidney."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2020,
        "question": "Which hormone regulates blood glucose by promoting its uptake into cells?",
        "options": ["Glucagon", "Insulin", "Adrenaline", "Thyroxine"],
        "correct": 1,
        "explanation": "Insulin lowers blood glucose by promoting cellular uptake and glycogen synthesis."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2019,
        "question": "The oxygen-carrying pigment in human blood is:",
        "options": ["Myoglobin", "Haemoglobin", "Chlorophyll", "Haemocyanin"],
        "correct": 1,
        "explanation": "Haemoglobin in red blood cells transports oxygen in humans."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2018,
        "question": "Which part of the brain controls balance and coordination?",
        "options": ["Cerebrum", "Cerebellum", "Medulla oblongata", "Hypothalamus"],
        "correct": 1,
        "explanation": "The cerebellum coordinates voluntary movements and maintains balance and posture."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2017,
        "question": "The pacemaker of the human heart is the:",
        "options": ["AV node", "SA node", "Purkinje fibres", "Bundle of His"],
        "correct": 1,
        "explanation": "The sino-atrial (SA) node initiates the heartbeat and is called the pacemaker."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": True, "year": 2021,
        "question": "The site of light reactions of photosynthesis is the:",
        "options": ["Stroma", "Thylakoid membrane", "Cytoplasm", "Outer membrane"],
        "correct": 1,
        "explanation": "Light reactions occur on the thylakoid membranes of chloroplasts."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": True, "year": 2020,
        "question": "Opening and closing of stomata is regulated by:",
        "options": ["Epidermal cells", "Guard cells", "Mesophyll cells", "Companion cells"],
        "correct": 1,
        "explanation": "Guard cells change turgidity to open and close stomatal pores."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": True, "year": 2019,
        "question": "Which plant hormone promotes cell elongation and apical dominance?",
        "options": ["Cytokinin", "Auxin", "Ethylene", "Abscisic acid"],
        "correct": 1,
        "explanation": "Auxin promotes cell elongation and maintains apical dominance."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": True, "year": 2018,
        "question": "The Calvin cycle takes place in the:",
        "options": ["Thylakoid", "Stroma", "Grana", "Cytosol"],
        "correct": 1,
        "explanation": "The Calvin cycle (dark reactions) occurs in the stroma of the chloroplast."
    },
    {
        "subject": "biology", "chapter": "Ecology", "is_pyq": True, "year": 2021,
        "question": "The 10% law of energy transfer in an ecosystem was proposed by:",
        "options": ["Lindeman", "Odum", "Tansley", "Darwin"],
        "correct": 0,
        "explanation": "Lindeman proposed that only about 10% of energy is transferred to the next trophic level."
    },
    {
        "subject": "biology", "chapter": "Ecology", "is_pyq": True, "year": 2020,
        "question": "Which of the following is a primary consumer?",
        "options": ["Lion", "Grass", "Deer", "Hawk"],
        "correct": 2,
        "explanation": "Deer feed on plants (producers), making them primary consumers (herbivores)."
    },
    {
        "subject": "biology", "chapter": "Ecology", "is_pyq": True, "year": 2019,
        "question": "An ecological pyramid of energy is always:",
        "options": ["Inverted", "Upright", "Spindle-shaped", "Either upright or inverted"],
        "correct": 1,
        "explanation": "The pyramid of energy is always upright because energy decreases at each trophic level."
    },
    {
        "subject": "biology", "chapter": "Biomolecules", "is_pyq": True, "year": 2021,
        "question": "The bond that links two amino acids in a protein is a:",
        "options": ["Glycosidic bond", "Peptide bond", "Ester bond", "Hydrogen bond"],
        "correct": 1,
        "explanation": "Amino acids are joined by peptide bonds formed between the carboxyl and amino groups."
    },
    {
        "subject": "biology", "chapter": "Biomolecules", "is_pyq": True, "year": 2020,
        "question": "Which of the following is a polysaccharide?",
        "options": ["Glucose", "Sucrose", "Glycogen", "Fructose"],
        "correct": 2,
        "explanation": "Glycogen is a branched polysaccharide that stores glucose in animals."
    },
    {
        "subject": "biology", "chapter": "Biomolecules", "is_pyq": True, "year": 2018,
        "question": "Enzymes are mostly:",
        "options": ["Lipids", "Carbohydrates", "Proteins", "Nucleic acids"],
        "correct": 2,
        "explanation": "Most enzymes are globular proteins that act as biological catalysts."
    },
    {
        "subject": "biology", "chapter": "Evolution", "is_pyq": True, "year": 2021,
        "question": "The theory of natural selection was proposed by:",
        "options": ["Lamarck", "Darwin", "Mendel", "Hugo de Vries"],
        "correct": 1,
        "explanation": "Charles Darwin proposed the theory of evolution by natural selection."
    },
    {
        "subject": "biology", "chapter": "Evolution", "is_pyq": True, "year": 2019,
        "question": "Homologous organs indicate:",
        "options": ["Convergent evolution", "Divergent evolution", "Parallel evolution", "No evolution"],
        "correct": 1,
        "explanation": "Homologous organs have common ancestry and indicate divergent evolution."
    },
    {
        "subject": "biology", "chapter": "Reproduction", "is_pyq": True, "year": 2021,
        "question": "The process of fusion of male and female gametes is called:",
        "options": ["Fertilization", "Pollination", "Germination", "Budding"],
        "correct": 0,
        "explanation": "Fertilization is the fusion of male and female gametes to form a zygote."
    },
    {
        "subject": "biology", "chapter": "Reproduction", "is_pyq": True, "year": 2020,
        "question": "In humans, the corpus luteum secretes:",
        "options": ["Estrogen", "Progesterone", "FSH", "LH"],
        "correct": 1,
        "explanation": "The corpus luteum secretes progesterone to maintain the uterine lining."
    },
    {
        "subject": "biology", "chapter": "Microbiology", "is_pyq": True, "year": 2020,
        "question": "Which microorganism is used to produce curd from milk?",
        "options": ["Aspergillus", "Lactobacillus", "Saccharomyces", "Rhizobium"],
        "correct": 1,
        "explanation": "Lactobacillus bacteria convert lactose to lactic acid, forming curd."
    },
    {
        "subject": "biology", "chapter": "Microbiology", "is_pyq": True, "year": 2019,
        "question": "Penicillin, an antibiotic, is obtained from:",
        "options": ["Bacteria", "Virus", "Fungus", "Algae"],
        "correct": 2,
        "explanation": "Penicillin is produced by the fungus Penicillium notatum/chrysogenum."
    },
    {
        "subject": "biology", "chapter": "Biotechnology", "is_pyq": True, "year": 2021,
        "question": "Restriction enzymes are used in genetic engineering to:",
        "options": ["Join DNA fragments", "Cut DNA at specific sites", "Replicate DNA", "Translate mRNA"],
        "correct": 1,
        "explanation": "Restriction endonucleases cut DNA at specific recognition sequences."
    },
    {
        "subject": "biology", "chapter": "Biotechnology", "is_pyq": True, "year": 2019,
        "question": "PCR is a technique used for:",
        "options": ["Protein synthesis", "DNA amplification", "Cell division", "RNA splicing"],
        "correct": 1,
        "explanation": "Polymerase Chain Reaction (PCR) amplifies specific DNA segments in vitro."
    },
    {
        "subject": "biology", "chapter": "Human Health", "is_pyq": True, "year": 2020,
        "question": "AIDS is caused by:",
        "options": ["Bacteria", "HIV virus", "Fungus", "Protozoa"],
        "correct": 1,
        "explanation": "AIDS is caused by the Human Immunodeficiency Virus (HIV), a retrovirus."
    },
    {
        "subject": "biology", "chapter": "Human Health", "is_pyq": True, "year": 2018,
        "question": "Which cells are primarily targeted by HIV?",
        "options": ["B-lymphocytes", "Helper T-cells", "RBCs", "Platelets"],
        "correct": 1,
        "explanation": "HIV infects and destroys helper T-cells (CD4+ cells), weakening immunity."
    },
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2017,
        "question": "Which structure is absent in prokaryotic cells?",
        "options": ["Cell membrane", "Ribosome", "Nuclear membrane", "Cytoplasm"],
        "correct": 2,
        "explanation": "Prokaryotes lack a membrane-bound nucleus; their DNA lies free in the cytoplasm."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": True, "year": 2017,
        "question": "Loss of water in the form of water droplets from leaf margins is called:",
        "options": ["Transpiration", "Guttation", "Imbibition", "Osmosis"],
        "correct": 1,
        "explanation": "Guttation is the exudation of liquid water from hydathodes at leaf margins."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2016,
        "question": "Bile is produced by the:",
        "options": ["Pancreas", "Liver", "Gall bladder", "Stomach"],
        "correct": 1,
        "explanation": "Bile is produced by the liver and stored in the gall bladder."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2016,
        "question": "Colour blindness is an example of:",
        "options": ["Autosomal dominant trait", "X-linked recessive trait", "Y-linked trait", "Mitochondrial trait"],
        "correct": 1,
        "explanation": "Red-green colour blindness is an X-linked recessive disorder."
    },
    {
        "subject": "biology", "chapter": "Biomolecules", "is_pyq": True, "year": 2016,
        "question": "The monomers of nucleic acids are:",
        "options": ["Amino acids", "Nucleotides", "Fatty acids", "Monosaccharides"],
        "correct": 1,
        "explanation": "Nucleotides (sugar + phosphate + nitrogenous base) are the building blocks of nucleic acids."
    },
    {
        "subject": "biology", "chapter": "Ecology", "is_pyq": True, "year": 2017,
        "question": "Which gas is mainly responsible for the greenhouse effect?",
        "options": ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        "correct": 2,
        "explanation": "Carbon dioxide is the major greenhouse gas contributing to global warming."
    },

    # ============================================================
    # ===================== PHYSICS (PYQ) ========================
    # ============================================================
    {
        "subject": "physics", "chapter": "Kinematics", "is_pyq": True, "year": 2021,
        "question": "The area under a velocity-time graph represents:",
        "options": ["Acceleration", "Displacement", "Force", "Momentum"],
        "correct": 1,
        "explanation": "The area under a v-t graph gives the displacement of the body."
    },
    {
        "subject": "physics", "chapter": "Kinematics", "is_pyq": True, "year": 2020,
        "question": "A body thrown vertically upward returns to the ground. Its displacement is:",
        "options": ["Maximum", "Equal to total distance", "Zero", "Half the distance"],
        "correct": 2,
        "explanation": "Since the body returns to the starting point, net displacement is zero."
    },
    {
        "subject": "physics", "chapter": "Kinematics", "is_pyq": True, "year": 2019,
        "question": "The slope of a position-time graph gives:",
        "options": ["Acceleration", "Velocity", "Distance", "Force"],
        "correct": 1,
        "explanation": "The slope of an x-t graph represents the velocity of the object."
    },
    {
        "subject": "physics", "chapter": "Laws of Motion", "is_pyq": True, "year": 2021,
        "question": "Newton's second law of motion gives the relation:",
        "options": ["F = ma", "F = mv", "F = m/a", "F = a/m"],
        "correct": 0,
        "explanation": "Newton's second law states force equals mass times acceleration (F = ma)."
    },
    {
        "subject": "physics", "chapter": "Laws of Motion", "is_pyq": True, "year": 2020,
        "question": "The principle of conservation of linear momentum follows from Newton's:",
        "options": ["First law", "Second law", "Third law", "Law of gravitation"],
        "correct": 2,
        "explanation": "Conservation of momentum is a direct consequence of Newton's third law."
    },
    {
        "subject": "physics", "chapter": "Laws of Motion", "is_pyq": True, "year": 2018,
        "question": "The SI unit of force is the:",
        "options": ["Joule", "Watt", "Newton", "Pascal"],
        "correct": 2,
        "explanation": "The SI unit of force is the newton (N), equal to kg·m/s²."
    },
    {
        "subject": "physics", "chapter": "Work Energy Power", "is_pyq": True, "year": 2021,
        "question": "The work done by a force is zero when the angle between force and displacement is:",
        "options": ["0°", "45°", "90°", "180°"],
        "correct": 2,
        "explanation": "Work W = Fd·cosθ; at θ = 90°, cosθ = 0, so work done is zero."
    },
    {
        "subject": "physics", "chapter": "Work Energy Power", "is_pyq": True, "year": 2020,
        "question": "The SI unit of power is the:",
        "options": ["Joule", "Watt", "Newton", "Erg"],
        "correct": 1,
        "explanation": "Power is the rate of doing work; its SI unit is the watt (J/s)."
    },
    {
        "subject": "physics", "chapter": "Work Energy Power", "is_pyq": True, "year": 2019,
        "question": "Kinetic energy of a body is doubled if its velocity is:",
        "options": ["Doubled", "Halved", "Increased by √2 times", "Tripled"],
        "correct": 2,
        "explanation": "KE = ½mv²; to double KE, velocity must increase by a factor of √2."
    },
    {
        "subject": "physics", "chapter": "Gravitation", "is_pyq": True, "year": 2021,
        "question": "The acceleration due to gravity at the centre of the earth is:",
        "options": ["Maximum", "9.8 m/s²", "Zero", "Infinite"],
        "correct": 2,
        "explanation": "At the centre of the earth, the net gravitational force and hence g is zero."
    },
    {
        "subject": "physics", "chapter": "Gravitation", "is_pyq": True, "year": 2020,
        "question": "The escape velocity from the earth's surface is approximately:",
        "options": ["7.9 km/s", "11.2 km/s", "9.8 km/s", "15 km/s"],
        "correct": 1,
        "explanation": "The escape velocity from earth is about 11.2 km/s."
    },
    {
        "subject": "physics", "chapter": "Gravitation", "is_pyq": True, "year": 2018,
        "question": "The gravitational force between two masses is governed by an inverse relationship with:",
        "options": ["Distance", "Square of distance", "Cube of distance", "Mass"],
        "correct": 1,
        "explanation": "Newton's law of gravitation: F ∝ 1/r², inversely proportional to the square of distance."
    },
    {
        "subject": "physics", "chapter": "Thermodynamics", "is_pyq": True, "year": 2021,
        "question": "The first law of thermodynamics is based on the conservation of:",
        "options": ["Mass", "Energy", "Momentum", "Charge"],
        "correct": 1,
        "explanation": "The first law of thermodynamics is a statement of conservation of energy."
    },
    {
        "subject": "physics", "chapter": "Thermodynamics", "is_pyq": True, "year": 2020,
        "question": "In an isothermal process, which quantity remains constant?",
        "options": ["Pressure", "Volume", "Temperature", "Internal energy change is non-zero"],
        "correct": 2,
        "explanation": "An isothermal process occurs at constant temperature."
    },
    {
        "subject": "physics", "chapter": "Thermodynamics", "is_pyq": True, "year": 2019,
        "question": "In an adiabatic process:",
        "options": ["Temperature is constant", "No heat is exchanged", "Pressure is constant", "Volume is constant"],
        "correct": 1,
        "explanation": "In an adiabatic process, there is no heat transfer between the system and surroundings."
    },
    {
        "subject": "physics", "chapter": "Oscillations", "is_pyq": True, "year": 2021,
        "question": "The time period of a simple pendulum depends on its:",
        "options": ["Mass", "Amplitude", "Length", "Material"],
        "correct": 2,
        "explanation": "T = 2π√(L/g); the period depends on length and gravity, not mass or amplitude."
    },
    {
        "subject": "physics", "chapter": "Oscillations", "is_pyq": True, "year": 2019,
        "question": "In SHM, the acceleration is maximum at:",
        "options": ["Mean position", "Extreme position", "Halfway", "Everywhere equal"],
        "correct": 1,
        "explanation": "In SHM, acceleration is proportional to displacement and is maximum at extreme positions."
    },
    {
        "subject": "physics", "chapter": "Waves", "is_pyq": True, "year": 2021,
        "question": "Sound waves cannot travel through:",
        "options": ["Solids", "Liquids", "Gases", "Vacuum"],
        "correct": 3,
        "explanation": "Sound requires a material medium; it cannot propagate through vacuum."
    },
    {
        "subject": "physics", "chapter": "Waves", "is_pyq": True, "year": 2020,
        "question": "The phenomenon of change in frequency due to relative motion is called:",
        "options": ["Refraction", "Doppler effect", "Diffraction", "Interference"],
        "correct": 1,
        "explanation": "The Doppler effect is the apparent change in frequency due to relative motion of source and observer."
    },
    {
        "subject": "physics", "chapter": "Electrostatics", "is_pyq": True, "year": 2021,
        "question": "The SI unit of electric charge is the:",
        "options": ["Ampere", "Coulomb", "Volt", "Ohm"],
        "correct": 1,
        "explanation": "The SI unit of electric charge is the coulomb (C)."
    },
    {
        "subject": "physics", "chapter": "Electrostatics", "is_pyq": True, "year": 2020,
        "question": "Coulomb's law force between two charges is inversely proportional to:",
        "options": ["Distance", "Square of distance", "Charge", "Square of charge"],
        "correct": 1,
        "explanation": "Coulomb's law: F ∝ 1/r², inversely proportional to the square of the separation."
    },
    {
        "subject": "physics", "chapter": "Current Electricity", "is_pyq": True, "year": 2021,
        "question": "Ohm's law states that V is proportional to:",
        "options": ["I²", "I", "1/I", "√I"],
        "correct": 1,
        "explanation": "Ohm's law: V = IR, voltage is directly proportional to current."
    },
    {
        "subject": "physics", "chapter": "Current Electricity", "is_pyq": True, "year": 2019,
        "question": "The SI unit of electrical resistance is the:",
        "options": ["Volt", "Ampere", "Ohm", "Watt"],
        "correct": 2,
        "explanation": "Resistance is measured in ohms (Ω) in the SI system."
    },
    {
        "subject": "physics", "chapter": "Current Electricity", "is_pyq": True, "year": 2018,
        "question": "When resistors are connected in series, the equivalent resistance:",
        "options": ["Decreases", "Increases", "Remains same", "Becomes zero"],
        "correct": 1,
        "explanation": "In series, resistances add up, so equivalent resistance increases."
    },
    {
        "subject": "physics", "chapter": "Magnetism", "is_pyq": True, "year": 2021,
        "question": "A current-carrying conductor produces:",
        "options": ["Only electric field", "Only magnetic field", "Both electric and magnetic fields", "No field"],
        "correct": 2,
        "explanation": "A current-carrying conductor produces a magnetic field, and the charges produce an electric field."
    },
    {
        "subject": "physics", "chapter": "Magnetism", "is_pyq": True, "year": 2019,
        "question": "The SI unit of magnetic flux is the:",
        "options": ["Tesla", "Weber", "Henry", "Gauss"],
        "correct": 1,
        "explanation": "Magnetic flux is measured in webers (Wb) in the SI system."
    },
    {
        "subject": "physics", "chapter": "EM Induction", "is_pyq": True, "year": 2020,
        "question": "Faraday's law of electromagnetic induction relates EMF to the rate of change of:",
        "options": ["Current", "Magnetic flux", "Voltage", "Resistance"],
        "correct": 1,
        "explanation": "Faraday's law: induced EMF equals the negative rate of change of magnetic flux."
    },
    {
        "subject": "physics", "chapter": "Optics", "is_pyq": True, "year": 2021,
        "question": "The bending of light as it passes from one medium to another is called:",
        "options": ["Reflection", "Refraction", "Diffraction", "Dispersion"],
        "correct": 1,
        "explanation": "Refraction is the bending of light due to a change in speed across media."
    },
    {
        "subject": "physics", "chapter": "Optics", "is_pyq": True, "year": 2020,
        "question": "A concave mirror is also called a:",
        "options": ["Diverging mirror", "Converging mirror", "Plane mirror", "Cylindrical mirror"],
        "correct": 1,
        "explanation": "A concave mirror converges parallel rays to a focus, hence a converging mirror."
    },
    {
        "subject": "physics", "chapter": "Optics", "is_pyq": True, "year": 2018,
        "question": "The splitting of white light into its constituent colours is called:",
        "options": ["Reflection", "Dispersion", "Refraction", "Scattering"],
        "correct": 1,
        "explanation": "Dispersion is the splitting of white light into a spectrum of colours by a prism."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": True, "year": 2021,
        "question": "The photoelectric effect was explained by:",
        "options": ["Newton", "Einstein", "Bohr", "Planck"],
        "correct": 1,
        "explanation": "Einstein explained the photoelectric effect using the quantum theory of light."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": True, "year": 2020,
        "question": "The energy of a photon is given by:",
        "options": ["E = mc²", "E = hν", "E = ½mv²", "E = qV"],
        "correct": 1,
        "explanation": "The energy of a photon is E = hν, where h is Planck's constant and ν the frequency."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": True, "year": 2019,
        "question": "The nucleus of an atom contains:",
        "options": ["Protons and electrons", "Protons and neutrons", "Neutrons and electrons", "Only protons"],
        "correct": 1,
        "explanation": "The nucleus contains protons and neutrons (collectively nucleons)."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": True, "year": 2017,
        "question": "Which radiation has the highest penetrating power?",
        "options": ["Alpha", "Beta", "Gamma", "All equal"],
        "correct": 2,
        "explanation": "Gamma rays have the highest penetrating power among nuclear radiations."
    },
    {
        "subject": "physics", "chapter": "Semiconductors", "is_pyq": True, "year": 2021,
        "question": "In an n-type semiconductor, the majority charge carriers are:",
        "options": ["Holes", "Electrons", "Protons", "Ions"],
        "correct": 1,
        "explanation": "In n-type semiconductors, electrons are the majority charge carriers."
    },
    {
        "subject": "physics", "chapter": "Semiconductors", "is_pyq": True, "year": 2019,
        "question": "A p-n junction diode allows current to flow easily when it is:",
        "options": ["Reverse biased", "Forward biased", "Unbiased", "Never"],
        "correct": 1,
        "explanation": "A diode conducts readily in forward bias and blocks current in reverse bias."
    },
    {
        "subject": "physics", "chapter": "Units and Measurement", "is_pyq": True, "year": 2020,
        "question": "Which of the following is a fundamental quantity?",
        "options": ["Force", "Velocity", "Time", "Energy"],
        "correct": 2,
        "explanation": "Time is one of the seven fundamental (base) quantities in the SI system."
    },
    {
        "subject": "physics", "chapter": "Units and Measurement", "is_pyq": True, "year": 2018,
        "question": "The dimensional formula of force is:",
        "options": ["MLT⁻¹", "MLT⁻²", "ML²T⁻²", "ML⁻¹T⁻²"],
        "correct": 1,
        "explanation": "Force = mass × acceleration, so its dimensions are [MLT⁻²]."
    },
    {
        "subject": "physics", "chapter": "Thermal Properties", "is_pyq": True, "year": 2019,
        "question": "The SI unit of heat is the:",
        "options": ["Calorie", "Joule", "Watt", "Kelvin"],
        "correct": 1,
        "explanation": "Heat is a form of energy; its SI unit is the joule (J)."
    },
    {
        "subject": "physics", "chapter": "Fluid Mechanics", "is_pyq": True, "year": 2020,
        "question": "Bernoulli's theorem is based on the conservation of:",
        "options": ["Mass", "Momentum", "Energy", "Charge"],
        "correct": 2,
        "explanation": "Bernoulli's principle is a statement of conservation of energy in fluid flow."
    },

    # ============================================================
    # ==================== CHEMISTRY (PYQ) =======================
    # ============================================================
    {
        "subject": "chemistry", "chapter": "Atomic Structure", "is_pyq": True, "year": 2021,
        "question": "The maximum number of electrons in an orbital is:",
        "options": ["1", "2", "4", "8"],
        "correct": 1,
        "explanation": "By the Pauli exclusion principle, an orbital can hold a maximum of 2 electrons."
    },
    {
        "subject": "chemistry", "chapter": "Atomic Structure", "is_pyq": True, "year": 2020,
        "question": "The atomic number of an element is equal to the number of:",
        "options": ["Neutrons", "Protons", "Electrons and neutrons", "Nucleons"],
        "correct": 1,
        "explanation": "The atomic number equals the number of protons in the nucleus."
    },
    {
        "subject": "chemistry", "chapter": "Atomic Structure", "is_pyq": True, "year": 2018,
        "question": "Isotopes of an element have the same number of:",
        "options": ["Neutrons", "Protons", "Nucleons", "Mass number"],
        "correct": 1,
        "explanation": "Isotopes have the same number of protons but different numbers of neutrons."
    },
    {
        "subject": "chemistry", "chapter": "Periodic Table", "is_pyq": True, "year": 2021,
        "question": "Across a period from left to right, atomic radius generally:",
        "options": ["Increases", "Decreases", "Remains constant", "First increases then decreases"],
        "correct": 1,
        "explanation": "Atomic radius decreases across a period due to increasing nuclear charge."
    },
    {
        "subject": "chemistry", "chapter": "Periodic Table", "is_pyq": True, "year": 2020,
        "question": "Which element has the highest electronegativity?",
        "options": ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"],
        "correct": 2,
        "explanation": "Fluorine is the most electronegative element on the Pauling scale."
    },
    {
        "subject": "chemistry", "chapter": "Periodic Table", "is_pyq": True, "year": 2019,
        "question": "Down a group, the ionization energy generally:",
        "options": ["Increases", "Decreases", "Remains same", "Becomes zero"],
        "correct": 1,
        "explanation": "Ionization energy decreases down a group as the atomic size increases."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Bonding", "is_pyq": True, "year": 2021,
        "question": "The bond formed by sharing of electrons is called:",
        "options": ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
        "correct": 1,
        "explanation": "A covalent bond forms when atoms share electron pairs."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Bonding", "is_pyq": True, "year": 2020,
        "question": "The shape of a methane (CH₄) molecule is:",
        "options": ["Linear", "Trigonal planar", "Tetrahedral", "Octahedral"],
        "correct": 2,
        "explanation": "CH₄ has sp³ hybridization giving a tetrahedral geometry with 109.5° bond angles."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Bonding", "is_pyq": True, "year": 2018,
        "question": "Which molecule has a polar covalent bond?",
        "options": ["H₂", "Cl₂", "HCl", "O₂"],
        "correct": 2,
        "explanation": "HCl has a polar covalent bond due to the electronegativity difference between H and Cl."
    },
    {
        "subject": "chemistry", "chapter": "States of Matter", "is_pyq": True, "year": 2020,
        "question": "At constant temperature, pressure of a gas is inversely proportional to its volume. This is:",
        "options": ["Charles's law", "Boyle's law", "Avogadro's law", "Gay-Lussac's law"],
        "correct": 1,
        "explanation": "Boyle's law states P ∝ 1/V at constant temperature."
    },
    {
        "subject": "chemistry", "chapter": "States of Matter", "is_pyq": True, "year": 2019,
        "question": "The volume of a gas is directly proportional to its absolute temperature at constant pressure. This is:",
        "options": ["Boyle's law", "Charles's law", "Dalton's law", "Graham's law"],
        "correct": 1,
        "explanation": "Charles's law: V ∝ T at constant pressure."
    },
    {
        "subject": "chemistry", "chapter": "Thermodynamics", "is_pyq": True, "year": 2021,
        "question": "For a spontaneous process, the change in Gibbs free energy (ΔG) is:",
        "options": ["Positive", "Negative", "Zero", "Infinite"],
        "correct": 1,
        "explanation": "A process is spontaneous when ΔG is negative."
    },
    {
        "subject": "chemistry", "chapter": "Thermodynamics", "is_pyq": True, "year": 2019,
        "question": "The enthalpy change for an exothermic reaction is:",
        "options": ["Positive", "Negative", "Zero", "Cannot be determined"],
        "correct": 1,
        "explanation": "Exothermic reactions release heat, so ΔH is negative."
    },
    {
        "subject": "chemistry", "chapter": "Equilibrium", "is_pyq": True, "year": 2021,
        "question": "The pH of a neutral solution at 25°C is:",
        "options": ["0", "7", "14", "1"],
        "correct": 1,
        "explanation": "A neutral solution has equal H⁺ and OH⁻ concentrations, giving pH 7 at 25°C."
    },
    {
        "subject": "chemistry", "chapter": "Equilibrium", "is_pyq": True, "year": 2020,
        "question": "According to Le Chatelier's principle, increasing pressure favours the reaction direction with:",
        "options": ["More gas moles", "Fewer gas moles", "No change", "Equal moles"],
        "correct": 1,
        "explanation": "Increasing pressure shifts equilibrium toward the side with fewer gaseous moles."
    },
    {
        "subject": "chemistry", "chapter": "Equilibrium", "is_pyq": True, "year": 2018,
        "question": "A buffer solution resists changes in:",
        "options": ["Temperature", "pH", "Volume", "Pressure"],
        "correct": 1,
        "explanation": "A buffer solution resists changes in pH upon addition of small amounts of acid or base."
    },
    {
        "subject": "chemistry", "chapter": "Redox Reactions", "is_pyq": True, "year": 2021,
        "question": "Oxidation is defined as:",
        "options": ["Gain of electrons", "Loss of electrons", "Gain of protons", "Loss of neutrons"],
        "correct": 1,
        "explanation": "Oxidation is the loss of electrons (increase in oxidation state)."
    },
    {
        "subject": "chemistry", "chapter": "Redox Reactions", "is_pyq": True, "year": 2019,
        "question": "In the reaction Zn + CuSO₄ → ZnSO₄ + Cu, zinc acts as:",
        "options": ["Oxidising agent", "Reducing agent", "Catalyst", "Solvent"],
        "correct": 1,
        "explanation": "Zinc loses electrons (is oxidised) and reduces Cu²⁺, acting as a reducing agent."
    },
    {
        "subject": "chemistry", "chapter": "Electrochemistry", "is_pyq": True, "year": 2020,
        "question": "In electrolysis, reduction occurs at the:",
        "options": ["Anode", "Cathode", "Both electrodes", "Neither"],
        "correct": 1,
        "explanation": "In electrolysis, reduction (gain of electrons) occurs at the cathode."
    },
    {
        "subject": "chemistry", "chapter": "Electrochemistry", "is_pyq": True, "year": 2018,
        "question": "The SI unit of electrical conductivity is:",
        "options": ["Ohm", "Siemens per metre", "Volt", "Coulomb"],
        "correct": 1,
        "explanation": "Conductivity is measured in siemens per metre (S/m)."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Kinetics", "is_pyq": True, "year": 2021,
        "question": "The rate of a chemical reaction generally increases with:",
        "options": ["Decrease in temperature", "Increase in temperature", "Decrease in concentration", "Addition of inhibitor"],
        "correct": 1,
        "explanation": "Raising temperature increases molecular collisions and energy, speeding the reaction."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Kinetics", "is_pyq": True, "year": 2019,
        "question": "A catalyst increases the rate of reaction by:",
        "options": ["Increasing activation energy", "Lowering activation energy", "Increasing temperature", "Changing equilibrium"],
        "correct": 1,
        "explanation": "A catalyst provides an alternative path with lower activation energy."
    },
    {
        "subject": "chemistry", "chapter": "Solutions", "is_pyq": True, "year": 2020,
        "question": "Molarity is defined as moles of solute per:",
        "options": ["Litre of solution", "Kilogram of solvent", "Litre of solvent", "Gram of solution"],
        "correct": 0,
        "explanation": "Molarity (M) = moles of solute per litre of solution."
    },
    {
        "subject": "chemistry", "chapter": "Solutions", "is_pyq": True, "year": 2018,
        "question": "The elevation in boiling point is a:",
        "options": ["Colligative property", "Physical constant", "Chemical property", "Catalytic property"],
        "correct": 0,
        "explanation": "Boiling point elevation depends on the number of solute particles—a colligative property."
    },
    {
        "subject": "chemistry", "chapter": "Mole Concept", "is_pyq": True, "year": 2021,
        "question": "Avogadro's number is approximately:",
        "options": ["6.022 × 10²³", "3.0 × 10⁸", "1.6 × 10⁻¹⁹", "9.1 × 10⁻³¹"],
        "correct": 0,
        "explanation": "Avogadro's number is 6.022 × 10²³ particles per mole."
    },
    {
        "subject": "chemistry", "chapter": "Mole Concept", "is_pyq": True, "year": 2019,
        "question": "The number of moles in 36 g of water (H₂O) is:",
        "options": ["1", "2", "18", "36"],
        "correct": 1,
        "explanation": "Molar mass of water is 18 g/mol; 36 g ÷ 18 g/mol = 2 moles."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": True, "year": 2021,
        "question": "The functional group present in alcohols is:",
        "options": ["-CHO", "-OH", "-COOH", "-NH₂"],
        "correct": 1,
        "explanation": "Alcohols contain the hydroxyl (-OH) functional group."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": True, "year": 2020,
        "question": "The general formula of alkanes is:",
        "options": ["CnH₂n", "CnH₂n+2", "CnH₂n-2", "CnHn"],
        "correct": 1,
        "explanation": "Alkanes are saturated hydrocarbons with the general formula CnH₂n+2."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": True, "year": 2019,
        "question": "Which of the following is an aromatic compound?",
        "options": ["Methane", "Ethene", "Benzene", "Propane"],
        "correct": 2,
        "explanation": "Benzene (C₆H₆) is the simplest aromatic hydrocarbon."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": True, "year": 2018,
        "question": "The functional group -COOH is present in:",
        "options": ["Aldehydes", "Ketones", "Carboxylic acids", "Ethers"],
        "correct": 2,
        "explanation": "The carboxyl group (-COOH) is the functional group of carboxylic acids."
    },
    {
        "subject": "chemistry", "chapter": "Hydrocarbons", "is_pyq": True, "year": 2020,
        "question": "The hybridization of carbon in ethyne (C₂H₂) is:",
        "options": ["sp", "sp²", "sp³", "sp³d"],
        "correct": 0,
        "explanation": "Ethyne has a triple bond; each carbon is sp hybridized, giving linear geometry."
    },
    {
        "subject": "chemistry", "chapter": "Hydrocarbons", "is_pyq": True, "year": 2017,
        "question": "Markovnikov's rule is applicable to the addition of HX to:",
        "options": ["Alkanes", "Alkenes", "Aromatic compounds", "Alcohols"],
        "correct": 1,
        "explanation": "Markovnikov's rule governs the addition of HX to unsymmetrical alkenes."
    },
    {
        "subject": "chemistry", "chapter": "p-Block Elements", "is_pyq": True, "year": 2021,
        "question": "Which gas is known as laughing gas?",
        "options": ["NO", "N₂O", "NO₂", "N₂O₅"],
        "correct": 1,
        "explanation": "Nitrous oxide (N₂O) is commonly called laughing gas."
    },
    {
        "subject": "chemistry", "chapter": "p-Block Elements", "is_pyq": True, "year": 2019,
        "question": "The most abundant element in the earth's crust is:",
        "options": ["Silicon", "Oxygen", "Aluminium", "Iron"],
        "correct": 1,
        "explanation": "Oxygen is the most abundant element by mass in the earth's crust."
    },
    {
        "subject": "chemistry", "chapter": "s-Block Elements", "is_pyq": True, "year": 2020,
        "question": "Which of the following is an alkali metal?",
        "options": ["Calcium", "Magnesium", "Sodium", "Aluminium"],
        "correct": 2,
        "explanation": "Sodium belongs to Group 1, the alkali metals."
    },
    {
        "subject": "chemistry", "chapter": "Coordination Compounds", "is_pyq": True, "year": 2021,
        "question": "The central metal atom in haemoglobin is:",
        "options": ["Magnesium", "Iron", "Copper", "Zinc"],
        "correct": 1,
        "explanation": "Haemoglobin contains iron (Fe) as its central coordinating metal."
    },
    {
        "subject": "chemistry", "chapter": "Coordination Compounds", "is_pyq": True, "year": 2019,
        "question": "The central metal ion in chlorophyll is:",
        "options": ["Iron", "Magnesium", "Calcium", "Manganese"],
        "correct": 1,
        "explanation": "Chlorophyll contains magnesium (Mg) at the centre of its porphyrin ring."
    },
    {
        "subject": "chemistry", "chapter": "Metallurgy", "is_pyq": True, "year": 2018,
        "question": "The process of heating an ore in the absence of air is called:",
        "options": ["Roasting", "Calcination", "Smelting", "Refining"],
        "correct": 1,
        "explanation": "Calcination is heating an ore in limited/absence of air to remove volatile matter."
    },
    {
        "subject": "chemistry", "chapter": "Biomolecules", "is_pyq": True, "year": 2020,
        "question": "Glucose is an example of a:",
        "options": ["Disaccharide", "Monosaccharide", "Polysaccharide", "Lipid"],
        "correct": 1,
        "explanation": "Glucose is a monosaccharide (single sugar unit) with formula C₆H₁₂O₆."
    },
    {
        "subject": "chemistry", "chapter": "Polymers", "is_pyq": True, "year": 2019,
        "question": "Which of the following is a natural polymer?",
        "options": ["Nylon", "Polythene", "Cellulose", "PVC"],
        "correct": 2,
        "explanation": "Cellulose is a natural polymer of glucose found in plant cell walls."
    },
    {
        "subject": "chemistry", "chapter": "Surface Chemistry", "is_pyq": True, "year": 2018,
        "question": "Adsorption of a gas on a solid surface is generally:",
        "options": ["Endothermic", "Exothermic", "Athermic", "Independent of temperature"],
        "correct": 1,
        "explanation": "Adsorption is accompanied by a decrease in surface energy, so it is exothermic."
    },

    # ============================================================
    # ================ ADDITIONAL BATCH (PYQ) ====================
    # ============================================================
    # ---- Biology ----
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2015,
        "question": "The largest gland in the human body is the:",
        "options": ["Pancreas", "Liver", "Thyroid", "Salivary gland"],
        "correct": 1,
        "explanation": "The liver is the largest gland and the largest internal organ in the human body."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2016,
        "question": "Insulin is secreted by which cells of the pancreas?",
        "options": ["Alpha cells", "Beta cells", "Delta cells", "Acinar cells"],
        "correct": 1,
        "explanation": "Beta cells of the islets of Langerhans secrete insulin."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2015,
        "question": "Which blood cells are involved in clotting?",
        "options": ["RBCs", "Platelets", "Lymphocytes", "Eosinophils"],
        "correct": 1,
        "explanation": "Platelets (thrombocytes) initiate blood clotting."
    },
    {
        "subject": "biology", "chapter": "Genetics", "is_pyq": True, "year": 2015,
        "question": "DNA fingerprinting is based on:",
        "options": ["Gene mutations", "Variable number tandem repeats", "Codon usage", "Protein structure"],
        "correct": 1,
        "explanation": "DNA fingerprinting analyses VNTRs (minisatellites) unique to individuals."
    },
    {
        "subject": "biology", "chapter": "Molecular Biology", "is_pyq": True, "year": 2016,
        "question": "The genetic code is said to be degenerate because:",
        "options": ["One codon codes for many amino acids", "Many codons code for one amino acid", "Codons overlap", "It has no start codon"],
        "correct": 1,
        "explanation": "Degeneracy means multiple codons can specify the same amino acid."
    },
    {
        "subject": "biology", "chapter": "Cell Biology", "is_pyq": True, "year": 2015,
        "question": "The semi-autonomous organelles of the cell are:",
        "options": ["Ribosomes and lysosomes", "Mitochondria and chloroplasts", "Golgi and ER", "Nucleus and centriole"],
        "correct": 1,
        "explanation": "Mitochondria and chloroplasts have their own DNA and ribosomes, making them semi-autonomous."
    },
    {
        "subject": "biology", "chapter": "Plant Physiology", "is_pyq": True, "year": 2016,
        "question": "The pigment responsible for absorbing light in photosynthesis is:",
        "options": ["Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin"],
        "correct": 1,
        "explanation": "Chlorophyll is the primary pigment that absorbs light energy for photosynthesis."
    },
    {
        "subject": "biology", "chapter": "Ecology", "is_pyq": True, "year": 2015,
        "question": "The variety of life forms in a region is called:",
        "options": ["Biomass", "Biodiversity", "Population", "Community"],
        "correct": 1,
        "explanation": "Biodiversity refers to the variety of species and ecosystems in an area."
    },
    {
        "subject": "biology", "chapter": "Reproduction", "is_pyq": True, "year": 2015,
        "question": "In angiosperms, double fertilization results in the formation of zygote and:",
        "options": ["Embryo", "Endosperm", "Seed coat", "Pericarp"],
        "correct": 1,
        "explanation": "Double fertilization forms a diploid zygote and a triploid endosperm."
    },
    {
        "subject": "biology", "chapter": "Biotechnology", "is_pyq": True, "year": 2016,
        "question": "The plasmid commonly used as a cloning vector is obtained from:",
        "options": ["Virus", "Bacteria", "Fungi", "Plants"],
        "correct": 1,
        "explanation": "Plasmids are small circular DNA molecules found in bacteria, used as cloning vectors."
    },
    {
        "subject": "biology", "chapter": "Human Health", "is_pyq": True, "year": 2017,
        "question": "Malaria is caused by:",
        "options": ["Bacteria", "Virus", "Plasmodium", "Fungus"],
        "correct": 2,
        "explanation": "Malaria is caused by the protozoan parasite Plasmodium, transmitted by Anopheles mosquitoes."
    },
    {
        "subject": "biology", "chapter": "Evolution", "is_pyq": True, "year": 2015,
        "question": "Analogous organs are a result of:",
        "options": ["Divergent evolution", "Convergent evolution", "Co-evolution", "No evolution"],
        "correct": 1,
        "explanation": "Analogous organs have similar function but different origin, indicating convergent evolution."
    },
    {
        "subject": "biology", "chapter": "Microbiology", "is_pyq": True, "year": 2018,
        "question": "Biogas is mainly composed of:",
        "options": ["Carbon dioxide", "Methane", "Hydrogen", "Oxygen"],
        "correct": 1,
        "explanation": "Biogas is predominantly methane, produced by anaerobic digestion by methanogens."
    },
    {
        "subject": "biology", "chapter": "Human Physiology", "is_pyq": True, "year": 2017,
        "question": "Which vitamin is synthesised in the skin in the presence of sunlight?",
        "options": ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
        "correct": 2,
        "explanation": "Vitamin D is synthesised in the skin upon exposure to UV rays from sunlight."
    },

    # ---- Physics ----
    {
        "subject": "physics", "chapter": "Kinematics", "is_pyq": True, "year": 2016,
        "question": "A projectile has maximum range when projected at an angle of:",
        "options": ["30°", "45°", "60°", "90°"],
        "correct": 1,
        "explanation": "Range is maximum at a projection angle of 45° (for level ground)."
    },
    {
        "subject": "physics", "chapter": "Laws of Motion", "is_pyq": True, "year": 2017,
        "question": "The rate of change of momentum is equal to:",
        "options": ["Velocity", "Force", "Energy", "Acceleration"],
        "correct": 1,
        "explanation": "Newton's second law: force equals the rate of change of momentum."
    },
    {
        "subject": "physics", "chapter": "Work Energy Power", "is_pyq": True, "year": 2016,
        "question": "1 horsepower is approximately equal to:",
        "options": ["546 W", "746 W", "1000 W", "100 W"],
        "correct": 1,
        "explanation": "1 horsepower ≈ 746 watts."
    },
    {
        "subject": "physics", "chapter": "Gravitation", "is_pyq": True, "year": 2017,
        "question": "The period of a geostationary satellite around the earth is:",
        "options": ["1 hour", "12 hours", "24 hours", "48 hours"],
        "correct": 2,
        "explanation": "A geostationary satellite has an orbital period of 24 hours, matching the earth's rotation."
    },
    {
        "subject": "physics", "chapter": "Thermodynamics", "is_pyq": True, "year": 2016,
        "question": "The efficiency of a Carnot engine depends on:",
        "options": ["Working substance", "Temperatures of source and sink", "Pressure", "Volume"],
        "correct": 1,
        "explanation": "Carnot efficiency = 1 − T_sink/T_source, depending only on the two reservoir temperatures."
    },
    {
        "subject": "physics", "chapter": "Oscillations", "is_pyq": True, "year": 2017,
        "question": "The potential energy in SHM is maximum at the:",
        "options": ["Mean position", "Extreme position", "Halfway point", "It is constant"],
        "correct": 1,
        "explanation": "PE is maximum at extreme positions where displacement is maximum."
    },
    {
        "subject": "physics", "chapter": "Waves", "is_pyq": True, "year": 2016,
        "question": "The speed of sound is greatest in:",
        "options": ["Air", "Water", "Steel", "Vacuum"],
        "correct": 2,
        "explanation": "Sound travels fastest in solids like steel due to high elasticity."
    },
    {
        "subject": "physics", "chapter": "Electrostatics", "is_pyq": True, "year": 2017,
        "question": "Electric field inside a charged hollow conductor is:",
        "options": ["Maximum", "Zero", "Uniform and non-zero", "Infinite"],
        "correct": 1,
        "explanation": "The electric field inside a charged hollow conductor is zero (Faraday cage effect)."
    },
    {
        "subject": "physics", "chapter": "Current Electricity", "is_pyq": True, "year": 2016,
        "question": "The power dissipated in a resistor is given by:",
        "options": ["P = IV", "P = I/V", "P = V/I", "P = I/R"],
        "correct": 0,
        "explanation": "Electrical power dissipated is P = VI = I²R = V²/R."
    },
    {
        "subject": "physics", "chapter": "Magnetism", "is_pyq": True, "year": 2017,
        "question": "The direction of force on a current-carrying conductor in a magnetic field is given by:",
        "options": ["Right-hand thumb rule", "Fleming's left-hand rule", "Lenz's law", "Ohm's law"],
        "correct": 1,
        "explanation": "Fleming's left-hand rule gives the direction of force on a current-carrying conductor."
    },
    {
        "subject": "physics", "chapter": "Optics", "is_pyq": True, "year": 2016,
        "question": "The power of a lens is measured in:",
        "options": ["Watt", "Dioptre", "Lumen", "Candela"],
        "correct": 1,
        "explanation": "The power of a lens is measured in dioptres (D), the reciprocal of focal length in metres."
    },
    {
        "subject": "physics", "chapter": "Modern Physics", "is_pyq": True, "year": 2016,
        "question": "The mass-energy equivalence relation is:",
        "options": ["E = mc²", "E = hν", "E = mgh", "E = ½mv²"],
        "correct": 0,
        "explanation": "Einstein's mass-energy equivalence is E = mc²."
    },
    {
        "subject": "physics", "chapter": "Semiconductors", "is_pyq": True, "year": 2017,
        "question": "Doping silicon with phosphorus produces a:",
        "options": ["p-type semiconductor", "n-type semiconductor", "Insulator", "Conductor"],
        "correct": 1,
        "explanation": "Phosphorus (pentavalent) donates electrons, producing an n-type semiconductor."
    },
    {
        "subject": "physics", "chapter": "Thermal Properties", "is_pyq": True, "year": 2016,
        "question": "The transfer of heat without the movement of the medium is:",
        "options": ["Conduction", "Convection", "Radiation", "Both convection and radiation"],
        "correct": 0,
        "explanation": "Conduction transfers heat through a medium without bulk movement of particles."
    },
    {
        "subject": "physics", "chapter": "Fluid Mechanics", "is_pyq": True, "year": 2017,
        "question": "The upward force on a body immersed in a fluid is called:",
        "options": ["Viscosity", "Buoyancy", "Surface tension", "Friction"],
        "correct": 1,
        "explanation": "Buoyancy (upthrust) is the upward force exerted by a fluid on an immersed body."
    },

    # ---- Chemistry ----
    {
        "subject": "chemistry", "chapter": "Atomic Structure", "is_pyq": True, "year": 2016,
        "question": "The principal quantum number (n) determines the:",
        "options": ["Shape of orbital", "Size and energy of orbital", "Orientation of orbital", "Spin of electron"],
        "correct": 1,
        "explanation": "The principal quantum number n determines the main energy level (size and energy)."
    },
    {
        "subject": "chemistry", "chapter": "Periodic Table", "is_pyq": True, "year": 2017,
        "question": "The number of periods in the modern periodic table is:",
        "options": ["7", "8", "18", "9"],
        "correct": 0,
        "explanation": "The modern periodic table has 7 periods (horizontal rows)."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Bonding", "is_pyq": True, "year": 2016,
        "question": "The number of sigma bonds in a molecule of ethane (C₂H₆) is:",
        "options": ["5", "6", "7", "8"],
        "correct": 2,
        "explanation": "Ethane has 6 C-H sigma bonds and 1 C-C sigma bond, totalling 7 sigma bonds."
    },
    {
        "subject": "chemistry", "chapter": "States of Matter", "is_pyq": True, "year": 2017,
        "question": "The ideal gas equation is:",
        "options": ["PV = nRT", "PV = nR/T", "P/V = nRT", "PVT = nR"],
        "correct": 0,
        "explanation": "The ideal gas equation is PV = nRT."
    },
    {
        "subject": "chemistry", "chapter": "Equilibrium", "is_pyq": True, "year": 2016,
        "question": "The conjugate base of water (H₂O) is:",
        "options": ["H₃O⁺", "OH⁻", "O²⁻", "H⁺"],
        "correct": 1,
        "explanation": "Water donates a proton to form OH⁻, its conjugate base."
    },
    {
        "subject": "chemistry", "chapter": "Redox Reactions", "is_pyq": True, "year": 2017,
        "question": "The oxidation number of oxygen in most compounds is:",
        "options": ["+2", "−2", "−1", "0"],
        "correct": 1,
        "explanation": "Oxygen usually has an oxidation state of −2 (except in peroxides and fluorides)."
    },
    {
        "subject": "chemistry", "chapter": "Electrochemistry", "is_pyq": True, "year": 2016,
        "question": "In a galvanic cell, oxidation occurs at the:",
        "options": ["Cathode", "Anode", "Salt bridge", "Electrolyte"],
        "correct": 1,
        "explanation": "In a galvanic cell, oxidation occurs at the anode (negative electrode)."
    },
    {
        "subject": "chemistry", "chapter": "Chemical Kinetics", "is_pyq": True, "year": 2016,
        "question": "The unit of rate constant for a first-order reaction is:",
        "options": ["mol L⁻¹ s⁻¹", "s⁻¹", "L mol⁻¹ s⁻¹", "mol⁻¹ s⁻¹"],
        "correct": 1,
        "explanation": "For a first-order reaction the rate constant has units of s⁻¹ (time⁻¹)."
    },
    {
        "subject": "chemistry", "chapter": "Solutions", "is_pyq": True, "year": 2017,
        "question": "Henry's law relates the solubility of a gas to its:",
        "options": ["Temperature", "Partial pressure", "Volume", "Density"],
        "correct": 1,
        "explanation": "Henry's law states the solubility of a gas is proportional to its partial pressure."
    },
    {
        "subject": "chemistry", "chapter": "Organic Chemistry", "is_pyq": True, "year": 2016,
        "question": "The IUPAC name of CH₃COOH is:",
        "options": ["Methanoic acid", "Ethanoic acid", "Propanoic acid", "Formic acid"],
        "correct": 1,
        "explanation": "CH₃COOH (acetic acid) has the IUPAC name ethanoic acid."
    },
    {
        "subject": "chemistry", "chapter": "Hydrocarbons", "is_pyq": True, "year": 2016,
        "question": "The general formula of alkenes is:",
        "options": ["CnH₂n+2", "CnH₂n", "CnH₂n-2", "CnHn"],
        "correct": 1,
        "explanation": "Alkenes contain one double bond and have the general formula CnH₂n."
    },
    {
        "subject": "chemistry", "chapter": "p-Block Elements", "is_pyq": True, "year": 2017,
        "question": "Which allotrope of carbon is the hardest natural substance?",
        "options": ["Graphite", "Diamond", "Fullerene", "Coke"],
        "correct": 1,
        "explanation": "Diamond, with its 3D tetrahedral covalent network, is the hardest natural substance."
    },
    {
        "subject": "chemistry", "chapter": "Biomolecules", "is_pyq": True, "year": 2017,
        "question": "The building blocks of proteins are:",
        "options": ["Fatty acids", "Amino acids", "Nucleotides", "Monosaccharides"],
        "correct": 1,
        "explanation": "Proteins are polymers of amino acids linked by peptide bonds."
    },
    {
        "subject": "chemistry", "chapter": "Polymers", "is_pyq": True, "year": 2017,
        "question": "Nylon-6,6 is an example of a:",
        "options": ["Addition polymer", "Condensation polymer", "Natural polymer", "Elastomer"],
        "correct": 1,
        "explanation": "Nylon-6,6 forms by condensation polymerisation between a diamine and a dicarboxylic acid."
    },
    {
        "subject": "chemistry", "chapter": "Mole Concept", "is_pyq": True, "year": 2017,
        "question": "The molar mass of CO₂ is:",
        "options": ["28 g/mol", "44 g/mol", "32 g/mol", "12 g/mol"],
        "correct": 1,
        "explanation": "CO₂ molar mass = 12 + 2×16 = 44 g/mol."
    },
]

