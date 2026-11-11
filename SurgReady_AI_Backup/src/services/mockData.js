// SurgReady AI - Mock Data Service
// Professional healthcare data for demo and integration readiness

export const DEMO_USERS = [
  {
    id: 'usr_doc_01',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'doctor.sarah@stjude-health.org',
    role: 'doctor',
    role_title: 'Lead Orthopedic Surgeon',
    hospital: 'St. Jude Medical Center',
    department: 'Orthopedic Surgery',
    initials: 'SJ',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    license: 'MD-940218-CA',
    phone: '+1 (555) 234-8900'
  },
  {
    id: 'usr_mgmt_01',
    name: 'Director Arthur Vance',
    email: 'management.officer@stjude-health.org',
    role: 'management',
    role_title: 'Director of Hospital Operations & Materials',
    hospital: 'St. Jude Medical Center',
    department: 'Hospital Administration & Inventory Management',
    initials: 'AV',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    license: 'MGMT-8801',
    phone: '+1 (555) 234-8910'
  },
  {
    id: 'usr_nurse_01',
    name: 'Elena Rostova, RN',
    email: 'nurse.elena@stjude-health.org',
    role: 'nurse',
    role_title: 'Lead OR Circulating Nurse',
    hospital: 'St. Jude Medical Center',
    department: 'Operating Suites (OR 1-4)',
    initials: 'ER',
    avatar: 'https://images.unsplash.com/photo-1594824813589-411516e8cb49?auto=format&fit=crop&q=80&w=250',
    license: 'RN-883011',
    phone: '+1 (555) 234-8924'
  },
  {
    id: 'usr_pat_01',
    name: 'Robert Miller',
    email: 'patient.robert@gmail.com',
    role: 'patient',
    role_title: 'Surgical Patient (Total Knee Replacement)',
    hospital: 'St. Jude Medical Center',
    department: 'Orthopedics / Outpatient Surgery',
    initials: 'RM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    license: 'PT-88219',
    phone: '+1 (555) 234-8930'
  },
  // Compatibility Aliases for existing testing
  {
    id: 'usr_doc_santhosh',
    name: 'Dr. Santhosh Kumar, MD',
    email: 'santhosh1234@gmail.com',
    role: 'doctor',
    role_title: 'Attending Orthopedic Surgeon',
    hospital: 'St. Jude Medical Center',
    department: 'Orthopedic Surgery & Traumatology',
    initials: 'SK',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    license: 'MD-883921-CA',
    phone: '+1 (555) 789-2244'
  },
  {
    id: 'usr_01_alias',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@stjude-health.org',
    role: 'doctor',
    role_title: 'Lead Orthopedic Surgeon',
    hospital: 'St. Jude Medical Center',
    department: 'Orthopedic Surgery',
    initials: 'SJ',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    license: 'MD-940218-CA',
    phone: '+1 (555) 234-8900'
  },
  {
    id: 'usr_02_alias',
    name: 'Marcus Vance, CST',
    email: 'm.vance@stjude-health.org',
    role: 'nurse',
    role_title: 'Lead Surgical Technologist',
    hospital: 'St. Jude Medical Center',
    department: 'Central Sterile & OR Supply',
    initials: 'MV',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    license: 'CST-77140',
    phone: '+1 (555) 234-8912'
  },
  {
    id: 'usr_03_alias',
    name: 'Elena Rostova, RN',
    email: 'e.rostova@stjude-health.org',
    role: 'nurse',
    role_title: 'OR Circulating Nurse',
    hospital: 'St. Jude Medical Center',
    department: 'Operating Suites (OR 1-6)',
    initials: 'ER',
    avatar: 'https://images.unsplash.com/photo-1594824813589-411516e8cb49?auto=format&fit=crop&q=80&w=250',
    license: 'RN-883011',
    phone: '+1 (555) 234-8924'
  },
  {
    id: 'usr_04_unverified',
    name: 'Dr. Unverified User',
    email: 'unverified@stjude-health.org',
    role: 'doctor',
    role_title: 'Clinical Fellow (Unverified)',
    hospital: 'St. Jude Medical Center',
    department: 'Surgical Services',
    initials: 'UV',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    license: 'PENDING',
    status: 'pending_verification',
    phone: '+1 (555) 234-8999'
  },
  {
    id: 'usr_05_noprofile',
    name: 'Dr. Missing Profile',
    email: 'noprofile@stjude-health.org',
    role: 'doctor',
    role_title: 'Staff (Profile Missing in DB)',
    hospital: 'Unknown Facility',
    department: 'General',
    initials: 'NP',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    license: 'NONE',
    profile_missing: true,
    phone: '+1 (555) 234-8998'
  }
];

