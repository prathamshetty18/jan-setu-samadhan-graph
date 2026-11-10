from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import Department, Ward, JurisdictionRule

# Standard Default Civic Department Mappings
CATEGORY_TO_DEPT_CODE = {
    "Water Supply": "WATER_DEPT",
    "Roads": "PWD_DEPT",
    "Electricity": "ELEC_DEPT",
    "Waste Management": "SANIT_DEPT",
    "Drainage": "DRAIN_DEPT",
    "Public Safety": "SAFETY_DEPT",
    "Other": "PWD_DEPT"
}

CATEGORY_SUPPORTING_DEPT = {
    "Drainage": "SANIT_DEPT",       # Sanitation supports Drainage during overflows
    "Water Supply": "DRAIN_DEPT",    # Drainage supports major water pipeline leaks
    "Roads": "ELEC_DEPT",           # Electricity supports street lighting during roadwork
    "Public Safety": "ELEC_DEPT",    # Electricity supports dark street lighting
}

def determine_department_recommendation(
    db: Session,
    category: str,
    ward_id: Optional[int] = None,
    locality: Optional[str] = None
) -> Tuple[Optional[int], Optional[int], str, str]:
    """
    Transparent, rule-based recommendation engine adhering strictly to
    verified municipal jurisdiction mappings.
    Returns: (primary_dept_id, supporting_dept_id, routing_reason, ward_mapping_used)
    """
    # 1. Check for specific Ward-level Jurisdiction Rule override
    if ward_id:
        ward_rule = db.query(JurisdictionRule).filter(
            JurisdictionRule.category == category,
            JurisdictionRule.ward_id == ward_id,
            JurisdictionRule.is_active == True
        ).first()

        if ward_rule:
            reason = f"Ward {ward_rule.ward.ward_number} specific jurisdiction rule: {ward_rule.rule_description or 'Zonal municipal charter assignment'}."
            return (
                ward_rule.primary_department_id,
                ward_rule.supporting_department_id,
                reason,
                f"Ward {ward_rule.ward.ward_number} ({ward_rule.ward.name})"
            )

    # 2. Check general category jurisdiction rule
    general_rule = db.query(JurisdictionRule).filter(
        JurisdictionRule.category == category,
        JurisdictionRule.ward_id.is_(None),
        JurisdictionRule.is_active == True
    ).first()

    if general_rule:
        reason = f"Standard civic jurisdiction rule for '{category}': {general_rule.rule_description or 'Municipal Corporation allocation'}."
        ward_info = f"Ward ID {ward_id}" if ward_id else "City-wide standard"
        return (
            general_rule.primary_department_id,
            general_rule.supporting_department_id,
            reason,
            ward_info
        )

    # 3. Fallback to standard department by category code
    dept_code = CATEGORY_TO_DEPT_CODE.get(category, "PWD_DEPT")
    dept = db.query(Department).filter(Department.code == dept_code).first()

    supporting_dept_id = None
    supp_code = CATEGORY_SUPPORTING_DEPT.get(category)
    if supp_code:
        supp_dept = db.query(Department).filter(Department.code == supp_code).first()
        if supp_dept:
            supporting_dept_id = supp_dept.id

    if dept:
        reason = f"Automated routing based on verified municipal jurisdiction chart for category '{category}'."
        ward_info = f"Ward ID {ward_id}" if ward_id else "General Locality"
        return (dept.id, supporting_dept_id, reason, ward_info)

    # 4. If no department found, send for human review
    first_dept = db.query(Department).first()
    return (
        first_dept.id if first_dept else None,
        None,
        "Unmapped category or ambiguous ward. Flagged for Human Officer Review.",
        "Pending Verification"
    )

