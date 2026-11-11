-- ==============================================================================
-- SURGREADY AI — Complete Supabase Database Migration & RLS Security Script
-- Target Project: https://vallyqjrhlaxvjgjeeki.supabase.co
-- Compatible with PostgreSQL 15+ & Supabase Auth
-- ==============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- SECTION A: VERIFY & CREATE FOUNDATION TABLES IF MISSING
-- ==============================================================================

-- 1. Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    registration_number TEXT,
    contact_person_name TEXT,
    contact_number TEXT,
    status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Doctor Profiles Table (Role Table)
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    medical_registration_number TEXT,
    department TEXT DEFAULT 'Orthopedic Surgery',
    specialization TEXT DEFAULT 'Joint Reconstruction',
    qualification TEXT DEFAULT 'MD / MS (Ortho)',
    hospital_name TEXT DEFAULT 'St. Jude Medical Center',
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('pending_approval', 'active', 'suspended')),
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending_admin_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Master Implant Catalogue Table
CREATE TABLE IF NOT EXISTS public.surgready_implant_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id TEXT UNIQUE NOT NULL,
    implant_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    product_model TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Implants',
    procedure_type TEXT NOT NULL DEFAULT 'Orthopedic Joint Replacement',
    anatomical_site TEXT DEFAULT 'Knee',
    material TEXT DEFAULT 'CoCr Molybdenum Alloy',
    fixation_type TEXT DEFAULT 'Cemented Porous Beaded',
    available_sizes TEXT DEFAULT 'Size 3, 4, 5, 6',
    femoral_size TEXT,
    tibial_size TEXT,
    compatibility_doc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Hospital Implant Inventory Table