export const INITIAL_PROCEDURES = [
  {
    id: 'SR-2026-0841',
    patientId: 'PT-88219',
    patientName: 'Robert Miller',
    patientAge: 64,
    patientGender: 'Male',
    hospitalId: 'SJMC-OR-4',
    hospital: 'St. Jude Medical Center',
    name: 'Left Total Knee Arthroplasty (TKA)',
    code: 'CPT 27447',
    type: 'Orthopedic Joint Replacement',
    manufacturer: 'Stryker',
    systemName: 'Triathlon Knee System',
    date: '2026-11-12',
    time: '07:30 AM',
    surgeon: 'Dr. Sarah Jenkins',
    status: 'In Progress', // 'Completed' | 'In Progress' | 'Pending Review'
    priority: 'Elective',
    readiness: 84,
    anesthesia: 'Spinal with Adductor Canal Block',
    notes: 'Prior arthroscopy 2021. Moderate varus deformity (6.5°). Medial joint line reduction.',
    measurements: {
      varusValgus: '6.5° Varus',
      femoralSizeEst: 'Size 5 (Right)',
      tibialSizeEst: 'Size 4',
      polyThickness: '11 mm insert',
      jointLineOffset: '+2.1 mm'
    },
    scanInfo: {
      modality: 'Pre-op Helical CT / 3D Reconstruction',
      scanDate: '2026-10-28',
      slicesCount: 512,
      thickness: '0.625 mm',
      status: 'Segmented & Verified'
    }
  },
  {
    id: 'SR-2026-0839',
    patientId: 'PT-90142',
    patientName: 'Eleanor Vance',
    patientAge: 71,
    patientGender: 'Female',
    hospitalId: 'SJMC-OR-2',
    hospital: 'St. Jude Medical Center',
    name: 'Right Anterior Total Hip Arthroplasty',
    code: 'CPT 27130',
    type: 'Orthopedic Joint Replacement',
    manufacturer: 'Zimmer Biomet',
    systemName: 'Persona / G7 Acetabular System',
    date: '2026-11-11',
    time: '09:00 AM',
    surgeon: 'Dr. Arthur Chen',
    status: 'Pending Review',
    priority: 'Urgent',
    readiness: 62,
    anesthesia: 'General Endotracheal',
    notes: 'Severe avascular necrosis right femoral head. Osteopenic bone stock requiring porous coating.',
    measurements: {
      varusValgus: 'N/A (Hip)',
      femoralSizeEst: 'Stem Size 12 High Offset',
      tibialSizeEst: 'Cup 52 mm',
      polyThickness: 'Neutral Liner 36mm ID',
      jointLineOffset: 'Leg length discrepancy +4 mm'
    },
    scanInfo: {
      modality: 'Bilateral Pelvis / Hip CT Angio',
      scanDate: '2026-11-02',
      slicesCount: 420,
      thickness: '1.0 mm',
      status: 'Awaiting Surgeon Sign-off'
    }
  },
  {
    id: 'SR-2026-0835',
    patientId: 'PT-74512',
    patientName: 'David K. Ramirez',
    patientAge: 52,
    patientGender: 'Male',
    hospitalId: 'MRH-OR-7',
    hospital: 'Memorial Regional Hospital',
    name: 'L4-L5 Posterior Lumbar Interbody Fusion (PLIF)',
    code: 'CPT 22630',
    type: 'Spinal Instrumentation',
    manufacturer: 'Medtronic',
    systemName: 'CD Horizon Solera System',
    date: '2026-11-10',
    time: '08:00 AM',
    surgeon: 'Dr. Marcus Vance',
    status: 'Completed',
    priority: 'Elective',
    readiness: 100,
    anesthesia: 'General Endotracheal',
    notes: 'Grade II spondylolisthesis at L4-L5. Decompression and titanium interbody cage placement complete.',
    measurements: {
      varusValgus: 'N/A',
      femoralSizeEst: 'Pedicle Screws: 6.5 x 45mm (x4)',
      tibialSizeEst: 'Cage: 10mm x 26mm (10° Lordotic)',
      polyThickness: 'N/A',
      jointLineOffset: 'Disc height restored to 11.2mm'
    },
    scanInfo: {
      modality: 'Lumbar Spine 3T MRI & High-res CT',
      scanDate: '2026-10-15',
      slicesCount: 780,
      thickness: '0.8 mm',
      status: 'Post-op Verified'
    }
  },
  {
    id: 'SR-2026-0830',
    patientId: 'PT-66321',
    patientName: 'Clara Henderson',
    patientAge: 68,
    patientGender: 'Female',
    hospitalId: 'SJMC-OR-1',
    hospital: 'St. Jude Medical Center',
    name: 'Revision Total Knee Arthroplasty',
    code: 'CPT 27487',
    type: 'Orthopedic Revision',
    manufacturer: 'DePuy Synthes',
    systemName: 'ATTUNE Revision Knee System',
    date: '2026-11-14',
    time: '11:30 AM',
    surgeon: 'Dr. Sarah Jenkins',
    status: 'In Progress',
    priority: 'Urgent',
    readiness: 76,
    anesthesia: 'Combined Spinal-Epidural',
    notes: 'Aseptic loosening tibial tray. Augments and stem extensions required on standby.',
    measurements: {
      varusValgus: '8° Valgus laxity',
      femoralSizeEst: 'Size 6 Constrained Condylar',
      tibialSizeEst: 'Size 5 with 10mm augment',
      polyThickness: '14 mm stabilized insert',
      jointLineOffset: '+4.5 mm'
    },
    scanInfo: {
      modality: 'Contrast CT with Metal Artifact Reduction (MARS)',
      scanDate: '2026-11-04',
      slicesCount: 640,
      thickness: '0.5 mm',
      status: 'Segmented & Verified'
    }
  },
  {
    id: 'SR-2026-0824',
    patientId: 'PT-55198',
    patientName: 'James Wilson',
    patientAge: 59,
    patientGender: 'Male',
    hospitalId: 'SJMC-OR-3',
    hospital: 'St. Jude Medical Center',
    name: 'Anatomic Total Shoulder Arthroplasty',
    code: 'CPT 23472',
    type: 'Upper Extremity Joint',
    manufacturer: 'Stryker',
    systemName: 'Tornier Aequalis PerFORM',
    date: '2026-11-09',
    time: '01:00 PM',
    surgeon: 'Dr. Elena Rostova',
    status: 'Completed',
    priority: 'Elective',
    readiness: 100,
    anesthesia: 'General with Interscalene Block',
    notes: 'Primary glenohumeral osteoarthritis with intact rotator cuff. B2 retroverted glenoid.',
    measurements: {
      varusValgus: '14° Glenoid Retroversion',
      femoralSizeEst: 'Humeral Stem: 9mm x 115mm',
      tibialSizeEst: 'Glenoid: Small Stepped Keel',
      polyThickness: 'Standard Polyethylene Keel',
      jointLineOffset: 'Humeral head 46 x 18'
    },
    scanInfo: {
      modality: 'Scapular High Resolution 3D CT',
      scanDate: '2026-10-18',
      slicesCount: 380,
      thickness: '0.75 mm',
      status: 'Post-op Verified'
    }
  },
  {
    id: 'SR-2026-0818',
    patientId: 'PT-44201',
    patientName: 'Samantha Reed',
    patientAge: 38,
    patientGender: 'Female',
    hospitalId: 'MTC-OR-9',
    hospital: 'Metro Trauma Center',
    name: 'Complex Bicondylar Tibial Plateau ORIF',
    code: 'CPT 27536',
    type: 'Trauma & Reconstruction',
    manufacturer: 'Smith & Nephew',
    systemName: 'EVOS Large Fragment Plating System',
    date: '2026-11-15',
    time: '02:30 PM',
    surgeon: 'Dr. Michael Thorne',
    status: 'Pending Review',
    priority: 'Emergency',
    readiness: 45,
    anesthesia: 'General Endotracheal',
    notes: 'Schatzker VI plateau fracture. Dual plating approach (medial + lateral buttress plates). Bone void filler needed.',
    measurements: {
      varusValgus: '12mm Joint Depressed Fragment',
      femoralSizeEst: 'Lateral Proximal Tibia Plate 7-hole',
      tibialSizeEst: 'Medial Buttress Plate 5-hole',
      polyThickness: 'N/A (Trauma)',
      jointLineOffset: '12mm depression'
    },
    scanInfo: {
      modality: 'Trauma Protocol Multi-detector CT Knee',
      scanDate: '2026-11-08',
      slicesCount: 890,
      thickness: '0.5 mm',
      status: 'Pending AI Sizing Review'
    }
  }
];

