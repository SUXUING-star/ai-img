'use client';
import React, { useState, useCallback } from 'react';
import { Card, Input, Button, Select, Alert, Typography, Spin, Row, Col } from 'antd';
import { LoadingOutlined, DownloadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AI_MODELS = [
  {
    value: 'runwayml/stable-diffusion-v1-5',
    label: 'Stable Diffusion v1.5 - 稳定的文生图模型'
  },
  {
    value: 'stabilityai/stable-diffusion-2-1',
    label: 'Stable Diffusion v2.1 - 改进版文生图模型'
  }
];

const HF_API_URL = 'https://api-inference.huggingface.co/models/';

const AIImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].value);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const generateImage = async (retryCount = 0) => {
    const apiKey = process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY;
    if (!apiKey) {
      console.error('API key not found');
      setError('API key not configured');
      return;
    }

    setLoading(true);
    setError('');
    setIsModelLoading(false);

    try {
      const response = await fetch(`${HF_API_URL}${selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 50,  // 增加推理步数，默认是30
            guidance_scale: 7.5,      // 可以调整引导比例
            height: 512,              // 明确指定输出尺寸
            width: 512
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if(response.status === 503 && errorData.error && errorData.error.includes("is currently loading")) {
          setIsModelLoading(true);
          if(retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            generateImage(retryCount + 1);
            return;
          } else {
            throw new Error(`API 请求失败: ${response.statusText} - ${JSON.stringify(errorData)}`);
          }
        } else {
          throw new Error(`API 请求失败: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }
      }

      const blob = await response.blob();
      setImageBlob(blob); // 保存 blob 用于下载
      const imageUrl = URL.createObjectURL(blob);
      setImageUrl(imageUrl);
    } catch (err: any) {
      setError(`生成失败: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setIsModelLoading(false);
    }
  };

  const handleGenerateImage = useCallback(() => {
    generateImage();
  }, [prompt, selectedModel]);

  const handleDownload = () => {
    if (imageBlob) {
      const url = window.URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={3}>AI 图像生成器</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        使用 Hugging Face 的开源模型生成图片
      </Text>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Hugging Face API Token</Text>
            <Input.Password
              placeholder="请在 .env.local 中配置 Hugging Face API Token"
              disabled={true}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              在 <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">
                Hugging Face Token 页面
              </a> 获取 API Token
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>选择模型</Text>
            <Select
              options={AI_MODELS}
              value={selectedModel}
              onChange={setSelectedModel}
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>图片描述</Text>
            <TextArea
              placeholder="请输入详细的图片描述..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ marginTop: 8 }}
              rows={4}
            />
          </div>
        </Col>
      </Row>

      {error && (
        <Alert
          message={error}
          type="error"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {isModelLoading ? (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <Spin tip="模型正在加载中，请稍后重试..." size="large"/>
        </div>
      ) : (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={imageUrl ? 18 : 24}>
            <Button
              type="primary"
              onClick={handleGenerateImage}
              disabled={loading || !prompt.trim()}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <LoadingOutlined style={{ marginRight: 8 }} />
                  生成中...
                </>
              ) : '生成图片'}
            </Button>
          </Col>
          {imageUrl && (
            <Col span={6}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                style={{ width: '100%' }}
              >
                下载
              </Button>
            </Col>
          )}
        </Row>
      )}

      {imageUrl && (
        <div style={{ 
          marginTop: 16,
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px'
        }}>
          <img
            src={imageUrl}
            alt="AI 生成的图片"
            style={{
              maxWidth: '100%',
              maxHeight: '600px',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            loading="lazy"
          />
        </div>
      )}
    </Card>
  );
};

export default AIImageGenerator;