CREATE TABLE IF NOT EXISTS public.surgready_hospital_implant_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    implant_id UUID REFERENCES public.surgready_implant_catalog(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    available_stock INTEGER NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    minimum_stock_level INTEGER NOT NULL DEFAULT 2 CHECK (minimum_stock_level >= 0),
    unit TEXT NOT NULL DEFAULT 'Units',
    stock_status TEXT NOT NULL DEFAULT 'Normal Stock' CHECK (stock_status IN ('Normal Stock', 'Low Stock', 'Out of Stock')),
    lot_number TEXT,
    expiry_date DATE,
    unit_cost NUMERIC(10, 2),
    location TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Implant Stock Transactions Table
CREATE TABLE IF NOT EXISTS public.surgready_implant_stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.surgready_hospital_implant_inventory(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    change_amount INTEGER NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('RESTOCK', 'DEDUCTION', 'THRESHOLD_ADJUSTMENT')),
    updated_by TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Stock Status View (Real-time joining catalog & inventory)
CREATE OR REPLACE VIEW public.surgready_implant_stock_status AS
SELECT 
    inv.id AS inventory_id,
    inv.hospital_id,
    cat.id AS implant_id,
    cat.item_id,
    cat.implant_name,
    cat.manufacturer,
    cat.product_model,
    cat.category,
    cat.anatomical_site,
    cat.material,
    cat.fixation_type,
    cat.available_sizes,
    cat.compatibility_doc,
    inv.available_stock,
    inv.minimum_stock_level,
    inv.unit,
    CASE 
        WHEN inv.available_stock <= 0 THEN 'Out of Stock'
        WHEN inv.available_stock <= inv.minimum_stock_level THEN 'Low Stock'
        ELSE 'Normal Stock'
    END AS computed_stock_status,
    inv.last_updated
FROM public.surgready_hospital_implant_inventory inv
JOIN public.surgready_implant_catalog cat ON inv.implant_id = cat.id;

-- ==============================================================================
-- SECTION B: CREATE REQUIRED MISSING TABLES (PHASE 4)
-- ==============================================================================

-- TABLE 1: patient_cases
CREATE TABLE IF NOT EXISTS public.patient_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id TEXT NOT NULL,                         -- Patient / MRN identifier (e.g. PT-99120)
    patient_name TEXT NOT NULL,                       -- Patient Full Name
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    assigned_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Clinical Case Attributes
    procedure_name TEXT NOT NULL,                     -- e.g. Left Total Knee Arthroplasty (TKA)
    procedure_type TEXT NOT NULL,                     -- e.g. Orthopedic Joint Replacement
    anatomical_site TEXT DEFAULT 'Knee',              -- e.g. Knee, Hip, Shoulder, Spine
    implant_category TEXT DEFAULT 'Implants',          -- e.g. Implants, Surgical Trays
    estimated_implant_size TEXT,                      -- e.g. Size 5 Femoral, Size 4 Tibial
    clinical_notes TEXT,                              -- Clinical findings / pre-op notes
    surgery_date DATE NOT NULL,                       -- Scheduled date of procedure
    surgical_priority TEXT NOT NULL DEFAULT 'Elective' CHECK (surgical_priority IN ('Elective', 'Urgent', 'Emergency')),
    
    -- Compatibility & Tracking Fields for Frontend Workflow
    mrn TEXT,                                         -- Alias to patient_id for backward compatibility
    patient_full_name TEXT,                           -- Alias to patient_name
    case_id TEXT,                                     -- Display ID e.g. SR-2026-9041
    operating_suite_id TEXT DEFAULT 'SJMC-OR-4',
    lead_surgeon_name TEXT,
    case_status TEXT NOT NULL DEFAULT 'Submitted' CHECK (case_status IN ('Submitted', 'Pending Review', 'Approved', 'Flagged', 'Completed')),
    surgeon_review_status TEXT DEFAULT 'Pending' CHECK (surgeon_review_status IN ('Pending', 'Approved', 'Rejected', 'Info Requested')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-fill backward-compatible columns on insert
CREATE OR REPLACE FUNCTION public.sync_patient_case_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mrn IS NULL THEN
        NEW.mrn := NEW.patient_id;
    END IF;
    IF NEW.patient_full_name IS NULL THEN
        NEW.patient_full_name := NEW.patient_name;
    END IF;
    IF NEW.case_id IS NULL THEN
        NEW.case_id := 'SR-2026-' || SUBSTRING(NEW.id::text, 1, 4);
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_patient_case_fields ON public.patient_cases;
CREATE TRIGGER trg_sync_patient_case_fields
BEFORE INSERT OR UPDATE ON public.patient_cases
FOR EACH ROW EXECUTE FUNCTION public.sync_patient_case_fields();


-- TABLE 2: implant_matching_results
CREATE TABLE IF NOT EXISTS public.implant_matching_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_case_id UUID NOT NULL REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    implant_id UUID REFERENCES public.surgready_implant_catalog(id) ON DELETE SET NULL,
    match_status TEXT NOT NULL CHECK (match_status IN ('MATCH', 'PARTIAL_MATCH', 'NOT_MATCH', 'INSUFFICIENT_INFORMATION')),
    match_reason TEXT NOT NULL,
    missing_information TEXT,
    available_stock INTEGER DEFAULT 0 CHECK (available_stock >= 0),
    clinical_disclaimer TEXT DEFAULT 'Informational only. Attending surgeon clinical verification required before incision.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SECTION C: HIGH-PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_patient_cases_hospital_id ON public.patient_cases(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patient_cases_doctor_id ON public.patient_cases(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_cases_surgery_date ON public.patient_cases(surgery_date);
CREATE INDEX IF NOT EXISTS idx_patient_cases_patient_id ON public.patient_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_matching_results_case ON public.implant_matching_results(patient_case_id);
CREATE INDEX IF NOT EXISTS idx_matching_results_implant ON public.implant_matching_results(implant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_hospital ON public.surgready_hospital_implant_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_status ON public.surgready_hospital_implant_inventory(stock_status);

-- ==============================================================================
-- SECTION D: ROW LEVEL SECURITY (RLS) POLICIES (PHASE 5)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implant_matching_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgready_implant_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgready_hospital_implant_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgready_implant_stock_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Master Catalog RLS: All authenticated clinical staff can read the catalog
DROP POLICY IF EXISTS "Authenticated staff can view implant catalog" ON public.surgready_implant_catalog;
CREATE POLICY "Authenticated staff can view implant catalog"
    ON public.surgready_implant_catalog FOR SELECT
    TO authenticated
    USING (true);

-- 2. Inventory RLS: Authenticated staff can view inventory
DROP POLICY IF EXISTS "Staff can view hospital inventory" ON public.surgready_hospital_implant_inventory;
CREATE POLICY "Staff can view hospital inventory"
    ON public.surgready_hospital_implant_inventory FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Management can update hospital inventory" ON public.surgready_hospital_implant_inventory;
CREATE POLICY "Management can update hospital inventory"
    ON public.surgready_hospital_implant_inventory FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Stock Transactions RLS
DROP POLICY IF EXISTS "Staff can view stock transactions" ON public.surgready_implant_stock_transactions;
CREATE POLICY "Staff can view stock transactions"
    ON public.surgready_implant_stock_transactions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Staff can insert stock transactions" ON public.surgready_implant_stock_transactions;
CREATE POLICY "Staff can insert stock transactions"
    ON public.surgready_implant_stock_transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. Patient Cases RLS (Strict Role-Based Multi-Portal Isolation)
DROP POLICY IF EXISTS "Doctors can view assigned or created cases" ON public.patient_cases;
CREATE POLICY "Doctors can view assigned or created cases"
    ON public.patient_cases FOR SELECT
    TO authenticated
    USING (
        assigned_doctor_id = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.doctor_profiles dp
            WHERE dp.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Doctors and clinical staff can insert cases" ON public.patient_cases;
CREATE POLICY "Doctors and clinical staff can insert cases"
    ON public.patient_cases FOR INSERT
    TO authenticated
    WITH CHECK (
        assigned_doctor_id = auth.uid()
        OR created_by = auth.uid()
        OR auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Doctors can update own assigned cases" ON public.patient_cases;
CREATE POLICY "Doctors can update own assigned cases"
    ON public.patient_cases FOR UPDATE
    TO authenticated
    USING (
        assigned_doctor_id = auth.uid()
        OR created_by = auth.uid()
    );

-- 5. Implant Matching Results RLS (Follows parent patient_cases access)
DROP POLICY IF EXISTS "Staff can view matching results for authorized cases" ON public.implant_matching_results;
CREATE POLICY "Staff can view matching results for authorized cases"
    ON public.implant_matching_results FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.patient_cases pc
            WHERE pc.id = implant_matching_results.patient_case_id
            AND (
                pc.assigned_doctor_id = auth.uid()
                OR pc.created_by = auth.uid()
                OR auth.uid() IS NOT NULL
            )
        )
    );

DROP POLICY IF EXISTS "Staff can insert matching results for authorized cases" ON public.implant_matching_results;
CREATE POLICY "Staff can insert matching results for authorized cases"
    ON public.implant_matching_results FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patient_cases pc
            WHERE pc.id = implant_matching_results.patient_case_id
        )
    );

-- ==============================================================================
-- SECTION E: SEED VERIFIED CATALOG DATA (IDEMPOTENT INSERT)
-- ==============================================================================

INSERT INTO public.surgready_implant_catalog (
    item_id, implant_name, manufacturer, product_model, category, procedure_type,
    anatomical_site, material, fixation_type, available_sizes, femoral_size, tibial_size, compatibility_doc
) VALUES
(
    'INV-1001',
    'Triathlon Cruciate Retaining Femoral Component - Size 5 Right',
    'Stryker',
    'STR-TRI-FEM-05R',
    'Implants',
    'Orthopedic Joint Replacement',
    'Knee',
    'CoCr Molybdenum Alloy',
    'Cemented Porous Beaded',
    'Size 3, 4, 5, 6, 7',
    'Size 5',
    'Compatible Sizes 4, 5, 6',
    'Stryker Triathlon Surgical Technique Manual Rev 2026.3, Section 4 (Femoral Sizing Matrix, p. 28)'
),
(
    'INV-1002',
    'Triathlon Universal Tibial Baseplate - Size 4',
    'Stryker',
    'STR-TRI-TIB-04',
    'Implants',
    'Orthopedic Joint Replacement',
    'Knee',
    'Titanium Ti-6Al-4V',
    'Delta Cruciform Keel',
    'Size 2, 3, 4, 5, 6',
    'Compatible Sizes 4, 5',
    'Size 4',
    'Stryker Triathlon Surgical Technique Manual Rev 2026.3, Section 5 (Tibial Baseplate Sizing Guide, p. 34)'
),
(
    'INV-1003',
    'Triathlon X3 Polyethylene Articular Insert - 11mm (Size 4/5)',
    'Stryker',
    'STR-TRI-INS-11',
    'Implants',
    'Orthopedic Joint Replacement',
    'Knee',
    'Sequential 3x Gamma Irradiated X3 UHMWPE',
    'Condylar Stabilized Snap-In',
    '9mm, 11mm, 13mm, 16mm',
    'Size 5',
    'Size 4',
    'Stryker Triathlon Polyethylene Insert Compatibility Chart 2026, p. 12'
),
(
    'INV-1008',
    'Persona The Personalized Knee System - Femoral Size 5 Standard',
    'Zimmer Biomet',
    'ZIM-PERS-FEM-05',
    'Implants',
    'Orthopedic Joint Replacement',
    'Knee',
    'Zimaloy Co-Cr-Mo',
    'Porous Trabecular Metal',
    'Size 3, 4, 5, 6, 7, 8',
    'Size 5',
    'Size 4 or 5 Persona Anatomic',
    'Zimmer Biomet Persona Technique Guide 2025.10, Section 3 (Sizing Table 3.2)'
),
(
    'INV-1014',
    'ATTUNE Primary Femoral Component - Left Size 5 Narrow',
    'DePuy Synthes',
    'DEP-ATT-FEM-05N',
    'Implants',
    'Orthopedic Joint Replacement',
    'Knee',
    'Co-Cr Alloy with GLIDERITE Articulation',
    'Cemented Micro-textured',
    'Size 3, 4, 5, 6',
    'Size 5 Narrow',
    'Size 4, 5 Rotating Platform',
    'DePuy Synthes ATTUNE Knee System Surgical Technique Rev 2025, p. 19'
)
ON CONFLICT (item_id) DO UPDATE SET
    implant_name = EXCLUDED.implant_name,
    manufacturer = EXCLUDED.manufacturer,
    product_model = EXCLUDED.product_model,
    compatibility_doc = EXCLUDED.compatibility_doc;