export const INITIAL_MANUALS = [
  {
    id: 'MAN-STR-01',
    title: 'Stryker Triathlon Total Knee System - Surgical Technique & Protocol',
    manufacturer: 'Stryker',
    docType: 'Surgical Technique',
    category: 'Orthopedic Knee',
    procedure: 'Total Knee Arthroplasty (TKA)',
    version: 'Rev 2026.3',
    pages: 48,
    fileSize: '8.4 MB',
    verified: true,
    releaseDate: '2026-03-15',
    summary: 'Comprehensive procedural guide detailing distal femoral resection, 4-in-1 cutting block alignment, tibial preparation, trial reduction, and cementation techniques.',
    tags: ['Triathlon', 'TKA', 'Femoral Resection', '4-in-1 Block', 'Tibial Tray'],
    sections: [
      'Preoperative Planning & Anatomical Axes',
      'Distal Femoral Resection (Intramedullary)',
      'Tibial Resection (Extramedullary vs Intramedullary)',
      'Femoral Sizing and Rotational Alignment',
      '4-in-1 Resection & Notch Cut',
      'Trial Reduction & Component Placement',
      'Patellar Preparation & Resurfacing'
    ]
  },
  {
    id: 'MAN-ZIM-02',
    title: 'Zimmer Biomet Persona The Personalized Knee System - Surgical Protocol',
    manufacturer: 'Zimmer Biomet',
    docType: 'Surgical Technique',
    category: 'Orthopedic Knee',
    procedure: 'Personalized Knee Replacement',
    version: 'Rev 2025.10',
    pages: 62,
    fileSize: '12.6 MB',
    verified: true,
    releaseDate: '2025-10-10',
    summary: 'Step-by-step guidance for anatomic tibial components, constrained posterior stabilized trials, and micro-metric gap balancing.',
    tags: ['Persona', 'Zimmer', 'Personalized Knee', 'Gap Balancing'],
    sections: [
      'Instrumentation Assembly & Inspection',
      'Femoral Preparation & Anterior Referencing',
      'Tibial Preparation & Posterior Slope Setup',
      'Extension & Flexion Gap Balancing',
      'Final Sizing Verification Matrix'
    ]
  },
  {
    id: 'MAN-DEP-03',
    title: 'DePuy Synthes ATTUNE Knee System - Instrumentation & Reprocessing Manual',
    manufacturer: 'DePuy Synthes',
    docType: 'Reprocessing Guide',
    category: 'Orthopedic Knee',
    procedure: 'Revision & Primary Knee',
    version: 'Rev 2026.1',
    pages: 34,
    fileSize: '6.8 MB',
    verified: true,
    releaseDate: '2026-01-20',
    summary: 'Sterilization parameters, autoclave cycle recommendations, ultrasonic bath protocols, and tray layout maps for ATTUNE sets.',
    tags: ['ATTUNE', 'DePuy', 'Sterilization', 'Autoclave', 'Tray Layout'],
    sections: [
      'Pre-cleaning & Enzymatic Detergent Bath',
      'Automated Washer-Disinfector Settings',
      'Steam Sterilization: Pre-Vacuum 132°C / 4 min',
      'Tray Organization & Inspection Checklist'
    ]
  },
  {
    id: 'MAN-MDT-04',
    title: 'Medtronic CD Horizon Solera Spinal System - Operative Technique & IFU',
    manufacturer: 'Medtronic',
    docType: 'Instructions For Use (IFU)',
    category: 'Spinal Instrumentation',
    procedure: 'Thoracolumbar & Lumbar Fusion',
    version: 'Rev 2025.11',
    pages: 70,
    fileSize: '15.2 MB',
    verified: true,
    releaseDate: '2025-11-05',
    summary: 'Thoracolumbar fixation manual detailing polyaxial screw insertion, rod templating, reduction jacks, and calibrated torque limiters (10.2 N·m).',
    tags: ['CD Horizon', 'Solera', 'Pedicle Screws', 'Torque Limiter', 'Spine'],
    sections: [
      'Anatomical Landmark Identification',
      'Awl-Tap-Probe Technique for Pedicle Screws',
      'Rod Contouring & Reduction Maneuvers',
      'Set Screw Final Tightening (Break-Off Head)',
      'Crosslink Application Protocols'
    ]
  },
  {
    id: 'MAN-SN-05',
    title: 'Smith & Nephew EVOS Small & Large Fragment Plating System - Technique',
    manufacturer: 'Smith & Nephew',
    docType: 'Surgical Technique',
    category: 'Trauma & Reconstruction',
    procedure: 'Tibial & Femoral Trauma Fixation',
    version: 'Rev 2025.9',
    pages: 52,
    fileSize: '9.8 MB',
    verified: true,
    releaseDate: '2025-09-18',
    summary: 'Variable-angle locking plating system guide for periarticular complex fractures, including plate contouring and screw trajectory limits.',
    tags: ['EVOS', 'Trauma', 'Tibial Plateau', 'Variable-Angle Screws'],
    sections: [
      'Surgical Approach & Soft Tissue Handling',
      'Temporary K-Wire Provisional Fixation',
      'Plate Placement & Screw Sequencing',
      'Variable-Angle Cone (±15° Off-Axis)'
    ]
  },
  {
    id: 'MAN-STR-06',
    title: 'Stryker Tornier Aequalis Ascend Flex Shoulder - Sizing & Reaming Guide',
    manufacturer: 'Stryker',
    docType: 'Sizing Guide',
    category: 'Upper Extremity',
    procedure: 'Shoulder Arthroplasty',
    version: 'Rev 2026.2',
    pages: 38,
    fileSize: '7.1 MB',
    verified: true,
    releaseDate: '2026-02-12',
    summary: 'Intramedullary reaming guide for stemless and converted convertible shoulder designs with glenoid vault centerline drilling.',
    tags: ['Tornier', 'Shoulder', 'Glenoid Vault', 'Humeral Reamer'],
    sections: [
      'Humeral Head Resection Angles',
      'Glenoid Exposure & Coracoid Retraction',
      'Vault Guide Positioning & Keel Slotting',
      'Component Cementation & Pressure Testing'
    ]
  }
];

