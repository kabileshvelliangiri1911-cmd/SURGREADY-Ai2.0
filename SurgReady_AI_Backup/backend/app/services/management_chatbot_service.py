import logging
import os
import re
from typing import Dict, Any, List
from datetime import datetime
from app.services.patient_case_service import patient_case_service
from app.services.inventory_alert_service import inventory_alert_service
from app.services.implant_comparison_service import AUTHORIZED_IMPLANT_CATALOG

logger = logging.getLogger("surgready.management_chatbot")

MANAGEMENT_SYSTEM_PROMPT = """
You are SURGREADY Management Assistant, an AI-powered hospital inventory and operations information assistant.

Your role is to help authorized hospital management users understand patient case workflow status, implant inventory, stock alerts, scheduled cases and surgeon review progress.

You must use only information retrieved from authorized hospital database records.

Rules:
1. Never invent patient information, implant specifications, stock quantities or surgery schedules.
2. If information is unavailable, clearly say that it is unavailable.
3. Respect hospital-level data isolation.
4. Never expose records belonging to another hospital.
5. Do not expose passwords, authentication tokens, private credentials or unnecessary patient information.
6. Do not diagnose patients or prescribe medical treatment.
7. Do not independently decide whether an implant is clinically suitable.
8. Implant comparisons are informational and must be verified by a qualified surgeon.
9. Provide clear explanations for low-stock and out-of-stock alerts.
10. Use simple, professional language.
11. When asked for inventory summaries, provide actual quantities and database-derived results.
12. For every answer, distinguish verified database information from missing or uncertain information.
13. Do not update inventory, approve implant candidates, delete cases or perform other consequential actions without explicit authorization and confirmation.
14. If a user does not have Management permissions, deny access.
"""

