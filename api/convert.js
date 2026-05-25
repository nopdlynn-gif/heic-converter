const sharp = require('sharp');

export default async function handler(req, res) {
  // 모든 요청에 대해 CORS 헤더 설정
  const origin = req.headers.origin || '*';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let base64Data = req.body?.base64;

    if (!base64Data) {
      return res.status(400).json({ 
        error: 'base64 데이터가 필요합니다',
        received: Object.keys(req.body || {})
      });
    }

    // Base64 문자열에서 data URL prefix 제거
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }

    console.log('변환 시작:', {
      base64Length: base64Data.length,
      timestamp: new Date().toISOString()
    });

    // Buffer로 변환
    const imageBuffer = Buffer.from(base64Data, 'base64');
    console.log('Buffer 생성:', imageBuffer.length, 'bytes');

    // Sharp로 변환
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ 
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    console.log('변환 완료:', jpegBuffer.length, 'bytes');

    // 결과를 Base64로 인코딩
    const resultBase64 = jpegBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${resultBase64}`;

    return res.status(200).json({
      success: true,
      base64: resultBase64,
      dataUrl: dataUrl,
      sizeKB: (jpegBuffer.length / 1024).toFixed(2),
      originalSizeKB: (imageBuffer.length / 1024).toFixed(2),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('변환 실패:', error);
    
    return res.status(500).json({
      success: false,
      error: '이미지 변환 실패',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