export const INITIAL_INVENTORY = [
  {
    id: 'INV-1001',
    sku: 'STR-TRI-FEM-05R',
    name: 'Triathlon Femoral Component - Size 5 Right',
    category: 'Implants',
    manufacturer: 'Stryker',
    availableQty: 4,
    requiredQty: 2,
    threshold: 2,
    status: 'In Stock', // 'In Stock' | 'Low Stock' | 'Critical' | 'Reserved'
    location: 'OR Central Depot - Bin A-14',
    lotNumber: 'LOT-98214-E',
    expiryDate: '2029-06-30',
    unitCost: 2850
  },
  {
    id: 'INV-1002',
    sku: 'STR-TRI-TIB-04',
    name: 'Triathlon Universal Tibial Baseplate - Size 4',
    category: 'Implants',
    manufacturer: 'Stryker',
    availableQty: 3,
    requiredQty: 2,
    threshold: 2,
    status: 'In Stock',
    location: 'OR Central Depot - Bin A-16',
    lotNumber: 'LOT-94412-B',
    expiryDate: '2029-08-15',
    unitCost: 1980
  },
  {
    id: 'INV-1003',
    sku: 'STR-TRI-INS-11',
    name: 'Triathlon X3 Polyethylene Insert - 11mm (Size 4/5)',
    category: 'Implants',
    manufacturer: 'Stryker',
    availableQty: 1,
    requiredQty: 2,
    threshold: 3,
    status: 'Low Stock',
    location: 'OR Clean Core - Shelf 3',
    lotNumber: 'LOT-78119-A',
    expiryDate: '2028-11-20',
    unitCost: 1250
  },
  {
    id: 'INV-1004',
    sku: 'STR-TRI-INS-13',
    name: 'Triathlon X3 Polyethylene Insert - 13mm (Standby)',
    category: 'Implants',
    manufacturer: 'Stryker',
    availableQty: 2,
    requiredQty: 1,
    threshold: 2,
    status: 'In Stock',
    location: 'OR Clean Core - Shelf 3',
    lotNumber: 'LOT-78120-C',
    expiryDate: '2028-12-10',
    unitCost: 1250
  },
  {
    id: 'INV-1005',
    sku: 'INS-KNEE-TRAY-01',
    name: 'Triathlon Primary Femoral Prep Instrument Tray',
    category: 'Surgical Trays',
    manufacturer: 'Stryker',
    availableQty: 2,
    requiredQty: 1,
    threshold: 1,
    status: 'In Stock',
    location: 'Autoclave Room - Cart 4 (Sterile)',
    lotNumber: 'TRAY-F01-ST',
    expiryDate: '2026-11-25', // Sterility exp
    unitCost: 14500
  },
  {
    id: 'INV-1006',
    sku: 'INS-KNEE-TRAY-02',
    name: 'Triathlon Primary Tibial Alignment & Prep Tray',
    category: 'Surgical Trays',
    manufacturer: 'Stryker',
    availableQty: 2,
    requiredQty: 1,
    threshold: 1,
    status: 'In Stock',
    location: 'Autoclave Room - Cart 4 (Sterile)',
    lotNumber: 'TRAY-T02-ST',
    expiryDate: '2026-11-25',
    unitCost: 12800
  },
  {
    id: 'INV-1007',
    sku: 'INS-SAW-BLD-09',
    name: 'Sagittal Oscillating Saw Blades (90mm x 19mm x 1.19mm)',
    category: 'Disposables',
    manufacturer: 'Stryker',
    availableQty: 2,
    requiredQty: 4,
    threshold: 5,
    status: 'Critical',
    location: 'Sterile Supply Bin S-09',
    lotNumber: 'LOT-BLD-331',
    expiryDate: '2030-01-01',
    unitCost: 85
  },
  {
    id: 'INV-1008',
    sku: 'ZIM-PERS-ST12',
    name: 'Persona Femoral Stem Extension - 12mm x 75mm',
    category: 'Implants',
    manufacturer: 'Zimmer Biomet',
    availableQty: 1,
    requiredQty: 1,
    threshold: 2,
    status: 'Low Stock',
    location: 'OR Central Depot - Bin Z-04',
    lotNumber: 'LOT-ZIM-884',
    expiryDate: '2029-04-12',
    unitCost: 2150
  },
  {
    id: 'INV-1009',
    sku: 'MDT-SOL-SCW-6545',
    name: 'CD Horizon Solera Multi-Axial Pedicle Screws 6.5 x 45mm (Pack of 4)',
    category: 'Implants',
    manufacturer: 'Medtronic',
    availableQty: 6,
    requiredQty: 4,
    threshold: 4,
    status: 'In Stock',
    location: 'Spine Core Storage - Locker 2',
    lotNumber: 'LOT-MDT-552',
    expiryDate: '2030-09-15',
    unitCost: 3400
  },
  {
    id: 'INV-1010',
    sku: 'PWR-STR-SYS8',
    name: 'System 8 Cordless Handpiece & Battery Dual Set',
    category: 'Power Equipment',
    manufacturer: 'Stryker',
    availableQty: 3,
    requiredQty: 2,
    threshold: 2,
    status: 'In Stock',
    location: 'OR Equipment Room - Charging Dock B',
    lotNumber: 'SN-SYS8-9921',
    expiryDate: '2027-04-01',
    unitCost: 22000
  },
  {
    id: 'INV-1011',
    sku: 'CEM-SIM-GENT',
    name: 'Simplex P Bone Cement with Tobramycin (40g dose)',
    category: 'Disposables',
    manufacturer: 'Stryker',
    availableQty: 8,
    requiredQty: 2,
    threshold: 6,
    status: 'In Stock',
    location: 'Pharmacy Controlled Bin P-02',
    lotNumber: 'LOT-CEM-991',
    expiryDate: '2027-10-31',
    unitCost: 290
  },
  {
    id: 'INV-1012',
    sku: 'SN-EVOS-PLT-07',
    name: 'EVOS Variable Angle Proximal Tibia Plate (7-hole Lateral)',
    category: 'Implants',
    manufacturer: 'Smith & Nephew',
    availableQty: 1,
    requiredQty: 1,
    threshold: 2,
    status: 'Low Stock',
    location: 'Trauma Rapid Core - Bin TR-11',
    lotNumber: 'LOT-EVOS-419',
    expiryDate: '2029-02-28',
    unitCost: 2450
  }
];

