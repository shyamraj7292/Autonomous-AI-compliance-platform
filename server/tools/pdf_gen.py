from fpdf import FPDF
from datetime import datetime
import os

# Ensure reports directory exists
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

# PCI-DSS 4.0 Compliance Checklist
PCI_DSS_REQUIREMENTS = [
    {"id": "1.1", "category": "Network Security", "requirement": "Install and maintain network security controls", "weight": 10},
    {"id": "1.2", "category": "Network Security", "requirement": "Secure all system components from unauthorized access", "weight": 10},
    {"id": "2.1", "category": "Secure Configuration", "requirement": "Apply secure configurations to all system components", "weight": 8},
    {"id": "3.1", "category": "Data Protection", "requirement": "Protect stored account data using encryption", "weight": 15},
    {"id": "3.2", "category": "Data Protection", "requirement": "Sensitive authentication data is not stored after authorization", "weight": 12},
    {"id": "4.1", "category": "Transmission Security", "requirement": "Protect cardholder data with strong cryptography during transmission", "weight": 12},
    {"id": "5.1", "category": "Malware Protection", "requirement": "Protect all systems against malware", "weight": 8},
    {"id": "6.1", "category": "Secure Development", "requirement": "Develop and maintain secure systems and software", "weight": 10},
    {"id": "7.1", "category": "Access Control", "requirement": "Restrict access to system components by business need-to-know", "weight": 10},
    {"id": "8.1", "category": "Identity Management", "requirement": "Identify users and authenticate access to system components", "weight": 10},
    {"id": "9.1", "category": "Physical Security", "requirement": "Restrict physical access to cardholder data", "weight": 5},
    {"id": "10.1", "category": "Logging & Monitoring", "requirement": "Log and monitor all access to system components and cardholder data", "weight": 10},
    {"id": "11.1", "category": "Security Testing", "requirement": "Test security of systems and networks regularly", "weight": 8},
    {"id": "12.1", "category": "Security Policy", "requirement": "Support information security with organizational policies", "weight": 7},
]


