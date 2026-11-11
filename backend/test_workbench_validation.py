import httpx
import json

endpoint = 'http://127.0.0.1:8000/api/v1/events/verify-auth'

def run_test(name, payload, expect_verified=False, expect_code=200):
    try:
        res = httpx.post(endpoint, json=payload, timeout=16.0)
        data = res.json()
        verified = data.get("verified")
        code = data.get("http_status_code")
        msg = data.get("message")
        
        passed = (verified == expect_verified and code == expect_code)
        status_icon = "PASS" if passed else "FAIL"

        print(f"[{status_icon}] {name}")
        print(f"       Expected: verified={expect_verified}, code={expect_code}")
        print(f"       Received: verified={verified}, code={code}")
        print(f"       Message:  {msg}")
        return passed
    except Exception as e:
        print(f"[FAIL] {name} -> Error: {e}")
        return False

base_doctor = {
    'event_type': 'SIGN_IN',
    'email': 'doctor.sarah@stjude-health.org',
    'role': 'doctor',
    'user_id': 'usr_doc_001',
    'full_name': 'Dr. Sarah Jenkins',
    'provider': 'email',
    'registration_status': 'active',
    'approval_status': 'approved',
    'timestamp': '2026-11-11T12:00:00Z'
}

print("===================================================================")
print("SURGREADY AI — SECTION 10 COMPREHENSIVE TEST SUITE")
print("===================================================================\n")

results = []

# 1. Live Webhook Call (Currently returns 404 because webhook workflow is inactive in Workbench)
results.append(run_test(
    "1. Live Webhook Real Call (Active/Inactive Check)",
    base_doctor,
    expect_verified=False, # Because remote webhook returns 404
    expect_code=404
))

# 2. Simulated HTTP 200 Success
p200 = dict(base_doctor, simulate_status=200)
results.append(run_test(
    "2. Workbench Returns HTTP 200 (Success)",
    p200,
    expect_verified=True,
    expect_code=200
))

# 3. Simulated HTTP 400 Bad Request
p400 = dict(base_doctor, simulate_status=400)
results.append(run_test(
    "3. Workbench Returns HTTP 400 (Bad Request)",
    p400,
    expect_verified=False,
    expect_code=400
))

# 4. Simulated HTTP 401 Unauthorized
p401 = dict(base_doctor, simulate_status=401)
results.append(run_test(
    "4. Workbench Returns HTTP 401 (Unauthorized)",
    p401,
    expect_verified=False,
    expect_code=401
))

# 5. Simulated HTTP 403 Forbidden
p403 = dict(base_doctor, simulate_status=403)
results.append(run_test(
    "5. Workbench Returns HTTP 403 (Forbidden)",
    p403,
    expect_verified=False,
    expect_code=403
))

# 6. Simulated HTTP 500 Server Error
p500 = dict(base_doctor, simulate_status=500)
results.append(run_test(
    "6. Workbench Returns HTTP 500 (Internal Server Error)",
    p500,
    expect_verified=False,
    expect_code=500
))

# 7. Simulated HTTP 504 Timeout
p504 = dict(base_doctor, simulate_status=504)
results.append(run_test(
    "7. Workbench Times Out (HTTP 504 Gateway Timeout)",
    p504,
    expect_verified=False,
    expect_code=504
))

# 8. Simulated HTTP 502 Unreachable Network
p502 = dict(base_doctor, simulate_status=502)
results.append(run_test(
    "8. Workbench Unreachable Network (HTTP 502 Bad Gateway)",
    p502,
    expect_verified=False,
    expect_code=502
))

# 9. Simulated HTTP 200 with Explicit JSON Access Denial
pDeny = dict(base_doctor, simulate_denial=True)
results.append(run_test(
    "9. Workbench HTTP 200 with Explicit Denial (decision: DENIED)",
    pDeny,
    expect_verified=False,
    expect_code=200
))

# 10. Role Verification across all 4 roles
for r in ['doctor', 'management', 'nurse', 'patient']:
    r_pay = dict(base_doctor, role=r, email=f"{r}.staff@stjude-health.org", simulate_status=200)
    results.append(run_test(
        f"10. Role Verification: {r.upper()} (HTTP 200)",
        r_pay,
        expect_verified=True,
        expect_code=200
    ))

print("\n-------------------------------------------------------------------")
total = len(results)
passed = sum(1 for x in results if x)
print(f"Summary: {passed}/{total} Tests Passed ({round(passed/total*100, 1)}%)")
print("-------------------------------------------------------------------")