export const INITIAL_INVENTORY_TRANSACTIONS = [
  {
    id: 'TX-1001',
    item_id: 'INV-1002',
    item_name: 'Triathlon Universal Tibial Baseplate - Size 4',
    previous_stock: 4,
    new_stock: 2,
    change_amount: -2,
    action_type: 'DEDUCTION',
    updated_by: 'Elena Rostova, RN',
    notes: 'Allocated to OR-4 procedure SR-2026-0841',
    timestamp: '2026-11-11T08:15:00Z'
  },
  {
    id: 'TX-1002',
    item_id: 'INV-1005',
    item_name: 'Sagittal Cut Blades 90mm',
    previous_stock: 3,
    new_stock: 0,
    change_amount: -3,
    action_type: 'DEDUCTION',
    updated_by: 'Marcus Vance, CST',
    notes: 'Used in trauma orthopedic emergency',
    timestamp: '2026-11-11T10:20:00Z'
  },
  {
    id: 'TX-1003',
    item_id: 'INV-1001',
    item_name: 'Triathlon Femoral Component - Size 5 Right',
    previous_stock: 2,
    new_stock: 4,
    change_amount: 2,
    action_type: 'RESTOCK',
    updated_by: 'Director Arthur Vance',
    notes: 'Supplier replenishment delivery Stryker PO-99120',
    timestamp: '2026-11-10T14:30:00Z'
  }
];

