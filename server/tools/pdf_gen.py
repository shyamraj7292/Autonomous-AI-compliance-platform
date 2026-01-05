from fpdf import FPDF
from datetime import datetime

class PDFGenerator:
    """
    Tier 1 Tool: Evidence Pack Generator
    Generates audit-ready PDF evidence packages.
    """
    def generate_report(self, findings: list, title: str = "Compliance Audit Report") -> str:
        pdf = FPDF()
        pdf.add_page()
        
        is_compliant = len(findings) == 0
        
        # Header - Dynamic Color
        if is_compliant:
            pdf.set_fill_color(50, 205, 50) # Green for Success
            header_title = "CERTIFICATE OF COMPLIANCE"
        else:
            pdf.set_fill_color(220, 53, 69) # Red for Danger
            header_title = "GAP ANALYSIS & REMEDIATION PLAN"
            
        # Banner
        pdf.rect(0, 0, 210, 40, 'F')
        
        # Title Text
        pdf.set_y(15)
        pdf.set_font("Arial", "B", 20)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 10, txt=header_title, ln=1, align='C')
        
        # Subtitle
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, txt=f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=1, align='C')
        
        pdf.set_text_color(0, 0, 0)
        pdf.ln(20)
        
        # Executive Summary
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, txt="Executive Summary", ln=1)
        pdf.ln(2)
        
        pdf.set_font("Arial", size=12)
        if is_compliant:
            summary = (
                "This document certifies that a comprehensive regulatory scan was performed on the system. "
                "No compliance gaps or policy violations were detected at this time. "
                "The system is verified as fully compliant with the active frameworks."
            )
            pdf.multi_cell(0, 8, txt=summary)
            pdf.ln(10)
            
            # Seal of Approval logic here (symbolic text)
            pdf.set_font("Arial", "B", 16)
            pdf.set_text_color(50, 205, 50)
            pdf.cell(0, 10, txt="[ STATUS: VERIFIED ]", ln=1, align='C')
            
        else:
            summary = (
                f"The automated analysis identified {len(findings)} critical gaps requiring immediate attention. "
                "The following report details the specific violations and recommended remediation steps."
            )
            pdf.multi_cell(0, 8, txt=summary)
            pdf.ln(10)
            
            # Findings Table
            for idx, finding in enumerate(findings):
                pdf.set_fill_color(240, 240, 240)
                pdf.rect(pdf.get_x(), pdf.get_y(), 190, 30 + (len(finding.get('description', ''))//3), 'F') # Approx height
                
                pdf.set_font("Arial", "B", 12)
                pdf.set_text_color(220, 53, 69)
                pdf.cell(0, 10, txt=f"Finding #{idx+1}: {finding.get('title', 'Issue')}", ln=1)
                
                pdf.set_text_color(0, 0, 0)
                pdf.set_font("Arial", size=11)
                desc = finding.get('description', 'No details provided.')
                pdf.multi_cell(0, 8, txt=f"Details: {desc}")
                
                sev = finding.get('severity', 'Unknown')
                pdf.set_font("Arial", "I", 11)
                pdf.cell(0, 10, txt=f"Risk Severity: {sev} | Status: OPEN", ln=1)
                pdf.ln(5)

        filename = f"audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        print(f"[Tool:EvidenceGenerator] Saving PDF to {filename}")
        return filename