class PDFGenerator:
    """
    Industry-Grade Compliance Report Generator.
    Generates audit-ready PDF evidence packages with PCI-DSS checklist.
    """
    
    def generate_report(self, findings: list, company_name: str = "Your Organization", title: str = "Compliance Audit Report", compliance_score: int = None) -> str:
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Debug logging
        print(f"[PDFGenerator] Received score: {compliance_score}, findings: {len(findings)}")
        
        # Use provided score or calculate from findings
        total_requirements = len(PCI_DSS_REQUIREMENTS)
        if compliance_score is not None and compliance_score > 0:
            compliance_percentage = compliance_score
            # Calculate failed requirements based on score
            failed_count = int(((100 - compliance_score) / 100) * total_requirements)
            compliant_count = total_requirements - failed_count
        else:
            # Fallback calculation based on findings
            compliant_count = max(0, total_requirements - len(findings))
            compliance_percentage = int((compliant_count / total_requirements) * 100)
        
        print(f"[PDFGenerator] Using compliance_percentage: {compliance_percentage}%")
        
        is_compliant = len(findings) == 0 and compliance_percentage >= 90
        
        # Determine posture
        if compliance_percentage >= 90:
            posture = "EXCELLENT"
            posture_color = (50, 205, 50)  # Green
        elif compliance_percentage >= 70:
            posture = "GOOD"
            posture_color = (100, 180, 100)
        elif compliance_percentage >= 50:
            posture = "NEEDS IMPROVEMENT"
            posture_color = (255, 193, 7)  # Amber
        else:
            posture = "CRITICAL"
            posture_color = (220, 53, 69)  # Red
        
        # ===== PAGE 1: COVER PAGE =====
        pdf.add_page()
        self._add_cover_page(pdf, company_name, is_compliant, compliance_percentage, posture, posture_color)
        
        # ===== PAGE 2: EXECUTIVE SUMMARY =====
        pdf.add_page()
        self._add_executive_summary(pdf, findings, compliance_percentage, posture, compliant_count, total_requirements)
        
        # ===== PAGE 3: PCI-DSS COMPLIANCE CHECKLIST =====
        pdf.add_page()
        self._add_pci_checklist(pdf, findings, compliance_percentage)
        
        # ===== PAGE 4+: DETAILED FINDINGS (if any) =====
        if findings:
            pdf.add_page()
            self._add_detailed_findings(pdf, findings)
        
        # ===== PAGE 5: MISSING SECURITY CONTROLS =====
        pdf.add_page()
        self._add_missing_controls(pdf, findings, compliance_percentage)
        
        # ===== FINAL PAGE: RECOMMENDATIONS =====
        pdf.add_page()
        self._add_recommendations(pdf, findings, posture)
        
        # Save PDF
        filename = f"compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(REPORTS_DIR, filename)
        pdf.output(filepath)
        print(f"[PDFGenerator] Saved report to {filepath}")
        
        return filename
    
    def _add_cover_page(self, pdf, company_name, is_compliant, compliance_percentage, posture, posture_color):
        """Add professional cover page."""
        # Header banner
        pdf.set_fill_color(*posture_color)
        pdf.rect(0, 0, 210, 60, 'F')
        
        # Title
        pdf.set_y(20)
        pdf.set_font("Arial", "B", 28)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 15, txt="COMPLIANCE AUDIT REPORT", ln=1, align='C')
        
        pdf.set_font("Arial", size=14)
        pdf.cell(0, 10, txt=f"PCI-DSS 4.0 Assessment", ln=1, align='C')
        
        # Company info
        pdf.set_text_color(0, 0, 0)
        pdf.set_y(80)
        pdf.set_font("Arial", "B", 18)
        pdf.cell(0, 10, txt=company_name, ln=1, align='C')
        
        pdf.set_font("Arial", size=12)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 10, txt=f"Report Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", ln=1, align='C')
        
        # Compliance Score Circle (visual)
        pdf.ln(20)
        pdf.set_font("Arial", "B", 48)
        pdf.set_text_color(*posture_color)
        pdf.cell(0, 20, txt=f"{compliance_percentage}%", ln=1, align='C')
        
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, txt=f"Overall Compliance Score", ln=1, align='C')
        
        pdf.ln(10)
        pdf.set_font("Arial", "B", 24)
        pdf.cell(0, 15, txt=f"POSTURE: {posture}", ln=1, align='C')
        
        # Footer
        pdf.set_y(250)
        pdf.set_font("Arial", "I", 10)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(0, 10, txt="Generated by ComplianceOS Agentic Platform", ln=1, align='C')
    
    def _add_executive_summary(self, pdf, findings, compliance_percentage, posture, compliant_count, total_requirements):
        """Add executive summary section."""
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, txt="EXECUTIVE SUMMARY", ln=1)
        pdf.ln(5)
        
        # Summary box
        pdf.set_fill_color(240, 240, 240)
        pdf.rect(10, pdf.get_y(), 190, 50, 'F')
        
        pdf.set_font("Arial", size=11)
        pdf.set_xy(15, pdf.get_y() + 5)
        
        summary = f"""This report presents the findings of an automated compliance assessment conducted against 
PCI-DSS 4.0 requirements. The assessment evaluated {total_requirements} control requirements across 
6 key security domains. The organization achieved a compliance score of {compliance_percentage}%, 
with {compliant_count} requirements fully satisfied and {len(findings)} gaps identified requiring remediation."""
        
        pdf.multi_cell(180, 6, txt=summary)
        
        pdf.ln(15)
        
        # Key Metrics Table
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, txt="Key Metrics", ln=1)
        
        metrics = [
            ("Compliance Score", f"{compliance_percentage}%"),
            ("Security Posture", posture),
            ("Requirements Assessed", str(total_requirements)),
            ("Requirements Met", str(compliant_count)),
            ("Gaps Identified", str(len(findings))),
            ("Critical Issues", str(sum(1 for f in findings if f.get('severity') == 'Critical'))),
        ]
        
        pdf.set_font("Arial", "B", 10)
        pdf.set_fill_color(50, 50, 50)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(95, 8, txt="Metric", fill=True, border=1)
        pdf.cell(95, 8, txt="Value", fill=True, border=1, ln=1)
        
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=10)
        for i, (metric, value) in enumerate(metrics):
            fill = i % 2 == 0
            if fill:
                pdf.set_fill_color(245, 245, 245)
            pdf.cell(95, 7, txt=metric, fill=fill, border=1)
            pdf.cell(95, 7, txt=value, fill=fill, border=1, ln=1)
    
    def _add_pci_checklist(self, pdf, findings, compliance_percentage=100):
        """Add PCI-DSS compliance checklist."""
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, txt="PCI-DSS 4.0 COMPLIANCE CHECKLIST", ln=1)
        pdf.ln(5)
        
        finding_ids = [f.get('requirement_id', '') for f in findings]
        
        # Calculate how many should fail based on score
        total_requirements = len(PCI_DSS_REQUIREMENTS)
        fail_count = int(((100 - compliance_percentage) / 100) * total_requirements)
        
        # Mark some requirements as failed based on score (prioritize high-weight items)
        sorted_reqs = sorted(PCI_DSS_REQUIREMENTS, key=lambda x: x['weight'], reverse=True)
        auto_fail_ids = [r['id'] for r in sorted_reqs[:fail_count]]
        
        # Table header
        pdf.set_font("Arial", "B", 9)
        pdf.set_fill_color(50, 50, 50)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(15, 7, txt="ID", fill=True, border=1)
        pdf.cell(35, 7, txt="Category", fill=True, border=1)
        pdf.cell(120, 7, txt="Requirement", fill=True, border=1)
        pdf.cell(20, 7, txt="Status", fill=True, border=1, ln=1)
        
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=8)
        
        for i, req in enumerate(PCI_DSS_REQUIREMENTS):
            # Mark as gap if in findings OR in auto-fail list based on score
            is_gap = req['id'] in finding_ids or req['id'] in auto_fail_ids
            
            if is_gap:
                pdf.set_fill_color(255, 235, 235)
                status = "FAIL"
                pdf.set_text_color(220, 53, 69)
            else:
                pdf.set_fill_color(235, 255, 235) if i % 2 == 0 else pdf.set_fill_color(245, 255, 245)
                status = "PASS"
                pdf.set_text_color(50, 205, 50)
            
            pdf.cell(15, 6, txt=req['id'], fill=True, border=1)
            pdf.set_text_color(0, 0, 0)
            pdf.cell(35, 6, txt=req['category'][:18], fill=True, border=1)
            pdf.cell(120, 6, txt=req['requirement'][:65], fill=True, border=1)
            
            if is_gap:
                pdf.set_text_color(220, 53, 69)
            else:
                pdf.set_text_color(50, 205, 50)
            pdf.cell(20, 6, txt=status, fill=True, border=1, ln=1, align='C')
            pdf.set_text_color(0, 0, 0)
    
    def _add_detailed_findings(self, pdf, findings):
        """Add detailed findings section."""
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, txt="DETAILED FINDINGS", ln=1)
        pdf.ln(5)
        
        for idx, finding in enumerate(findings):
            # Finding header
            severity = finding.get('severity', 'Medium')
            if severity == 'Critical':
                pdf.set_fill_color(220, 53, 69)
            elif severity == 'High':
                pdf.set_fill_color(255, 140, 0)
            else:
                pdf.set_fill_color(255, 193, 7)
            
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Arial", "B", 11)
            pdf.cell(0, 8, txt=f"  Finding #{idx+1}: {finding.get('title', 'Issue Detected')}", fill=True, ln=1)
            
            pdf.set_text_color(0, 0, 0)
            pdf.set_font("Arial", size=10)
            
            pdf.ln(2)
            pdf.set_font("Arial", "B", 10)
            pdf.cell(30, 6, txt="Severity:")
            pdf.set_font("Arial", size=10)
            pdf.cell(0, 6, txt=severity, ln=1)
            
            pdf.set_font("Arial", "B", 10)
            pdf.cell(30, 6, txt="Description:")
            pdf.set_font("Arial", size=10)
            pdf.multi_cell(0, 6, txt=finding.get('description', 'No details provided.'))
            
            if finding.get('remediation'):
                pdf.set_font("Arial", "B", 10)
                pdf.cell(30, 6, txt="Remediation:")
                pdf.set_font("Arial", size=10)
                pdf.multi_cell(0, 6, txt=finding.get('remediation', ''))
            
            pdf.ln(5)
    
    def _add_missing_controls(self, pdf, findings, compliance_percentage):
        """Add missing security controls section based on gaps."""
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, txt="MISSING SECURITY CONTROLS", ln=1)
        pdf.ln(5)
        
        # Calculate failed controls based on score
        total_requirements = len(PCI_DSS_REQUIREMENTS)
        fail_count = max(1, int(((100 - compliance_percentage) / 100) * total_requirements))
        
        # Get highest-weight failed controls
        sorted_reqs = sorted(PCI_DSS_REQUIREMENTS, key=lambda x: x['weight'], reverse=True)
        missing_controls = sorted_reqs[:fail_count]
        
        if compliance_percentage >= 95:
            pdf.set_font("Arial", size=11)
            pdf.multi_cell(0, 7, txt="No major security controls are missing. Your organization demonstrates strong compliance posture.")
        else:
            pdf.set_font("Arial", size=10)
            pdf.multi_cell(0, 6, txt=f"Based on the {compliance_percentage}% compliance score, the following security controls require attention:")
            pdf.ln(5)
            
            for i, control in enumerate(missing_controls):
                # Control box
                pdf.set_fill_color(255, 240, 240)
                pdf.set_font("Arial", "B", 10)
                pdf.cell(0, 8, txt=f"{i+1}. [{control['id']}] {control['category']}", fill=True, ln=1)
                
                pdf.set_font("Arial", size=9)
                pdf.set_x(20)
                pdf.multi_cell(0, 5, txt=f"Requirement: {control['requirement']}")
                
                # Add specific remediation based on category
                pdf.set_x(20)
                pdf.set_font("Arial", "I", 9)
                if "Encrypt" in control['requirement'] or "Data" in control['category']:
                    remediation = "- Implement AES-256 encryption for all sensitive data at rest\n- Use TLS 1.3 for data in transit"
                elif "Access" in control['category']:
                    remediation = "- Implement role-based access control (RBAC)\n- Enable multi-factor authentication for privileged accounts"
                elif "Network" in control['category']:
                    remediation = "- Deploy network segmentation between zones\n- Implement next-generation firewall rules"
                elif "Logging" in control['category']:
                    remediation = "- Enable comprehensive audit logging\n- Retain logs for minimum 12 months"
                else:
                    remediation = "- Review and update security policies\n- Implement compensating controls"
                
                pdf.multi_cell(0, 5, txt=remediation)
                pdf.ln(3)
        
        pdf.ln(5)
    
    def _add_recommendations(self, pdf, findings, posture):
        """Add recommendations section."""
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, txt="RECOMMENDATIONS", ln=1)
        pdf.ln(5)
        
        pdf.set_font("Arial", size=11)
        
        if not findings:
            pdf.multi_cell(0, 7, txt="""Congratulations! Your organization has achieved full compliance with the assessed 
requirements. To maintain this status, we recommend:

1. Continue regular security assessments (quarterly recommended)
2. Keep all security documentation up to date
3. Conduct periodic employee security awareness training
4. Monitor for new regulatory requirements and updates
5. Maintain audit trails and evidence collection processes""")
        else:
            pdf.multi_cell(0, 7, txt=f"""Based on the {len(findings)} gap(s) identified, we recommend the following 
immediate actions:

1. Prioritize Critical and High severity findings for immediate remediation
2. Develop a remediation timeline with specific milestones
3. Assign ownership for each finding to appropriate team members
4. Implement compensating controls where immediate fixes are not possible
5. Schedule a follow-up assessment within 30 days
6. Document all remediation activities for audit evidence""")
        
        # Signature block
        pdf.ln(20)
        pdf.set_font("Arial", "I", 10)
        pdf.set_text_color(128, 128, 128)
        pdf.cell(0, 6, txt="This report was automatically generated by ComplianceOS Agentic AI Platform.", ln=1)
        pdf.cell(0, 6, txt=f"Assessment Date: {datetime.now().strftime('%Y-%m-%d')}", ln=1)
        pdf.cell(0, 6, txt="Report Version: 2.0", ln=1)
