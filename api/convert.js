const sharp = require('sharp');

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(400).json({ 
      error: 'POST 요청만 허용됩니다',
      method: req.method 
    });
  }

  try {
    const { base64 } = req.body;
    
    if (!base64) {
      return res.status(400).json({ 
        error: 'base64 필드가 필요합니다' 
      });
    }

    console.log('📥 이미지 변환 요청');

    // Base64를 Buffer로 변환
    const imageBuffer = Buffer.from(base64, 'base64');

    // Sharp를 사용해 HEIC/JPG/PNG → JPG로 변환
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    console.log('✓ JPEG 변환 완료');

    // 변환된 이미지를 Base64로 인코딩
    const jpegBase64 = jpegBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${jpegBase64}`;

    res.status(200).json({
      success: true,
      base64: jpegBase64,
      dataUrl: dataUrl,
      sizeKB: (jpegBuffer.length / 1024).toFixed(2)
    });

  } catch (error) {
    console.error('❌ 변환 오류:', error);
    res.status(500).json({
      error: '이미지 변환 실패',
      message: error.message
    });
  }
}