export const INITIAL_MANAGEMENT_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    hospital_name: 'St. Jude Medical Center',
    item_id: 'INV-1002',
    inventory_item_name: 'Triathlon Universal Tibial Baseplate - Size 4',
    current_stock: 2,
    minimum_stock_level: 2,
    manufacturer: 'Stryker',
    alert_type: 'LOW_STOCK',
    channel: 'IN_APP_AND_EMAIL',
    recipient_email: 'management@stjude-health.org',
    message: 'URGENT: Stock at minimum threshold (2/2 Units). Restock recommended.',
    timestamp: '2026-11-11T08:15:00Z',
    is_read: false
  },
  {
    id: 'NOTIF-002',
    hospital_name: 'St. Jude Medical Center',
    item_id: 'INV-1005',
    inventory_item_name: 'Sagittal Cut Blades 90mm',
    current_stock: 0,
    minimum_stock_level: 5,
    manufacturer: 'Stryker',
    alert_type: 'LOW_STOCK',
    channel: 'IN_APP_AND_EMAIL',
    recipient_email: 'management@stjude-health.org',
    message: 'CRITICAL: Item is completely OUT OF STOCK (0/5 Packs). Immediate order required.',
    timestamp: '2026-11-11T10:20:00Z',
    is_read: false
  }
];

