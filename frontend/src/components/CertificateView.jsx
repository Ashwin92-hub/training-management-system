import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer, ShieldCheck, Award } from 'lucide-react';

const CertificateView = ({ certificate }) => {
  const certRef = useRef(null);

  if (!certificate) return null;

  const formattedDate = new Date(certificate.issue_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate-${certificate.participant_name.replace(/\s+/g, '_')}-${certificate.id}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* Top Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px' }}>
        <button onClick={handleDownloadPDF} className="btn btn-primary">
          <Download size={18} /> Download PDF Certificate
        </button>
        <button onClick={handlePrint} className="btn btn-secondary">
          <Printer size={18} /> Print
        </button>
      </div>

      {/* Printable Certificate Frame */}
      <div ref={certRef} className="certificate-frame">
        <div className="certificate-border-inner">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: 800, fontSize: '1.2rem' }}>
              <Award size={28} /> ApexLMS Academy
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Credential ID: <strong style={{ color: '#0f172a' }}>{certificate.id}</strong>
            </div>
          </div>

          <span style={{
            fontSize: '0.85rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#6366f1',
            fontWeight: 700
          }}>
            OFFICIAL CERTIFICATE OF COMPLETION
          </span>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '15px 0 10px 0',
            fontFamily: 'serif'
          }}>
            This is proudly presented to
          </h1>

          <div style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#4338ca',
            borderBottom: '2px solid #cbd5e1',
            display: 'inline-block',
            paddingBottom: '8px',
            margin: '10px 0 20px 0',
            paddingLeft: '30px',
            paddingRight: '30px'
          }}>
            {certificate.participant_name}
          </div>

          <p style={{ fontSize: '1.05rem', color: '#475569', maxWdith: '600px', margin: '0 auto 20px auto' }}>
            For successfully completing the comprehensive training course and passing all required module examinations for:
          </p>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#0f172a', marginBottom: '25px' }}>
            "{certificate.course_name}"
          </h2>

          {/* Certificate Metadata Footer */}
          <div style={{
            display: 'flex',
            justify: 'space-around',
            alignItems: 'center',
            marginTop: '35px',
            paddingTop: '25px',
            borderTop: '1px dashed #cbd5e1'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Date Issued</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{formattedDate}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '4px',
                boxShadow: '0 4px 10px rgba(99,102,241,0.3)'
              }}>
                <ShieldCheck size={32} />
              </div>
              <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>VERIFIED CREDENTIAL</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Final Aggregate Score</span>
              <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{certificate.final_score}%</strong>
            </div>
          </div>

          <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#94a3b8' }}>
            Verification Code: {certificate.verification_code}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