class ManagementChatbotService:
    """
    Hospital Management AI Assistant
    Strictly verifies management role authorization and answers inquiries using
    actual, live database records.
    """

    def process_message(self, message: str, user_role: str, user_name: str, hospital_id: str = "HOSP-STJUDE-01") -> Dict[str, Any]:
        # Rule 14 Check: Verify Management Role Permission
        if (user_role or "").strip().lower() != "management":
            logger.warning(f"[Management Chatbot] Unauthorized access attempt by user role: '{user_role}'")
            return {
                "reply": "Access Denied: The SURGREADY Management Assistant is strictly restricted to authorized Hospital Management personnel. Your verified database role does not have administrative management privileges.",
                "sources_consulted": ["Role Authorization Gate"],
                "data_points": {"authorized": False, "required_role": "management", "user_role": user_role},
                "timestamp": datetime.utcnow().isoformat()
            }

        q = message.lower()
        cases = patient_case_service.get_all_cases(hospital_id=hospital_id)
        notifications = patient_case_service.get_notifications(role="management")
        inventory_items = inventory_alert_service.get_all_items()

        # Gather real live metrics
        total_cases = len(cases)
        pending_review_cases = [c for c in cases if c.get("surgeon_review_status") == "Pending"]
        approved_cases = [c for c in cases if c.get("surgeon_review_status") == "Approved"]
        flagged_cases = [c for c in cases if c.get("surgeon_review_status") == "Rejected"]

        low_stock_items = [i for i in inventory_items if i.get("stock_status") == "Low Stock"]
        out_of_stock_items = [i for i in inventory_items if i.get("stock_status") == "Out of Stock"]
        normal_items = [i for i in inventory_items if i.get("stock_status") == "Normal Stock"]

        sources = [f"Hospital Database: {hospital_id}", "Live Inventory Ledger", "Patient Cases Registry"]
        data_points = {
            "total_cases": total_cases,
            "pending_surgeon_reviews": len(pending_review_cases),
            "low_stock_count": len(low_stock_items),
            "out_of_stock_count": len(out_of_stock_items)
        }

        # Intent Matching based on prompt requirements

        # 1. Scheduled Cases / Cases this week
        if any(w in q for w in ["scheduled", "cases this week", "patient cases", "upcoming"]):
            case_lines = []
            for c in cases[:5]:
                case_lines.append(
                    f"• **{c['case_id']}** ({c['procedure_name']}): Patient {c['patient_full_name']} | Scheduled: **{c['scheduled_surgery_date']} at {c['scheduled_or_time']}** | Suite: {c['operating_suite_id']} | Lead Surgeon: {c['lead_surgeon_name']} | Review: `{c['surgeon_review_status']}`"
                )
            reply = (
                f"**Hospital Surgery Case Schedule Summary ({hospital_id}):**\n\n"
                f"There are currently **{total_cases} total registered surgical cases** in the hospital system.\n\n"
                + "\n".join(case_lines) +
                f"\n\n**Review Status:** {len(pending_review_cases)} cases awaiting surgeon review, {len(approved_cases)} clinically approved."
            )
            return {"reply": reply, "sources_consulted": sources, "data_points": data_points, "timestamp": datetime.utcnow().isoformat()}

        # 2. Pending Surgeon Reviews
        if any(w in q for w in ["pending", "surgeon review", "waiting for surgeon", "review progress"]):
            if not pending_review_cases:
                reply = "All scheduled surgical cases have completed attending surgeon clinical review. There are currently **0 pending reviews**."
            else:
                lines = [
                    f"• **{c['case_id']}**: {c['procedure_name']} for {c['patient_full_name']} (MRN: {c['mrn']}) | Lead Surgeon: **{c['lead_surgeon_name']}** | Surgery Date: {c['scheduled_surgery_date']}"
                    for c in pending_review_cases
                ]
                reply = (
                    f"**Cases Requiring Surgeon Clinical Review ({len(pending_review_cases)} Pending):**\n\n"
                    + "\n".join(lines) +
                    "\n\n*Note: AI implant candidate comparisons have been staged and notifications dispatched to the assigned surgeons. Final clinical clearance is pending.*"
                )
            return {"reply": reply, "sources_consulted": sources, "data_points": data_points, "timestamp": datetime.utcnow().isoformat()}

        # 3. Inventory Low Stock & Out of Stock
        if any(w in q for w in ["low stock", "out of stock", "replenish", "stock alert", "replenishment"]):
            crit_lines = []
            for i in out_of_stock_items:
                crit_lines.append(f"• 🔴 **OUT OF STOCK**: **{i['name']}** ({i['item_id']}) — Available: **0 {i['unit']}** (Minimum Threshold: {i['minimum_stock_level']}) | Mfg: {i['manufacturer']}")
            for i in low_stock_items:
                crit_lines.append(f"• 🟡 **LOW STOCK**: **{i['name']}** ({i['item_id']}) — Available: **{i['available_stock']} {i['unit']}** (Minimum Threshold: {i['minimum_stock_level']}) | Mfg: {i['manufacturer']}")

            if not crit_lines:
                reply = "Good news. All monitored hospital implants and surgical sets are currently operating at **Normal Stock** levels above their safety thresholds."
            else:
                reply = (
                    f"**Urgent Inventory Attention Summary ({len(out_of_stock_items)} Out of Stock, {len(low_stock_items)} Low Stock):**\n\n"
                    + "\n".join(crit_lines) +
                    f"\n\n*Automated LOW_STOCK management alerts have been dispatched to `management@stjude-health.org`. Replenishment orders should be verified with central procurement.*"
                )
            return {"reply": reply, "sources_consulted": sources, "data_points": data_points, "timestamp": datetime.utcnow().isoformat()}

        # 4. Inventory Overview / Summary
        if any(w in q for w in ["inventory", "stock level", "all items", "catalog", "supplies"]):
            summary_lines = [
                f"• **{i['name']}** ({i['item_id']}): Available: **{i['available_stock']} {i['unit']}** (Min: {i['minimum_stock_level']}) — Status: `{i['stock_status']}` | Model: {i['product_model']}"
                for i in inventory_items[:6]
            ]
            reply = (
                f"**Hospital Operations Inventory Summary:**\n\n"
                f"• Total Monitored Catalog Items: **{len(inventory_items)}**\n"
                f"• Normal Stock: **{len(normal_items)} items**\n"
                f"• Low Stock (Threshold Alert): **{len(low_stock_items)} items**\n"
                f"• Out of Stock (Critical): **{len(out_of_stock_items)} items**\n\n"
                f"**Live Stock Snapshot:**\n" + "\n".join(summary_lines)
            )
            return {"reply": reply, "sources_consulted": sources, "data_points": data_points, "timestamp": datetime.utcnow().isoformat()}

        # 5. Cases Requiring Inventory Attention / Implants for Case
        if any(w in q for w in ["require inventory attention", "candidate", "implant", "model"]):
            crit_case_lines = []
            for c in cases:
                for cand in c.get("candidates", []):
                    if cand.get("stock_status") in ("Low Stock", "Out of Stock"):
                        crit_case_lines.append(
                            f"• **Case {c['case_id']}** ({c['patient_full_name']}): Candidate **{cand['implant_name']}** has `{cand['stock_status']}` ({cand['available_stock']} on hand vs {cand['minimum_stock_level']} min threshold)."
                        )
                        break
            if not crit_case_lines:
                reply = "No scheduled patient cases are currently blocked by out-of-stock candidate implants."
            else:
                reply = (
                    f"**Scheduled Cases With Inventory Attention Alerts:**\n\n"
                    + "\n".join(crit_case_lines) +
                    "\n\n*Assigned surgeons and hospital logistics have been notified to review backup sizes or expedite replenishment prior to scheduled incision.*"
                )
            return {"reply": reply, "sources_consulted": sources, "data_points": data_points, "timestamp": datetime.utcnow().isoformat()}

        # 6. Default Hospital Operations Briefing
        reply = (
            f"Hello {user_name}. I am the **SURGREADY Management Assistant**.\n\n"
            f"Here is your real-time hospital operations overview for **{hospital_id}**:\n\n"
            f"• **Patient Cases:** **{total_cases} total cases** recorded ({len(pending_review_cases)} awaiting surgeon review).\n"
            f"• **Inventory Status:** **{len(inventory_items)} tracked devices** | 🟡 **{len(low_stock_items)} Low Stock** | 🔴 **{len(out_of_stock_items)} Out of Stock**.\n"
            f"• **Alerts:** Automated alerts active and routed to `management@stjude-health.org`.\n\n"
            f"You can ask me specific questions like:\n"
            f"- *'How many patient cases are scheduled this week?'*\n"
            f"- *'Which implants are low in stock or out of stock?'*\n"
            f"- *'Show pending surgeon reviews.'*\n"
            f"- *'Which cases require inventory attention?'*"
        )
        return {
            "reply": reply,
            "sources_consulted": sources,
            "data_points": data_points,
            "timestamp": datetime.utcnow().isoformat()
        }

management_chatbot_service = ManagementChatbotService()