export const INITIAL_CHECKLISTS = {
  'SR-2026-0841': {
    procedureId: 'SR-2026-0841',
    procedureName: 'Left Total Knee Arthroplasty (TKA)',
    patientName: 'Robert Miller (PT-88219)',
    surgeonName: 'Dr. Sarah Jenkins',
    orSuite: 'OR-4',
    signOff: {
      surgeonSigned: true,
      surgeonSignee: 'Dr. Sarah Jenkins, MD',
      surgeonSignedAt: '2026-11-10 09:14 AM',
      nurseSigned: true,
      nurseSignee: 'Elena Rostova, RN',
      nurseSignedAt: '2026-11-10 09:22 AM',
      reviewStatus: 'Clinically Verified & Cleared'
    },
    sections: [
      {
        id: 'sec-inst',
        title: 'Required Instruments',
        description: 'Verify all surgical cutting blocks, guides, and trial sets are assembled and sterilized.',
        items: [
          { id: 'ci-1', text: 'Triathlon Primary Femoral Prep Instrument Tray (Tray 1)', checked: true, critical: true, notes: 'Autoclave indicator verified strip enclosed' },
          { id: 'ci-2', text: 'Triathlon Primary Tibial Prep Instrument Tray (Tray 2)', checked: true, critical: true, notes: 'Extramedullary alignment rod calibrated' },
          { id: 'ci-3', text: 'Triathlon 4-in-1 Cutting Block (Size 5)', checked: true, critical: true, notes: 'Slit tolerances checked under magnifier' },
          { id: 'ci-4', text: 'Distal Femoral Resection Alignment Jig (5° & 7° Bushings)', checked: true, critical: false, notes: 'Defaulting to 6° valgus bushing' },
          { id: 'ci-5', text: 'Calibrated Torque Ratchet & Driver (10 N·m)', checked: true, critical: true, notes: 'Calibration current through Jan 2027' },
          { id: 'ci-6', text: 'High-speed Stryker System 8 Sagittal Saw & Spare Handpiece', checked: true, critical: true, notes: 'Charged battery packs x2 tested' }
        ]
      },
      {
        id: 'sec-impl',
        title: 'Implant Checklist',
        description: 'Verify primary recommended components and backup sizes are sterile and present in OR.',
        items: [
          { id: 'ci-7', text: 'Primary: Triathlon Femoral Component - Size 5 Right (Cemented)', checked: true, critical: true, notes: 'Box seal intact, LOT-98214-E verified' },
          { id: 'ci-8', text: 'Primary: Triathlon Universal Tibial Baseplate - Size 4', checked: true, critical: true, notes: 'Laser etched markings clean' },
          { id: 'ci-9', text: 'Primary: Triathlon X3 Polyethylene Insert - 11mm', checked: true, critical: true, notes: 'Double-barrier package verified' },
          { id: 'ci-10', text: 'Standby Backup: Triathlon Femoral Component - Size 6 Right', checked: true, critical: false, notes: 'Placed on standby cart in sub-sterile' },
          { id: 'ci-11', text: 'Standby Backup: Triathlon X3 Poly Insert - 9mm and 13mm', checked: false, critical: false, notes: 'Pending retrieval from Clean Core Shelf 3' },
          { id: 'ci-12', text: 'Simplex P Bone Cement with Tobramycin (2 packs 40g)', checked: true, critical: true, notes: 'Monitored temperature storage' }
        ]
      },
      {
        id: 'sec-ster',
        title: 'Sterilization Requirements',
        description: 'Confirmation of biological indicators, steam sterilization parameters, and wrap integrity.',
        items: [
          { id: 'ci-13', text: 'Class 5 Chemical Integrator inside each instrument tray', checked: true, critical: true, notes: 'Color transition to dark green confirmed' },
          { id: 'ci-14', text: '24-hour Biological Indicator (Geobacillus stearothermophilus) negative', checked: true, critical: true, notes: 'Incubation passed at 06:00 AM' },
          { id: 'ci-15', text: 'Sterile wrap visual check: no punctures, tears, or moisture condensation', checked: true, critical: true, notes: 'Inspected by E. Rostova, RN' },
          { id: 'ci-16', text: 'Pre-vacuum steam cycle verified: 132°C (270°F) for 4 minutes at 30 psi', checked: true, critical: true, notes: 'Tape printout archived to OR record' }
        ]
      },
      {
        id: 'sec-tray',
        title: 'Tool Tray Requirements',
        description: 'Arrangement and layout verification according to Stryker Triathlon manual specifications.',
        items: [
          { id: 'ci-17', text: 'Saw blades (90mm x 19mm x 1.19mm) loaded & sterile reserve available', checked: true, critical: true, notes: '2 sterile blades on Mayo stand' },
          { id: 'ci-18', text: 'Femoral sizer stylus and feeler gauge calibrated', checked: true, critical: false, notes: 'Zero point verified' },
          { id: 'ci-19', text: 'Pulsed lavage irrigation kit with femoral canal suction tip ready', checked: true, critical: true, notes: 'Saline bags primed with heparin/bacitracin per protocol' },
          { id: 'ci-20', text: 'Vacuum cement mixing bowl and pressurized injection gun loaded', checked: true, critical: true, notes: 'Gun trigger test passed' }
        ]
      },
      {
        id: 'sec-inv',
        title: 'Inventory & Barcode Verification',
        description: 'RFID scan verification and electronic health record reconciliation.',
        items: [
          { id: 'ci-21', text: 'RFID barcode scan matched between physical box & SurgReady record', checked: true, critical: true, notes: '3/3 primary components verified' },
          { id: 'ci-22', text: 'Expiration dates confirmed > 6 months remaining', checked: true, critical: true, notes: 'Earliest expiration 2028-11' },
          { id: 'ci-23', text: 'Electronic implant tracking log updated in Hospital EHR', checked: false, critical: false, notes: 'Will complete after final implantation' },
          { id: 'ci-24', text: 'Implant disposition form signed by Scrub Specialist', checked: false, critical: false, notes: 'Pending intraoperative confirmation' }
        ]
      }
    ]
  }
};

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-01',
    user: 'Dr. Sarah Jenkins',
    action: 'Approved AI Plan & Sizing',
    target: 'Procedure SR-2026-0841 (Robert Miller - TKA)',
    timestamp: '12 minutes ago',
    type: 'success',
    badge: 'AI Plan'
  },
  {
    id: 'act-02',
    user: 'Elena Rostova, RN',
    action: 'Verified Chemical Integrators & Sterilization',
    target: 'Triathlon Instrument Tray 1 & 2',
    timestamp: '35 minutes ago',
    type: 'info',
    badge: 'Checklist'
  },
  {
    id: 'act-03',
    user: 'Marcus Vance, CST',
    action: 'Logged Stock Alert',
    target: 'Sagittal Saw Blades (SKU: INS-SAW-BLD-09) low at 2 units',
    timestamp: '1 hour ago',
    type: 'warning',
    badge: 'Inventory'
  },
  {
    id: 'act-04',
    user: 'System AI Engine',
    action: 'Completed 3D Segmentation & Landmark Analysis',
    target: 'Patient Eleanor Vance (PT-90142 - Right Hip CT)',
    timestamp: '2 hours ago',
    type: 'info',
    badge: 'AI Engine'
  },
  {
    id: 'act-05',
    user: 'Dr. Marcus Vance',
    action: 'Signed off Post-Op Verification',
    target: 'Procedure SR-2026-0835 (David Ramirez - PLIF)',
    timestamp: 'Yesterday at 4:45 PM',
    type: 'success',
    badge: 'Completed'
  }
];

export const INITIAL_ANALYTICS = {
  monthlyPrepared: 248,
  pendingPrep: 7,
  inventoryAvailability: 96.4,
  generatedChecklists: 182,
  signOffRate: 98.2,
  avgPrepTimeMinutes: 18.4,
  zeroMissingRate: 100,
  weeklyVolume: [
    { day: 'Mon', completed: 12, scheduled: 14 },
    { day: 'Tue', completed: 15, scheduled: 16 },
    { day: 'Wed', completed: 18, scheduled: 19 },
    { day: 'Thu', completed: 14, scheduled: 15 },
    { day: 'Fri', completed: 16, scheduled: 17 },
    { day: 'Sat', completed: 6, scheduled: 6 },
    { day: 'Sun', completed: 3, scheduled: 3 }
  ],
  categoryBreakdown: [
    { name: 'Orthopedic Knee & Hip', percent: 46, count: 114, color: '#2563EB' },
    { name: 'Spinal Instrumentation', percent: 24, count: 60, color: '#163B72' },
    { name: 'Trauma & Reconstruction', percent: 18, count: 45, color: '#3B82F6' },
    { name: 'Shoulder & Extremities', percent: 12, count: 29, color: '#60A5FA' }
  ]
};

