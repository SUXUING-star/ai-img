// components/Header.tsx
'use client';
import { Layout, Typography, Image } from 'antd';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export const Header = () => {
  return (
    <AntHeader style={{ 
      background: '#fff', 
      padding: '20px 50px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '24px',
      height: 'auto'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Title level={3} style={{ margin: '16px 0' }}>
          AI Image Generator
        </Title>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Image
            src="/header.png"
            alt="Header Image"
            style={{ 
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
            preview={false}
          />
        </div>
      </div>
    </AntHeader>
  );
};