const sharp = require('sharp');

export default async function handler(req, res) {
  // CORS 헤더 설정 (더 명시적으로)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { base64 } = req.body;
    
    if (!base64) {
      res.status(400).json({ error: 'base64 필드가 필요합니다' });
      return;
    }

    // Base64를 Buffer로 변환
    const imageBuffer = Buffer.from(base64, 'base64');

    // Sharp를 사용해 HEIC/JPG/PNG → JPG로 변환
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

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
    res.status(500).json({
      error: '이미지 변환 실패',
      message: error.message
    });
  }
}
