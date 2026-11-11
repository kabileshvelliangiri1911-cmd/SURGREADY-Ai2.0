"""
Clinical sample/demo data used by the modular analysis engine for initial testing.
Reflects realistic orthopedic & spinal surgical preparation standards.
"""

SAMPLE_ANALYSIS_DATABASE = {
    "SAMPLE-STRYKER-TKA": {
        "procedure_name": "Total Knee Arthroplasty (TKA)",
        "procedure_code": "CPT 27447",
        "manufacturer": "Stryker",
        "system_name": "Triathlon Knee System",
        "clinical_summary": "Extracted technique guidelines for tricompartmental knee arthroplasty with moderate varus deformity.",
        "anatomical_measurements": {
            "varus_valgus_alignment": "6.5° Varus",
            "recommended_bushing": "6° Valgus Bushing",
            "distal_femoral_resection_mm": 9.0,
            "proximal_tibial_slope": "3° Posterior Slope"
        },
        "implant_recommendations": [
            {
                "component": "Femoral Component",
                "recommended_size": "Size 5 (Right)",
                "sku": "STR-TRI-FEM-05R",
                "bone_coverage": "98.4%",
                "status": "Optimal Fit"
            },
            {
                "component": "Universal Tibial Baseplate",
                "recommended_size": "Size 4",
                "sku": "STR-TRI-TIB-04",
                "bone_coverage": "97.8%",
                "status": "Optimal Fit"
            },
            {
                "component": "X3 Polyethylene Insert",
                "recommended_size": "11 mm",
                "sku": "STR-TRI-INS-11",
                "stability": "Balanced Extension & Flexion Gap",
                "status": "Optimal Fit"
            }
        ],
        "standby_backup_sizes": [
            {"component": "Femoral Component", "size": "Size 6 (Right)", "sku": "STR-TRI-FEM-06R"},
            {"component": "Poly Insert", "size": "13 mm", "sku": "STR-TRI-INS-13"}
        ],
        "instrument_requirements": [
            {"tray_name": "Triathlon Primary Femoral Prep Tray (Tray 1)", "sterility": "Autoclave Passed"},
            {"tray_name": "Triathlon Primary Tibial Prep Tray (Tray 2)", "sterility": "Autoclave Passed"},
            {"instrument": "4-in-1 Resection Cutting Block Size 5", "sterility": "Enclosed in Tray 1"},
            {"instrument": "Sagittal Oscillating Saw & Blades (1.19mm)", "sterility": "Sterile Reserve Available"}
        ],
        "manual_citations": [
            {
                "source": "Stryker Triathlon Total Knee Surgical Technique Protocol (Rev 2026.3)",
                "section": "Section 4.2: Distal Femoral Resection (Page 18)",
                "excerpt": "For a 6.5° varus deformity, set the intramedullary distal resection guide bushing to 6° valgus to align mechanical axis."
            },
            {
                "source": "Stryker Reprocessing Guidelines",
                "section": "Steam Sterilization Cycle (Page 34)",
                "excerpt": "Pre-vacuum steam: 132°C (270°F) for 4 minutes at 30 psi. Minimum dry time: 30 minutes."
            }
        ],
        "precautions": [
            "Ensure cutting block is pinned flush against distal condylar bone before initiating resection.",
            "Confirm oscillating saw blade thickness (1.19 mm) to avoid unintended bone loss."
        ],
        "confidence_score": 0.984
    },
    "SAMPLE-ZIMMER-HIP": {
        "procedure_name": "Total Hip Arthroplasty (THA)",
        "procedure_code": "CPT 27130",
        "manufacturer": "Zimmer Biomet",
        "system_name": "Persona / G7 Acetabular System",
        "clinical_summary": "Extracted anterior approach surgical technique for avascular necrosis.",
        "anatomical_measurements": {
            "cup_inclination_angle": "40° - 45°",
            "anteversion_angle": "15° - 20°",
            "leg_length_discrepancy": "+3.0 mm"
        },
        "implant_recommendations": [
            {
                "component": "Femoral Stem",
                "recommended_size": "Stem Size 12 High Offset",
                "sku": "ZIM-PERS-ST12",
                "status": "Optimal Fit"
            },
            {
                "component": "G7 Acetabular Cup",
                "recommended_size": "52 mm Porous Coating",
                "sku": "ZIM-G7-CUP-52",
                "status": "Optimal Fit"
            }
        ],
        "standby_backup_sizes": [
            {"component": "Femoral Stem", "size": "Stem Size 11 Standard", "sku": "ZIM-PERS-ST11"}
        ],
        "instrument_requirements": [
            {"tray_name": "G7 Acetabular Reamer Set", "sterility": "Autoclave Passed"},
            {"instrument": "Femoral Canal Broach Set (Sizes 9-14)", "sterility": "Ready"}
        ],
        "manual_citations": [
            {
                "source": "Zimmer Biomet Persona / G7 Surgical Protocol (Rev 2025.10)",
                "section": "Section 3.1: Acetabular Preparation",
                "excerpt": "Ream sequentially in 1mm increments until uniform bleeding subchondral bone is achieved."
            }
        ],
        "precautions": [
            "Verify press-fit stability prior to seated liner insertion.",
            "Assess trial reduction range of motion to ensure no posterior impingement."
        ],
        "confidence_score": 0.976
    }
}

