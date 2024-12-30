// components/Footer.tsx
import { Layout, Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Link } = Typography;

export const Footer = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center',
      background: '#f0f2f5',
      marginTop: '24px'
    }}>
      <div>
        Created by suxing{' '}
        <Link href="https://github.com/SUXUING-star/ai-img" target="_blank">
          <GithubOutlined style={{ fontSize: '20px', marginLeft: '8px' }} />
        </Link>
      </div>
    </AntFooter>
  );
};

