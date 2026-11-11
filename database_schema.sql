-- ==============================================================================
-- SURGREADY AI — Complete Enterprise Healthcare Schema & RLS Policies
-- Compatible with Supabase PostgreSQL (Postgres 15+)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    registration_number TEXT NOT NULL,
    contact_person_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Profiles Table (Department-Specific Profiles & Admin Approval System)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'management', 'nurse', 'patient')),
    role_title TEXT,
    department TEXT,
    designation TEXT,
    hospital_name TEXT DEFAULT 'St. Jude Medical Center',
    
    -- Department Specific Credential Fields
    employee_id TEXT,
    medical_registration_number TEXT,
    nursing_registration_number TEXT,
    specialization TEXT,
    qualification TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    mrn TEXT,
    
    -- Status & Approval Management
    account_status TEXT DEFAULT 'pending_approval' CHECK (account_status IN ('pending_approval', 'active', 'suspended')),
    approval_status TEXT DEFAULT 'pending_admin_approval' CHECK (approval_status IN ('pending_admin_approval', 'approved', 'rejected')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    avatar_url TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3a. Doctor Profiles Table (Role-Specific Table)
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    medical_registration_number TEXT NOT NULL,
    department TEXT NOT NULL,
    specialization TEXT,
    qualification TEXT,
    hospital_name TEXT DEFAULT 'St. Jude Medical Center',
    account_status TEXT DEFAULT 'pending_approval' CHECK (account_status IN ('pending_approval', 'active', 'suspended')),
    approval_status TEXT DEFAULT 'pending_admin_approval' CHECK (approval_status IN ('pending_admin_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. Nurse Profiles Table (Role-Specific Table)
CREATE TABLE IF NOT EXISTS public.nurse_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    nursing_registration_number TEXT NOT NULL,
    department TEXT NOT NULL,
    hospital_name TEXT DEFAULT 'St. Jude Medical Center',
    account_status TEXT DEFAULT 'pending_approval' CHECK (account_status IN ('pending_approval', 'active', 'suspended')),
    approval_status TEXT DEFAULT 'pending_admin_approval' CHECK (approval_status IN ('pending_admin_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3c. Management Profiles Table (Role-Specific Table)
CREATE TABLE IF NOT EXISTS public.management_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    employee_id TEXT NOT NULL,
    hospital_registration_number TEXT,
    department TEXT NOT NULL,
    designation TEXT,
    hospital_name TEXT DEFAULT 'St. Jude Medical Center',
    account_status TEXT DEFAULT 'pending_approval' CHECK (account_status IN ('pending_approval', 'active', 'suspended')),
    approval_status TEXT DEFAULT 'pending_admin_approval' CHECK (approval_status IN ('pending_admin_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3d. Patient Profiles Table (Role-Specific Table)
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    mrn TEXT UNIQUE NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    hospital_name TEXT DEFAULT 'St. Jude Medical Center',
    account_status TEXT DEFAULT 'active' CHECK (account_status IN ('pending_approval', 'active', 'suspended')),
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending_admin_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory Table (10 Enterprise Attributes)
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id TEXT UNIQUE NOT NULL,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Implants', 'Surgical Trays', 'Disposables', 'Power Equipment')),
    manufacturer TEXT NOT NULL,
    product_model TEXT NOT NULL,
    system_line_name TEXT,
    femoral_size TEXT,
    tibial_size TEXT,
    available_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock_level INTEGER NOT NULL DEFAULT 2,
    unit TEXT NOT NULL DEFAULT 'Units',
    stock_status TEXT NOT NULL CHECK (stock_status IN ('Normal Stock', 'Low Stock', 'Out of Stock')),
    alert_active BOOLEAN DEFAULT FALSE,
    location TEXT,
    lot_number TEXT,
    expiry_date DATE,
    unit_cost NUMERIC(10, 2),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Patient Cases Table (Complete 3-Section Case Registration)
CREATE TABLE IF NOT EXISTS public.patient_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id TEXT UNIQUE NOT NULL,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    
    -- Section A: Patient Information
    mrn TEXT NOT NULL,
    operating_suite_id TEXT NOT NULL,
    patient_full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    lead_surgeon_id TEXT NOT NULL,
    lead_surgeon_name TEXT NOT NULL,
    scheduled_surgery_date DATE NOT NULL,
    scheduled_or_time TEXT NOT NULL,
    
    -- Section B: Procedure Details
    procedure_name TEXT NOT NULL,
    procedure_code TEXT NOT NULL,
    procedure_type TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    system_line_name TEXT NOT NULL,
    surgical_priority TEXT NOT NULL CHECK (surgical_priority IN ('Elective', 'Urgent', 'Emergency')),
    
    -- Section C: Anatomical Information & Clinical Notes
    anatomical_alignment TEXT,
    estimated_femoral_size TEXT,
    estimated_tibial_size TEXT,
    clinical_information TEXT,
    
    -- Status & Audit
    case_status TEXT NOT NULL DEFAULT 'Submitted' CHECK (case_status IN ('Submitted', 'Pending Review', 'Approved', 'Flagged', 'Completed')),
    surgeon_review_status TEXT DEFAULT 'Pending' CHECK (surgeon_review_status IN ('Pending', 'Approved', 'Rejected', 'Info Requested')),
    surgeon_comments TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Patient Scan Files Table (Secure Private Storage Metadata)
CREATE TABLE IF NOT EXISTS public.patient_scan_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_case_id UUID REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('DICOM', 'CT', 'MRI', '3D_STL', 'DOC', 'IMAGE')),
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processing_status TEXT DEFAULT 'Uploaded' CHECK (processing_status IN ('Uploaded', 'Processing', 'Ready', 'Failed'))
);

-- 7. Implant Candidates Table (Candidate Comparison Matrix)
CREATE TABLE IF NOT EXISTS public.implant_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_case_id UUID REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL,
    implant_id TEXT REFERENCES public.inventory(item_id) ON DELETE SET NULL,
    implant_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    system_line_name TEXT NOT NULL,
    product_model TEXT NOT NULL,
    femoral_size TEXT,
    tibial_size TEXT,
    available_stock INTEGER DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 2,
    stock_status TEXT DEFAULT 'Normal Stock',
    comparison_status TEXT NOT NULL CHECK (comparison_status IN (
        'Exact Match',
        'Partial Match',
        'Mismatch',
        'Insufficient Information'
    )),
    matched_attributes JSONB DEFAULT '[]'::jsonb,
    unmatched_attributes JSONB DEFAULT '[]'::jsonb,
    missing_information JSONB DEFAULT '[]'::jsonb,
    evidence_reference TEXT,
    clinical_disclaimer TEXT DEFAULT 'Informational only. Attending surgeon clinical verification required before incision.',
    reviewed_by TEXT,
    review_status TEXT DEFAULT 'Pending' CHECK (review_status IN ('Pending', 'Approved', 'Rejected', 'Requested Info')),
    review_comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Hospital Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    recipient_user_id TEXT,
    recipient_role TEXT CHECK (recipient_role IN ('doctor', 'management', 'nurse', 'patient', 'all')),
    patient_case_id UUID REFERENCES public.patient_cases(id) ON DELETE CASCADE,
    case_id TEXT,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'SURGEON_REVIEW_REQUIRED',
        'SURGEON_REVIEW_COMPLETED',
        'INVENTORY_LOW_STOCK',
        'INVENTORY_OUT_OF_STOCK',
        'INVENTORY_STOCK_RESTORED',
        'PATIENT_CASE_CREATED'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Critical')),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Inventory Audit Transactions Table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Indexes for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_patient_cases_hospital ON public.patient_cases(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patient_cases_case_id ON public.patient_cases(case_id);
CREATE INDEX IF NOT EXISTS idx_patient_cases_surgeon ON public.patient_cases(lead_surgeon_name);
CREATE INDEX IF NOT EXISTS idx_implant_candidates_case ON public.implant_candidates(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_role, is_read);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(stock_status);

-- Row Level Security (RLS) Setup
ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_scan_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implant_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Default permissive read policies for authenticated hospital staff (can be tuned per institutional tenancy)
CREATE POLICY "Allow authenticated staff to read hospital patient cases" 
    ON public.patient_cases FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to insert patient cases" 
    ON public.patient_cases FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to update patient cases" 
    ON public.patient_cases FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to read inventory" 
    ON public.inventory FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to update inventory" 
    ON public.inventory FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to read candidates" 
    ON public.implant_candidates FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to update candidate review" 
    ON public.implant_candidates FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to read notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.role() = 'authenticated');

-- RLS for Role-Specific Profile Tables
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Doctor Profiles RLS: Doctors can only view and update their own profile; others cannot view private doctor details
CREATE POLICY "Doctors can view own profile"
    ON public.doctor_profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Doctors can update own profile"
    ON public.doctor_profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Doctors can insert own profile"
    ON public.doctor_profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- Nurse Profiles RLS: Nurses can only view and update their own profile
CREATE POLICY "Nurses can view own profile"
    ON public.nurse_profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Nurses can update own profile"
    ON public.nurse_profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Nurses can insert own profile"
    ON public.nurse_profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- Management Profiles RLS: Management users can view their own profile; administrative backend enforces management checks
CREATE POLICY "Management can view own profile"
    ON public.management_profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Management can update own profile"
    ON public.management_profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Management can insert own profile"
    ON public.management_profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

-- Patient Profiles RLS: Patients can access only their own permitted records
CREATE POLICY "Patients can view own profile"
    ON public.patient_profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Patients can update own profile"
    ON public.patient_profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Patients can insert own profile"
    ON public.patient_profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);


