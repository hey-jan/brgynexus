import * as React from 'react';

interface RequestEmailProps {
  firstName: string;
  documentName: string;
  status: string;
  docNumber?: string;
}

export const RequestEmail: React.FC<Readonly<RequestEmailProps>> = ({
  firstName,
  documentName,
  status,
  docNumber,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333', padding: '20px' }}>
    <h1 style={{ color: '#2563eb' }}>BrgyNexus Update</h1>
    <p>Hi <strong>{firstName}</strong>,</p>
    <p>
      Your request for <strong>{documentName}</strong> is now: 
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '4px', 
        backgroundColor: status === 'RELEASED' ? '#dcfce7' : '#dbeafe',
        color: status === 'RELEASED' ? '#166534' : '#1e40af',
        fontWeight: 'bold',
        marginLeft: '5px'
      }}>
        {status}
      </span>
    </p>
    
    {status === 'RELEASED' && docNumber && (
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <p style={{ margin: 0 }}><strong>Document Number:</strong> {docNumber}</p>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          You can now pick up your document at the Barangay Hall. Please bring a valid ID and your reference number.
        </p>
      </div>
    )}

    <p style={{ marginTop: '30px', fontSize: '12px', color: '#9ca3af' }}>
      This is an automated notification from BrgyNexus. Please do not reply to this email.
    </p>
  </div>
);
